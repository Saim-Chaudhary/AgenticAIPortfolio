"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { layout, VW, type DiagramSpec } from "@/data/diagrams";

type Phase = "idle" | "drawing" | "running" | "paused" | "static";

/* Break a subtitle onto lines that stay inside the box with room to spare. */
function wrap(text: string, max = 23): string[] {
  const out: string[] = [];
  let line = "";
  text.split(" ").forEach((w) => {
    if (line && (line + " " + w).length > max) {
      out.push(line);
      line = w;
    } else line = line ? line + " " + w : w;
  });
  if (line) out.push(line);
  return out;
}

export default function Diagram({ spec }: { spec: DiagramSpec }) {
  const L = useMemo(() => layout(spec), [spec]);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const figRef = useRef<HTMLElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lit, setLit] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const litRef = useRef<string | null>(null);
  const [run, setRun] = useState(0); // bumps on every replay

  // reduced motion starts paused with everything drawn and lit; otherwise draw when scrolled into view
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("static");
      return;
    }
    const el = figRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setPhase("drawing");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("drawing");
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "drawing") return;
    const id = window.setTimeout(() => setPhase("running"), 1000);
    return () => window.clearTimeout(id);
  }, [phase]);

  // the dot: rests on each entry edge with the box lit, jumps to the next exit edge, never crosses a box
  useEffect(() => {
    if (phase !== "running") return;
    const dot = dotRef.current;
    if (!dot) return;
    const begin = performance.now();
    let raf = 0;
    const setLitNode = (n: string | null) => {
      if (litRef.current !== n) {
        litRef.current = n;
        setLit(n);
      }
    };
    const tick = (now: number) => {
      const t = (((now - begin) / 1000) % L.cycle + L.cycle) % L.cycle;
      const seg = L.timeline.find((s) => t >= s.t0 && t < s.t1) ?? L.timeline[L.timeline.length - 1];
      let x: number;
      let y: number;
      if (seg.kind === "dwell") {
        [x, y] = seg.at;
        setLitNode(seg.node);
      } else {
        const total = seg.cum[seg.cum.length - 1];
        const s = Math.min(Math.max((t - seg.t0) / (seg.t1 - seg.t0), 0), 1) * total;
        let k = 1;
        while (k < seg.cum.length - 1 && seg.cum[k] < s) k++;
        const f = (s - seg.cum[k - 1]) / (seg.cum[k] - seg.cum[k - 1] || 1);
        x = seg.pts[k - 1][0] + (seg.pts[k][0] - seg.pts[k - 1][0]) * f;
        y = seg.pts[k - 1][1] + (seg.pts[k][1] - seg.pts[k - 1][1]) * f;
        setLitNode(null);
      }
      dot.setAttribute("cx", x.toFixed(1));
      dot.setAttribute("cy", y.toFixed(1));
      dot.setAttribute("opacity", "1");
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, run, L]);

  const toggle = () => {
    if (phase === "running") {
      setPhase("paused");
    } else {
      setLit(null);
      litRef.current = null;
      setRun((n) => n + 1);
      setPhase("running");
    }
  };

  const allLit = phase === "static";
  const focus = hover ?? lit;
  const ready = phase === "running" || phase === "paused" || phase === "static";
  const mk = (on: boolean) => `url(#${uid}${on ? "lit" : "ah"})`;

  return (
    <figure className="diagram" ref={figRef} data-phase={phase}>
      <svg
        className="diagram-svg"
        viewBox={`0 0 ${VW} ${spec.height}`}
        role="group"
        aria-label={spec.label}
      >
        <defs>
          <marker id={`${uid}ah`} viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" className="d-ah" />
          </marker>
          <marker id={`${uid}lit`} viewBox="0 0 10 10" refX="9.5" refY="5" markerWidth="11" markerHeight="11" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" className="d-ah d-ah-lit" />
          </marker>
        </defs>

        {L.zones.map((z) => (
          <g key={z.label} className="d-zone" aria-hidden="true">
            <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={6} className="d-zone-box" />
            <text x={z.x + 12} y={z.y + 18} className="d-zone-label">
              {z.label}
            </text>
          </g>
        ))}

        {L.edges.map((e, i) => {
          const on = hover !== null && (e.from === hover || e.to === hover);
          return (
            <path
              key={i}
              d={e.d}
              pathLength={e.dashed ? undefined : 1}
              className={`d-edge${e.dashed ? " d-dashed" : ""}${on ? " on" : ""}`}
              style={{ markerEnd: mk(on) }}
            />
          );
        })}

        {spec.nodes.map((n) => {
          const b = L.boxes[n.id];
          const note = L.notes.find((x) => x.node === n.id);
          const compact = b.h < 70;
          const subs = n.sub ? wrap(n.sub) : [];
          const on = allLit || focus === n.id;
          const num = String(L.numbers[n.id] ?? "").padStart(2, "0");
          const cls = ["d-node", n.fail ? "d-fail" : "", n.key ? "d-key" : "", on ? "lit" : ""].filter(Boolean).join(" ");
          const name = `Step ${Number(num)}, ${n.label}${n.sub ? ", " + n.sub : ""}${note ? ". " + note.lines.join(" ") : ""}`;
          return (
            <g
              key={n.id}
              className={cls}
              tabIndex={0}
              role="img"
              aria-label={name}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(n.id)}
              onBlur={() => setHover(null)}
            >
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={3} className="d-box" />
              <text x={b.x + 12} y={b.y + 17} className="d-num">
                {num}
              </text>
              <text x={b.x + 14} y={b.y + (compact ? 37 : 41)} className="d-label">
                {n.label}
              </text>
              {subs.map((t, i) => (
                <text key={i} x={b.x + 14} y={b.y + (compact ? 55 : 59) + i * 15} className="d-sub">
                  {t}
                </text>
              ))}
            </g>
          );
        })}

        {L.notes.map((n, i) => (
          <g key={i} className={focus === n.node && !allLit ? "d-note d-note-red" : "d-note"} aria-hidden="true">
            <line x1={n.pinX} y1={n.pinY} x2={n.endX} y2={n.endY} className="d-leader" />
            <circle cx={n.pinX} cy={n.pinY} r={3} className="d-pin" />
            <text x={n.x} y={n.y} textAnchor={n.anchor as "start" | "middle" | "end"} className="d-note-text">
              {n.lines.map((t, j) => (
                <tspan key={j} x={n.x} dy={j === 0 ? 0 : 16}>
                  {t}
                </tspan>
              ))}
            </text>
          </g>
        ))}

        <circle ref={dotRef} r={5} cx={0} cy={0} className="d-dot" opacity="0" aria-hidden="true" style={{ display: phase === "running" || phase === "paused" ? undefined : "none" }} />
      </svg>

      <div className="d-ctl-row">
        <button type="button" className="d-ctl" onClick={toggle} disabled={!ready}>
          {phase === "running" ? "Pause" : "Replay"}
        </button>
      </div>

      <ol className="steps">
        {spec.steps.map((s, i) => (
          <li key={i} style={{ "--i": i, "--n": spec.steps.length } as React.CSSProperties}>
            <span className="steps-n num">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="steps-label">{s.label}</p>
              {s.sub && <p className="steps-sub">{s.sub}</p>}
              {s.items && (
                <ul className="steps-items">
                  {s.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
      {spec.loopNote && <figcaption className="loop-note">{spec.loopNote}</figcaption>}
    </figure>
  );
}
