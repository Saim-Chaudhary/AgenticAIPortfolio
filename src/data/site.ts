import type { DiagramSpec } from "./diagrams";
import { diagrams } from "./diagrams";

export const person = {
  name: "Muhammad Saim",
  role: "Agentic AI Engineer",
  place: "Okara, Punjab, Pakistan",
  email: "saimch726@gmail.com",
  whatsapp: "https://wa.me/923474233300",
  whatsappLabel: "+92 347 4233300",
  github: "https://github.com/Saim-Chaudhary",
  linkedin: "https://www.linkedin.com/in/saim-chaudhary/",
  heroLine: "I build AI agents. Two were built for real clients in Okara, Pakistan.",
};

export type Readout = { value: string; label: string; wide?: boolean };

export type Project = {
  slug: string;
  kind: "client" | "internship";
  title: string;
  who: string;
  summary: string;
  blurb: string;
  intro: string;
  does: string[];
  how: string;
  hard: { title: string; body: string }[];
  numbers: Readout[];
  cardNumbers: Readout[];
  stack: string[];
  github?: string;
  note?: string;
  diagram: DiagramSpec;
};

export const projects: Project[] = [
  {
    slug: "upnet",
    blurb: "A WhatsApp support agent for an internet provider, in English, Roman Urdu and Urdu.",
    kind: "client",
    title: "UpNet WhatsApp Support Agent",
    who: "For UpNet, an internet provider in Okara",
    summary:
      "A WhatsApp support agent in English, Roman Urdu and Urdu script, with an admin dashboard beside it.",
    intro:
      "UpNet is a small internet service provider in Okara with about 658 customers. Every day the admin answered the same WhatsApp questions by hand: “my internet is not working”, “what is my bill?”, “I paid, please check”.",
    does: [
      "Troubleshoots step by step; opens a ticket if still broken.",
      "Identifies the customer by username and phone; tells their bill, advance credit and due date.",
      "Collects payment receipts for admin verification.",
      "Announces maintenance only to the affected area.",
      "Hands over to a person when needed.",
      "Asks “Is your internet working now?” before closing a ticket.",
      "Admin dashboard: customers, billing sheet, payment verification, tickets, chats, maintenance notices, health alerts.",
    ],
    how: "The AI only understands the message and its language. Every fact comes from the database through fixed templates, so the bot cannot invent answers. Keywords run first; the AI is the backup.",
    hard: [
      {
        title: "A messy provider export",
        body: "An HTML table saved as .xls, 76 customers without phones. An importer with preview, per-row errors and a balance check.",
      },
      {
        title: "A ledger, not a paid/unpaid flag",
        body: "A billing ledger whose status counts matched the provider's sheet exactly: 596 / 50 / 5.",
      },
      {
        title: "Safe around a language model",
        body: "Prompt-injection resistance, throttled username guesses, masked phone numbers in logs, receipts deleted after 3 days.",
      },
      {
        title: "Replies are never lost",
        body: "An outbox queue with retries.",
      },
    ],
    numbers: [
      { value: "658", label: "customers at UpNet (about)" },
      { value: "700+", label: "automated tests" },
      { value: "16", label: "database migrations" },
      {
        value: "596 / 50 / 5",
        label: "billing status counts, matching the sheet exactly",
        wide: true,
      },
    ],
    cardNumbers: [
      { value: "700+", label: "automated tests" },
      { value: "16", label: "database migrations" },
      { value: "596/50/5", label: "counts match the sheet" },
    ],
    stack: [
      "LangGraph",
      "Groq",
      "FastAPI",
      "PostgreSQL",
      "Alembic",
      "OpenWA",
      "Next.js 16",
      "TypeScript",
      "Tailwind",
    ],
    note: "Tested with a real phone, including a payment receipt.",
    diagram: diagrams.upnet,
  },
  {
    slug: "travel-agency",
    blurb: "A WhatsApp booking assistant that books and cancels only after the customer says yes.",
    kind: "client",
    title: "Hajj and Umrah Travel Agent",
    who: "For a Hajj and Umrah agency in Okara",
    summary:
      "A WhatsApp booking assistant that holds a multi-turn conversation, answers policy, visa and service questions, and books or cancels only after the customer says yes.",
    intro:
      "A travel agency in Okara arranges Hajj and Umrah packages. This assistant takes the booking conversation on WhatsApp, one question at a time.",
    does: [
      "Holds a multi-turn conversation and collects package, travelers, departure city, travel date, name and phone.",
      "Searches the agency's packages.",
      "Answers policy, visa and service questions with RAG.",
      "Handles booking and cancellation.",
    ],
    how: "A Node.js bridge passes WhatsApp messages to a FastAPI endpoint. A guardrail checks each message before the LangGraph agent sees it. The agent calls tools for package search and RAG, and a confirmation step stands between the agent and the booking database.",
    hard: [
      {
        title: "Off-topic and injected messages",
        body: "A guardrail rejects off-topic and prompt-injection messages before they reach the agent.",
      },
      {
        title: "The model never writes to the database",
        body: "Only the confirmed booking step writes to SQLite. The model has no write access.",
      },
      {
        title: "Nothing happens without a yes",
        body: "A booking or a cancellation waits for the customer's explicit yes.",
      },
      {
        title: "Prices the model cannot change",
        body: "The price is calculated on the server, never by the model.",
      },
    ],
    numbers: [
      { value: "68", label: "automated tests" },
      { value: "6", label: "booking details collected through conversation" },
      { value: "2", label: "actions wait for a yes" },
    ],
    cardNumbers: [
      { value: "68", label: "automated tests" },
      { value: "6", label: "details collected" },
      { value: "2", label: "actions wait for a yes" },
    ],
    stack: [
      "Python",
      "FastAPI",
      "LangGraph",
      "LangChain",
      "Groq",
      "ChromaDB",
      "Hugging Face embeddings",
      "SQLite",
      "Node.js (whatsapp-web.js)",
      "pytest",
    ],
    diagram: diagrams.travel,
  },
  {
    slug: "model-gateway",
    blurb: "One interface over several LLM providers, with fallback in priority order.",
    kind: "internship",
    title: "Model Gateway",
    who: "Dev Entity internship, London",
    summary:
      "One interface over several LLM providers. It tries models in priority order and falls back to the next if one fails.",
    intro:
      "Providers fail. Model Gateway puts Groq and Hugging Face behind one interface so a failed call becomes a fallback instead of an error.",
    does: [
      "One interface over several LLM providers, Groq and Hugging Face.",
      "Tries models in priority order and falls back to the next if one fails.",
      "Streams the answer as it is written.",
      "Shows which model answered and how long it took.",
      "Streamlit UI on top.",
      "A new provider takes a few lines.",
    ],
    how: "The prompt enters the gateway, which calls the first model by priority. If Groq fails, the gateway moves to Hugging Face. The response comes back with the name of the model that answered and the time it took.",
    hard: [
      {
        title: "Failing over without the caller noticing",
        body: "Models are tried in priority order and the next one takes over when one fails.",
      },
      {
        title: "Staying open to new providers",
        body: "Adding a provider takes a few lines, so the list is not hard-wired to two.",
      },
    ],
    numbers: [
      { value: "1", label: "interface over several providers" },
      { value: "1 → 2", label: "priority order in the diagram: Groq first, Hugging Face next" },
      { value: "2", label: "values shown with every answer: model and time" },
    ],
    cardNumbers: [
      { value: "1", label: "interface, several providers" },
      { value: "2", label: "values per answer" },
    ],
    stack: ["Python", "LangChain", "Groq", "Hugging Face", "Streamlit"],
    github: "https://github.com/Saim-Chaudhary/Model-Gateway",
    diagram: diagrams.gateway,
  },
  {
    slug: "ai-debate-system",
    blurb: "Two agents debate FOR and AGAINST; a third judges the full transcript.",
    kind: "internship",
    title: "AI Debate System",
    who: "Dev Entity internship, London",
    summary:
      "Two agents debate FOR and AGAINST over several rounds, and a third judges from the full transcript.",
    intro:
      "Each debater rebuts the other's last points. The judge reads everything that was said before it decides.",
    does: [
      "Two agents argue FOR and AGAINST a topic over several rounds.",
      "Each one rebuts the last points of the other.",
      "A third agent judges from the full transcript.",
      "Each agent runs on a different provider: Groq, Gemini and OpenRouter.",
    ],
    how: "A topic goes to debater A, then debater B, and they trade rebuttals for several rounds. Every turn is added to the transcript. The judge reads the full transcript and gives its verdict.",
    hard: [
      {
        title: "No model judges itself",
        body: "Each agent runs on a different provider, so the judge never rules on its own arguments.",
      },
      {
        title: "Real rebuttals",
        body: "Every round, a debater answers the last points made against it, so the exchange builds on itself.",
      },
    ],
    numbers: [
      { value: "3", label: "providers: Groq, Gemini, OpenRouter" },
      { value: "2", label: "debaters, FOR and AGAINST" },
      { value: "1", label: "judge reading the full transcript" },
    ],
    cardNumbers: [
      { value: "3", label: "providers" },
      { value: "1", label: "judge" },
    ],
    stack: ["Python", "LangChain", "Groq", "Gemini", "OpenRouter"],
    github: "https://github.com/Saim-Chaudhary/AI-Debate-System",
    diagram: diagrams.debate,
  },
  {
    slug: "agenticshield",
    blurb: "A security agent that picks and chains its own tools.",
    kind: "internship",
    title: "AgenticShield",
    who: "Dev Entity internship, London",
    summary:
      "A security agent that decides for itself which tool to use, chains them, and answers from what they return.",
    intro:
      "The agent decides whether to search a RAG knowledge base, run an Nmap scan, audit a WordPress site, look up CVEs through the NVD API, or search the web with Tavily.",
    does: [
      "RAG base: OWASP Top 10, WordPress hardening, Nmap docs, SQL injection guide.",
      "Nmap scans and WordPress audits.",
      "NVD CVE lookups and Tavily web search.",
      "Chains tools: scan, detect the service, look up CVEs, explain.",
      "React and Tailwind dashboard with an evaluation tab.",
    ],
    how: "A query reaches the agent, which picks tools on its own: one tool, or a chain. The answer is grounded in what the tools returned.",
    hard: [
      {
        title: "Choosing the right tool",
        body: "Five tools, and the agent picks one per query without being told.",
      },
      {
        title: "Chaining tools",
        body: "A scan finds a service, the service leads to a CVE lookup, and the result is explained.",
      },
      {
        title: "Measuring the choice",
        body: "On 12 test queries, openai/gpt-oss-20b picked the right tool 12 times and llama-3.3-70b-versatile 8.",
      },
    ],
    numbers: [
      { value: "12/12", label: "right tool picks, openai/gpt-oss-20b" },
      { value: "8/12", label: "right tool picks, llama-3.3-70b-versatile" },
      { value: "5", label: "tools the agent chooses between" },
    ],
    cardNumbers: [
      { value: "12/12", label: "right picks, gpt-oss-20b" },
      { value: "8/12", label: "right picks, llama-3.3-70b" },
    ],
    stack: [
      "Python",
      "LangChain",
      "LangGraph",
      "FastAPI",
      "ChromaDB",
      "Groq",
      "Nmap",
      "React",
      "Vite",
      "Tailwind",
    ],
    github: "https://github.com/Saim-Chaudhary/AgenticCyberShiled",
    note: "For systems you own or have permission to test.",
    diagram: diagrams.shield,
  },
];

export const clientProjects = projects.filter((p) => p.kind === "client");
export const internProjects = projects.filter((p) => p.kind === "internship");
export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

export const heroReadings: Readout[] = [
  { value: "700+", label: "automated tests behind one WhatsApp agent" },
  { value: "12/12", label: "right tool picks on 12 test queries" },
  { value: "596/50/5", label: "billing counts that match the provider's sheet" },
];

export const aboutRows: { k: string; v: string }[] = [
  { k: "Studying", v: "BSCS, COMSATS Sahiwal" },
  { k: "Graduating", v: "May 2027" },
  { k: "Based in", v: "Okara, Punjab, Pakistan" },
  { k: "Open to", v: "Internships, remote, freelance" },
];

export const skills: { group: string; items: string }[] = [
  {
    group: "Agents",
    items:
      "LangGraph, LangChain, tool calling, multi-agent orchestration, guardrails, human-in-the-loop confirmation, agent evaluation",
  },
  { group: "Retrieval", items: "ChromaDB, Hugging Face embeddings" },
  { group: "Model providers", items: "Groq, Gemini, OpenRouter" },
  { group: "Backend", items: "Python, FastAPI, PostgreSQL, SQLite, Alembic, pytest" },
  { group: "Frontend", items: "Next.js, TypeScript, React, Tailwind" },
  { group: "WhatsApp", items: "OpenWA, whatsapp-web.js" },
  { group: "Security", items: "Nmap, NVD, OWASP, prompt-injection testing" },
];

export const experience = {
  org: "Dev Entity",
  place: "London, UK",
  role: "Agentic AI Intern",
  dates: "1 Jul to 30 Sep 2026",
  body: "Practical exposure to agentic AI concepts, prompt engineering, AI-assisted workflows, automation, research and project-based tasks under team supervision.",
  built: ["model-gateway", "ai-debate-system", "agenticshield"],
};

export const certs: { title: string; issuer: string; date?: string; url?: string; extra?: string }[] = [
  { title: "Agentic AI Certified Foundations Associate", issuer: "Oracle", date: "Aug 2026" },
  {
    title: "Context Engineering with Redis & LangChain",
    issuer: "Redis University",
    extra: "lab",
    date: "Aug 2026",
    url: "https://university.redis.io/certificate/9l51ykg4ka9oag",
  },
  {
    title: "Generative AI Applications with RAG and LangChain",
    issuer: "IBM on Coursera",
    date: "Jul 2026",
    url: "https://www.coursera.org/account/accomplishments/verify/XKZY3XJCPE3A",
  },
  {
    title: "Vector Databases: An Introduction with Chroma DB",
    issuer: "IBM on Coursera",
    date: "Jul 2026",
    url: "https://www.coursera.org/account/accomplishments/verify/RFP5LODNRAQH",
  },
  {
    title: "OWASP ZAP web application security testing",
    issuer: "Coursera",
    url: "https://www.coursera.org/account/accomplishments/verify/53SVTGLGD73V",
  },
  {
    title: "Docker Basics for DevOps",
    issuer: "KodeKloud",
    date: "Jul 2026",
    url: "https://www.coursera.org/account/accomplishments/verify/ZWSUCJKOI4W5",
  },
];
