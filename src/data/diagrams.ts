export type Side = "top" | "bottom" | "left" | "right";
export type Via = "hv" | "vh" | "hvh";

export type DNode = {
  id: string;
  c: number;
  r?: number;
  y?: number; // an absolute y in viewBox units, in place of a row
  label: string;
  sub?: string;
  h?: number;
  fail?: boolean;
  key?: boolean; // carries the main idea: a heavier outline
};
export type Hop = { from: string; to: string; via?: Via; lane?: number; dashed?: boolean };
export type Note = {
  node: string;
  side: Side;
  len?: number;
  ox?: number;
  lines: string[];
  align?: "start" | "middle" | "end";
  tone?: "red" | "rose";
};
export type Zone = { label: string; nodes: string[] };
export type Step = { label: string; sub?: string; note?: string; items?: string[] };
export type DiagramSpec = {
  label: string;
  height: number;
  nodes: DNode[];
  routes: Hop[][];
  extra?: Hop[];
  zones?: Zone[];
  notes: Note[];
  steps: Step[];
  loopNote?: string;
};

export const VW = 1020; // viewBox width
export const GEO = { x0: 26, px: 260, y0: 40, py: 180, w: 192, h: 84 };
export const SPEED = 170; // viewBox units per second
export const START = 0.5; // seconds the dot rests on the first box before a route
export const DWELL = 0.8; // seconds the dot rests on each entry edge, with the box lit
export const END_EXTRA = 0.8; // extra rest at the end of a route

type Box = { x: number; y: number; w: number; h: number };
type Pt = [number, number];

export function boxOf(n: DNode): Box {
  return {
    x: GEO.x0 + n.c * GEO.px,
    y: n.y ?? GEO.y0 + (n.r ?? 0) * GEO.py,
    w: GEO.w,
    h: n.h ?? GEO.h,
  };
}

export function hopPoints(a: Box, b: Box, via: Via | undefined, lane = 0): Pt[] {
  const acx = a.x + a.w / 2;
  const acy = a.y + a.h / 2;
  const bcx = b.x + b.w / 2;
  const bcy = b.y + b.h / 2;
  if (!via) {
    if (Math.abs(acy - bcy) < 1) {
      const y = acy + lane;
      return bcx > acx ? [[a.x + a.w, y], [b.x, y]] : [[a.x, y], [b.x + b.w, y]];
    }
    if (Math.abs(acx - bcx) < 1) {
      const x = acx + lane;
      return bcy > acy ? [[x, a.y + a.h], [x, b.y]] : [[x, a.y], [x, b.y + b.h]];
    }
    via = "hv";
  }
  if (via === "hv") {
    const sx = bcx > acx ? a.x + a.w : a.x;
    const sy = acy + lane;
    const ex = bcx + lane;
    const ey = bcy > acy ? b.y : b.y + b.h;
    return [[sx, sy], [ex, sy], [ex, ey]];
  }
  if (via === "vh") {
    const sy = bcy > acy ? a.y + a.h : a.y;
    const sx = acx + lane;
    const ey = bcy + lane;
    const ex = bcx > acx ? b.x : b.x + b.w;
    return [[sx, sy], [sx, ey], [ex, ey]];
  }
  const sx = bcx > acx ? a.x + a.w : a.x;
  const ex = bcx > acx ? b.x : b.x + b.w;
  const mx = (sx + ex) / 2 + lane;
  return [[sx, acy], [mx, acy], [mx, bcy], [ex, bcy]];
}

const d = (pts: Pt[]) => pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ");

/* The dot's timeline: it rests on a box's entry edge (the box lights up), then jumps to the next hop's
   start on the exit edge. It never crosses a box, so it is never near a box's text. */
export type Seg =
  | { kind: "move"; t0: number; t1: number; pts: Pt[]; cum: number[] }
  | { kind: "dwell"; t0: number; t1: number; at: Pt; node: string };

export type Laid = {
  boxes: Record<string, Box>;
  edges: { d: string; dashed: boolean; from: string; to: string }[];
  timeline: Seg[];
  cycle: number;
  numbers: Record<string, number>;
  zones: { x: number; y: number; w: number; h: number; label: string }[];
  notes: { node: string; x: number; y: number; pinX: number; pinY: number; endX: number; endY: number; lines: string[]; anchor: string; side: Side }[];
};

export function layout(spec: DiagramSpec): Laid {
  const boxes: Record<string, Box> = {};
  spec.nodes.forEach((n) => (boxes[n.id] = boxOf(n)));
  const hopPts = (h: Hop) => hopPoints(boxes[h.from], boxes[h.to], h.via, h.lane);

  const seen = new Set<string>();
  const edges: Laid["edges"] = [];
  const add = (h: Hop) => {
    const p = d(hopPts(h));
    if (seen.has(p)) return;
    seen.add(p);
    edges.push({ d: p, dashed: !!h.dashed, from: h.from, to: h.to });
  };
  spec.routes.forEach((r) => r.forEach(add));
  spec.extra?.forEach(add);

  // step numbers, by first visit along the dot's route
  const numbers: Record<string, number> = {};
  let count = 0;
  const num = (id: string) => {
    if (!(id in numbers)) numbers[id] = ++count;
  };
  spec.routes.forEach((r) =>
    r.forEach((h, i) => {
      if (i === 0) num(h.from);
      num(h.to);
    }),
  );
  spec.extra?.forEach((h) => {
    num(h.from);
    num(h.to);
  });

  // timeline
  const timeline: Seg[] = [];
  let t = 0;
  spec.routes.forEach((route) => {
    timeline.push({ kind: "dwell", t0: t, t1: t + START, at: hopPts(route[0])[0], node: route[0].from });
    t += START;
    route.forEach((h, i) => {
      const pts = hopPts(h);
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      const travel = cum[cum.length - 1] / SPEED;
      timeline.push({ kind: "move", t0: t, t1: t + travel, pts, cum });
      t += travel;
      const rest = DWELL + (i === route.length - 1 ? END_EXTRA : 0);
      timeline.push({ kind: "dwell", t0: t, t1: t + rest, at: pts[pts.length - 1], node: h.to });
      t += rest;
    });
  });

  // zones
  const zones: Laid["zones"] = (spec.zones ?? []).map((z) => {
    const bs = z.nodes.map((id) => boxes[id]);
    const x0 = Math.min(...bs.map((b) => b.x)) - 14;
    const x1 = Math.max(...bs.map((b) => b.x + b.w)) + 14;
    const y0 = Math.min(...bs.map((b) => b.y)) - 28;
    const y1 = Math.max(...bs.map((b) => b.y + b.h)) + 16;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, label: z.label };
  });

  const notes: Laid["notes"] = spec.notes.map((n) => {
    const b = boxes[n.node];
    const L = n.len ?? 22;
    const ox = n.ox ?? 0;
    const anchor = n.align ?? "start";
    const lines = n.lines.length;
    if (n.side === "bottom" || n.side === "top") {
      const pinX = b.x + b.w / 2 + ox;
      const pinY = n.side === "bottom" ? b.y + b.h : b.y;
      const endY = n.side === "bottom" ? pinY + L : pinY - L;
      const y = n.side === "bottom" ? endY + 14 : endY - 6 - (lines - 1) * 16;
      return { node: n.node, x: pinX, y, pinX, pinY, endX: pinX, endY, lines: n.lines, anchor, side: n.side };
    }
    const pinX = n.side === "right" ? b.x + b.w : b.x;
    const pinY = b.y + b.h / 2 + ox;
    const endX = n.side === "right" ? pinX + L : pinX - L;
    const x = n.side === "right" ? endX + 8 : endX - 8;
    const y = pinY - ((lines - 1) * 16) / 2 + 4;
    return { node: n.node, x, y, pinX, pinY, endX, endY: pinY, lines: n.lines, anchor: n.side === "right" ? "start" : "end", side: n.side };
  });

  return { boxes, edges, timeline, cycle: t, numbers, zones, notes };
}

/* ------------------------------------------------------------------ */

const upnet: DiagramSpec = {
  label:
    "Architecture of the UpNet support agent: a WhatsApp customer message passes through the OpenWA gateway and an intent step, reaches a LangGraph agent, which reads facts from PostgreSQL. Fixed templates and an outbox with retries send the WhatsApp reply. An admin dashboard sits alongside.",
  height: 520,
  nodes: [
    { id: "customer", c: 0, r: 0, label: "WhatsApp customer", sub: "English, Roman Urdu, Urdu" },
    { id: "openwa", c: 1, r: 0, label: "OpenWA gateway", sub: "receives the message" },
    { id: "intent", c: 2, r: 0, label: "Intent", sub: "keywords, then AI", key: true },
    { id: "agent", c: 3, r: 0, label: "LangGraph agent", sub: "understands the message" },
    { id: "db", c: 3, r: 1, label: "PostgreSQL", sub: "every fact lives here", key: true },
    { id: "templates", c: 2, r: 1, label: "Fixed templates", sub: "reply wording is fixed", key: true },
    { id: "outbox", c: 1, r: 1, label: "Outbox", sub: "queue with retries" },
    { id: "reply", c: 0, r: 1, label: "WhatsApp reply", sub: "back to the customer" },
    { id: "admin", c: 3, r: 2, label: "Admin dashboard", sub: "run by the admin" },
  ],
  routes: [
    [
      { from: "customer", to: "openwa" },
      { from: "openwa", to: "intent" },
      { from: "intent", to: "agent" },
      { from: "agent", to: "db" },
      { from: "db", to: "templates" },
      { from: "templates", to: "outbox" },
      { from: "outbox", to: "reply" },
    ],
  ],
  extra: [{ from: "db", to: "admin", dashed: true }],
  zones: [
    { label: "Reads the message", nodes: ["customer", "openwa", "intent", "agent"] },
    { label: "Answers from facts", nodes: ["db", "templates", "outbox", "reply"] },
    { label: "Admin", nodes: ["admin"] },
  ],
  notes: [
    {
      node: "admin",
      side: "left",
      len: 20,
      lines: ["Customers, billing, payments,", "tickets, chats, maintenance", "notices, health alerts."],
    },
  ],
  steps: [
    { label: "WhatsApp customer", sub: "English, Roman Urdu or Urdu script" },
    { label: "OpenWA gateway", sub: "receives the message" },
    { label: "Intent", sub: "keywords first, the AI is the backup" },
    { label: "LangGraph agent", sub: "understands the message and its language" },
    { label: "PostgreSQL", sub: "every fact, such as a bill or a ticket, is read from here" },
    { label: "Fixed templates", sub: "the bot cannot invent an answer" },
    { label: "Outbox with retries", sub: "replies are never lost" },
    { label: "WhatsApp reply", sub: "back to the customer" },
    {
      label: "Admin dashboard, alongside",
      sub: "customers, billing, payments, tickets, chats, maintenance notices, health alerts",
    },
  ],
};

const travel: DiagramSpec = {
  label:
    "Architecture of the travel agent: WhatsApp to a Node.js bridge, a FastAPI chat endpoint, a guardrail, then a LangGraph agent that uses package search and RAG tools. A confirmation step stands before the SQLite bookings.",
  height: 520,
  nodes: [
    { id: "wa", c: 0, r: 0, label: "WhatsApp", sub: "customer message" },
    { id: "bridge", c: 1, r: 0, label: "Node.js bridge", sub: "whatsapp-web.js" },
    { id: "chat", c: 2, r: 0, label: "FastAPI /chat", sub: "receives the message" },
    { id: "guard", c: 3, r: 0, label: "Guardrail", sub: "checks every message" },
    { id: "agent", c: 3, r: 1, label: "LangGraph agent", sub: "holds the conversation" },
    { id: "confirm", c: 2, r: 1, label: "Confirmation step", sub: "waits for the yes", key: true },
    { id: "sqlite", c: 1, r: 1, label: "SQLite bookings", sub: "written after the yes", key: true },
    { id: "tools", c: 3, r: 2, label: "Tools", sub: "package search, RAG" },
  ],
  routes: [
    [
      { from: "wa", to: "bridge" },
      { from: "bridge", to: "chat" },
      { from: "chat", to: "guard" },
      { from: "guard", to: "agent" },
      { from: "agent", to: "tools", lane: -8 },
      { from: "tools", to: "agent", lane: 8 },
      { from: "agent", to: "confirm" },
      { from: "confirm", to: "sqlite" },
    ],
  ],
  zones: [{ label: "Nothing saved until yes", nodes: ["confirm", "sqlite"] }],
  notes: [
    {
      node: "wa",
      side: "bottom",
      ox: -20,
      lines: ["Collects package,", "travelers, departure", "city, date, name", "and phone."],
    },
    {
      node: "guard",
      side: "bottom",
      ox: -40,
      align: "end",
      lines: ["Rejects off-topic and", "prompt-injection messages."],
    },
    { node: "sqlite", side: "left", lines: ["The model never writes", "to the database."] },
    {
      node: "tools",
      side: "left",
      len: 20,
      lines: ["Price is calculated on", "the server, never by", "the model."],
    },
  ],
  steps: [
    { label: "WhatsApp", sub: "the customer's message" },
    { label: "Node.js bridge", sub: "whatsapp-web.js" },
    { label: "FastAPI /chat", sub: "receives the message" },
    { label: "Guardrail", sub: "rejects off-topic and prompt-injection messages" },
    { label: "LangGraph agent", sub: "holds the conversation and collects package, travelers, departure city, date, name and phone" },
    { label: "Tools", sub: "package search and RAG; the price is calculated on the server, never by the model" },
    { label: "Confirmation step", sub: "a booking or cancellation waits for the customer's yes" },
    { label: "SQLite bookings", sub: "the model never writes to the database" },
  ],
};

const gateway: DiagramSpec = {
  label:
    "Architecture of Model Gateway: a prompt enters the gateway, which tries Groq at priority 1; Groq fails, so Hugging Face at priority 2 answers, and the response returns with the model name and time.",
  height: 520,
  nodes: [
    { id: "prompt", c: 0, r: 1, label: "Prompt", sub: "from the Streamlit UI" },
    { id: "gateway", c: 1, r: 1, label: "Gateway", sub: "tries by priority", key: true },
    { id: "groq", c: 2, r: 0, label: "Groq", sub: "priority 1", fail: true },
    { id: "hf", c: 2, r: 2, label: "Hugging Face", sub: "priority 2" },
    { id: "response", c: 3, r: 1, label: "Response", sub: "model and time" },
  ],
  routes: [
    [
      { from: "prompt", to: "gateway" },
      { from: "gateway", to: "groq", via: "hv", lane: -18 },
      { from: "groq", to: "gateway", via: "vh", lane: -10 },
      { from: "gateway", to: "hf", via: "hv", lane: 10 },
      { from: "hf", to: "gateway", via: "vh", lane: 18 },
      { from: "gateway", to: "response" },
    ],
  ],
  zones: [{ label: "Tried in priority order", nodes: ["groq", "hf"] }],
  notes: [
    { node: "groq", side: "right", lines: ["Priority 1 fails.", "The gateway moves on."] },
    { node: "hf", side: "right", lines: ["Priority 2 answers."] },
    { node: "gateway", side: "bottom", align: "end", lines: ["Tries models in priority", "order. Streams the answer."] },
    {
      node: "response",
      side: "bottom",
      ox: 90,
      align: "end",
      lines: ["Shows which model answered", "and how long it took."],
    },
  ],
  steps: [
    { label: "Prompt", sub: "from the Streamlit UI" },
    { label: "Gateway", sub: "tries models in priority order and streams the answer" },
    { label: "Groq, priority 1", sub: "fails, so the gateway moves on" },
    { label: "Hugging Face, priority 2", sub: "answers" },
    { label: "Response", sub: "shows which model answered and how long it took" },
  ],
};

const debate: DiagramSpec = {
  label:
    "Architecture of the AI Debate System: a topic goes to debater A and debater B, who trade rebuttals over several rounds into a transcript. A judge reads the full transcript. Each agent runs on a different provider.",
  height: 520,
  nodes: [
    { id: "topic", c: 0, r: 1, label: "Topic", sub: "the motion to debate" },
    { id: "a", c: 1, r: 0, label: "Debater A", sub: "argues FOR" },
    { id: "b", c: 1, r: 2, label: "Debater B", sub: "argues AGAINST" },
    { id: "transcript", c: 2, r: 1, label: "Transcript", sub: "every round, in full" },
    { id: "judge", c: 3, r: 1, label: "Judge", sub: "rules on the transcript", key: true },
  ],
  routes: [
    [
      { from: "topic", to: "a", via: "hv", lane: -10 },
      { from: "a", to: "b", lane: 14 },
      { from: "b", to: "a", lane: 32 },
      { from: "a", to: "b", lane: 14 },
      { from: "b", to: "transcript", via: "hv" },
      { from: "transcript", to: "judge" },
    ],
  ],
  extra: [{ from: "a", to: "transcript", via: "hv" }],
  zones: [{ label: "Each on a different provider", nodes: ["a", "b"] }],
  notes: [
    { node: "a", side: "left", lines: ["Each rebuts the", "last points made."] },
    {
      node: "judge",
      side: "bottom",
      ox: 90,
      align: "end",
      lines: ["Each agent runs on a", "different provider, so no", "model judges itself."],
    },
  ],
  steps: [
    { label: "Topic", sub: "the motion to debate" },
    { label: "Debater A", sub: "argues FOR and rebuts the last points made" },
    { label: "Debater B", sub: "argues AGAINST, on a different provider from A" },
    { label: "Rounds", sub: "A and B trade rebuttals for several rounds" },
    { label: "Transcript", sub: "every round, in full" },
    { label: "Judge", sub: "rules on the full transcript; each agent runs on a different provider, so no model judges itself" },
  ],
};

const shield: DiagramSpec = {
  label:
    "Architecture of AgenticShield: a query reaches the agent, which picks among five tools (RAG knowledge base, Nmap scan, WordPress audit, NVD CVE lookup, Tavily web search), sometimes chaining them, and returns a grounded answer. The route changes each loop.",
  height: 500,
  nodes: [
    { id: "query", c: 0, y: 211, label: "Query", sub: "a security question" },
    { id: "agent", c: 1, y: 211, label: "Agent", sub: "decides which tool", key: true },
    { id: "rag", c: 2, y: 40, h: 66, label: "RAG knowledge base", sub: "4 security guides" },
    { id: "nmap", c: 2, y: 130, h: 66, label: "Nmap scan", sub: "detects the service" },
    { id: "wp", c: 2, y: 220, h: 66, label: "WordPress audit", sub: "checks a site" },
    { id: "nvd", c: 2, y: 310, h: 66, label: "NVD CVE lookup", sub: "looks up CVEs" },
    { id: "web", c: 2, y: 400, h: 66, label: "Tavily web search", sub: "searches the web" },
    { id: "answer", c: 3, y: 211, label: "Grounded answer", sub: "built from tool results" },
  ],
  routes: [
    [
      { from: "query", to: "agent" },
      { from: "agent", to: "rag", via: "hvh" },
      { from: "rag", to: "answer", via: "hvh" },
    ],
    [
      { from: "query", to: "agent" },
      { from: "agent", to: "nmap", via: "hvh" },
      { from: "nmap", to: "agent", via: "hvh", lane: 14 },
      { from: "agent", to: "nvd", via: "hvh" },
      { from: "nvd", to: "answer", via: "hvh" },
    ],
    [
      { from: "query", to: "agent" },
      { from: "agent", to: "wp", via: "hvh" },
      { from: "wp", to: "answer", via: "hvh" },
    ],
    [
      { from: "query", to: "agent" },
      { from: "agent", to: "web", via: "hvh" },
      { from: "web", to: "answer", via: "hvh" },
    ],
  ],
  zones: [{ label: "Five tools", nodes: ["rag", "nmap", "wp", "nvd", "web"] }],
  notes: [
    { node: "query", side: "top", lines: ["Each query can take", "a different route."] },
    {
      node: "agent",
      side: "bottom",
      align: "middle",
      lines: ["The agent chooses its tools", "and chains them: scan,", "detect the service, look", "up CVEs, explain."],
    },
    {
      node: "answer",
      side: "bottom",
      ox: 90,
      align: "end",
      lines: ["Answer grounded in", "what the tools returned."],
    },
  ],
  steps: [
    { label: "Query", sub: "a security question" },
    { label: "Agent", sub: "decides for itself which tool to use, and chains them" },
    {
      label: "Five tools",
      items: [
        "RAG knowledge base: OWASP Top 10, WordPress hardening, Nmap docs, SQL injection guide",
        "Nmap scan",
        "WordPress audit",
        "NVD CVE lookup",
        "Tavily web search",
      ],
    },
    { label: "Grounded answer", sub: "built from what the tools returned" },
  ],
  loopNote: "The route is different on each loop: one tool, or a chain such as scan, then CVE lookup.",
};

export const diagrams = { upnet, travel, gateway, debate, shield };
