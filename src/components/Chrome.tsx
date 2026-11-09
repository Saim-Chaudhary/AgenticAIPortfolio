import Link from "next/link";
import { person } from "@/data/site";
import ThemeToggle from "./ThemeToggle";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-row">
        <Link href="/" className="wordmark" aria-label="Muhammad Saim, home">
          Saim
        </Link>
        <span className="role">Agentic AI Engineer</span>
        <nav aria-label="Primary" className="nav">
          <Link href="/#work">Work</Link>
          <Link href="/#skills">Skills</Link>
          <Link href="/#contact" className="nav-cta">
            Contact
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <p className="footer-name">{person.name}</p>
        <ul className="footer-links">
          <li>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </li>
          <li>
            <a href={person.whatsapp}>WhatsApp</a>
          </li>
          <li>
            <a href={person.github}>GitHub</a>
          </li>
          <li>
            <a href={person.linkedin}>LinkedIn</a>
          </li>
        </ul>
        <p className="footer-place">
          {person.role}, based in {person.place}
        </p>
      </div>
    </footer>
  );
}

export function Section({
  id,
  title,
  children,
  className = "",
  nodeTop,
}: {
  id?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  nodeTop?: number;
}) {
  return (
    <section id={id} className={`sec ${className}`} aria-labelledby={id && title ? `${id}-h` : undefined}>
      <i
        className="node"
        data-node
        aria-hidden="true"
        style={nodeTop ? ({ "--node-top": `${nodeTop}px` } as React.CSSProperties) : undefined}
      />
      <div className="container">
        {title && (
          <h2 id={id ? `${id}-h` : undefined} className="sec-title">
            {title}
          </h2>
        )}
        {children}
      </div>
    </section>
  );
}

export function ArrowIcon() {
  return (
    <svg className="arrow" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false">
      <path d="M5 19 L19 5 M8 5 H19 V16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

export function Readouts({ items, size = "m" }: { items: { value: string; label: string; wide?: boolean }[]; size?: "s" | "m" }) {
  return (
    <dl className={`readouts readouts-${size}`}>
      {items.map((r) => (
        <div key={r.label} className={r.wide ? "readout readout-wide" : "readout"}>
          <dt className="readout-l">{r.label}</dt>
          <dd className="readout-v num">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
