"use client";
import { useEffect, useRef } from "react";

/* The red trace: a thin line down the page, a node at every section, and a dot at its head
   that fills each node as the reader scrolls. Fully drawn without scripting or with reduced motion. */
export default function TracePage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.dataset.run = "1";
    let nodes: { el: HTMLElement; y: number }[] = [];
    let raf = 0;
    const measure = () => {
      const top = root.getBoundingClientRect().top + window.scrollY;
      nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-node]")).map((el) => ({
        el,
        y: el.getBoundingClientRect().top + window.scrollY - top + el.offsetHeight / 2,
      }));
    };
    const update = () => {
      raf = 0;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const h = root.offsetHeight;
      const head = Math.min(Math.max(window.scrollY + window.innerHeight * 0.62 - top, 0), h);
      root.style.setProperty("--head", `${head.toFixed(1)}px`);
      root.style.setProperty("--p", (head / h).toFixed(4));
      nodes.forEach((n) => {
        n.el.dataset.lit = head >= n.y ? "1" : "0";
      });
    };
    const tick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const remeasure = () => {
      measure();
      tick();
    };
    remeasure();
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", remeasure);
    const ro = new ResizeObserver(remeasure);
    ro.observe(root);
    const late = window.setTimeout(remeasure, 600);
    return () => {
      window.removeEventListener("scroll", tick);
      window.removeEventListener("resize", remeasure);
      ro.disconnect();
      window.clearTimeout(late);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="page" ref={ref}>
      <div className="trace" aria-hidden="true">
        <span className="trace-line" />
        <span className="trace-fill" />
        <span className="trace-dot" />
      </div>
      {children}
    </div>
  );
}
