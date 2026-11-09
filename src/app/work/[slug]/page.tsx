import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Diagram from "@/components/Diagram";
import Reveal from "@/components/Reveal";
import TracePage from "@/components/TracePage";
import { Footer, Header, Readouts, Section } from "@/components/Chrome";
import { getProject, projects } from "@/data/site";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return {};
  return { title: `${p.title} | Muhammad Saim`, description: p.summary };
}

export default async function Case({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) notFound();

  return (
    <>
      <Header />
      <TracePage>
        <main id="main">
          <section className="case-hero" aria-labelledby="case-title">
            <i className="node" data-node aria-hidden="true" style={{ "--node-top": "46px" } as React.CSSProperties} />
            <div className="container">
              <Link className="back" href="/#work">
                All work
              </Link>
              <div className="case-head">
                <p className="case-who">{p.who}</p>
                <h1 id="case-title" className="case-title">
                  {p.title}
                </h1>
                <p className="case-lead">{p.summary}</p>
                <p className="case-intro">{p.intro}</p>
                {p.note && <p className="case-note">{p.note}</p>}
              </div>
            </div>
          </section>

          <Section id="does" title="What it does">
            <Reveal as="div" className="split">
              <ul className="does">
                {p.does.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </Reveal>
          </Section>

          <Section id="how" title="How it works" className="sec-wide">
            <Reveal>
              <p className="how-copy">{p.how}</p>
            </Reveal>
            <Reveal>
              <Diagram spec={p.diagram} />
            </Reveal>
          </Section>

          <Section id="hard" title="Hard parts">
            <ul className="hard">
              {p.hard.map((h, i) => (
                <Reveal as="li" key={h.title} className="hard-item" delay={i * 60}>
                  <h3>{h.title}</h3>
                  <p>{h.body}</p>
                </Reveal>
              ))}
            </ul>
          </Section>

          <Section id="numbers" title="Numbers">
            <Reveal>
              <Readouts items={p.numbers} size="m" />
            </Reveal>
          </Section>

          <Section id="stack" title="Stack">
            <Reveal>
              <ul className="stack">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {p.github && (
                <a className="btn btn-fill gh" href={p.github}>
                  View on GitHub
                </a>
              )}
            </Reveal>
          </Section>
        </main>
      </TracePage>
      <Footer />
    </>
  );
}
