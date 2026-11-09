import Link from "next/link";
import Reveal from "@/components/Reveal";
import TracePage from "@/components/TracePage";
import { ArrowIcon, Footer, Header, Readouts, Section } from "@/components/Chrome";
import {
  aboutRows,
  certs,
  clientProjects,
  experience,
  getProject,
  heroReadings,
  internProjects,
  person,
  skills,
  type Project,
} from "@/data/site";

function NameWord({ word, start }: { word: string; start: number }) {
  return (
    <span className="name-word" aria-hidden="true">
      {word.split("").map((ch, i) => (
        <span key={i} className="ch" style={{ "--i": start + i } as React.CSSProperties}>
          {ch}
        </span>
      ))}
    </span>
  );
}

function Card({ p, size }: { p: Project; size: "lg" | "md" | "sm" }) {
  return (
    <Reveal as="article" className={`card card-${size} card-${p.slug}`}>
      <p className="card-who">{p.who}</p>
      <h3 className="card-title">
        <Link href={`/work/${p.slug}`} className="card-link">
          {p.title}
        </Link>
      </h3>
      <p className="card-sum">{p.blurb}</p>
      <Readouts items={p.cardNumbers} size="s" />
      <ArrowIcon />
    </Reveal>
  );
}

export default function Home() {
  const exp = experience;
  return (
    <>
      <Header />
      <TracePage>
        <main id="main">
          <section className="hero" aria-labelledby="name">
            <i className="node" data-node aria-hidden="true" style={{ "--node-top": "46px" } as React.CSSProperties} />
            <div className="container">
              <h1 id="name" className="name" aria-label={person.name}>
                <span className="name-inner">
                  <NameWord word="MUHAMMAD" start={0} />
                  <span className="name-row">
                    <NameWord word="SAIM" start={8} />
                    <span className="name-side" aria-hidden="true">
                      <span>{person.role}</span>
                      <span>{person.place}</span>
                    </span>
                  </span>
                </span>
              </h1>
              <div className="ruler" aria-hidden="true" />
              <div className="hero-grid">
                <p className="hero-line">{person.heroLine}</p>
                <div className="hero-actions">
                  <a className="btn btn-fill" href={`mailto:${person.email}`}>
                    Email me
                  </a>
                  <Link className="btn btn-line" href="/#work">
                    See the work
                  </Link>
                </div>
              </div>
              <Readouts items={heroReadings} size="s" />
            </div>
          </section>

          <Section id="about" title="How I build">
            <div className="about-grid">
              <Reveal className="about-copy">
                <p>
                  I design agents that check before they act: facts come from a database, prices from the server,
                  and bookings wait for a yes.
                </p>
              </Reveal>
              <Reveal className="about-rows" delay={80}>
                <dl className="kv">
                  {aboutRows.map((r) => (
                    <div key={r.k} className="kv-row">
                      <dt>{r.k}</dt>
                      <dd>{r.v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>
          </Section>

          <Section id="work" title="Built for two clients in Okara">
            <div className="bento bento-client">
              <Card p={getProject("upnet")!} size="lg" />
              <Card p={getProject("travel-agency")!} size="md" />
            </div>
          </Section>

          <Section id="internship" title="Built during the internship">
            <div className="bento bento-intern">
              {internProjects.map((p, i) => (
                <Card key={p.slug} p={p} size={i === 2 ? "lg" : "sm"} />
              ))}
            </div>
          </Section>

          <Section id="skills" title="What I work with">
            <Reveal>
              <dl className="rows">
                {skills.map((s) => (
                  <div key={s.group} className="row">
                    <dt>{s.group}</dt>
                    <dd>{s.items}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </Section>

          <Section id="experience" title="Experience">
            <Reveal className="exp">
              <p className="exp-dates num">{exp.dates}</p>
              <div>
                <h3 className="exp-role">
                  {exp.role}, {exp.org}
                </h3>
                <p className="exp-place">{exp.place}</p>
                <p className="exp-body">{exp.body}</p>
                <ul className="exp-built">
                  {exp.built.map((s) => {
                    const p = getProject(s)!;
                    return (
                      <li key={s}>
                        <Link href={`/work/${s}`}>{p.title}</Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Reveal>
          </Section>

          <Section id="certifications" title="Certifications">
            <Reveal>
              <ul className="certs">
                {certs.map((c) => (
                  <li key={c.title} className="cert">
                    <div>
                      <p className="cert-title">{c.title}</p>
                      <p className="cert-by">
                        {c.issuer}
                        {c.extra ? `, ${c.extra}` : ""}
                      </p>
                    </div>
                    <p className="cert-date num">{c.date ?? ""}</p>
                    {c.url ? (
                      <a className="cert-link" href={c.url} aria-label={`Verify: ${c.title}`}>
                        Verify
                      </a>
                    ) : (
                      <span className="cert-link cert-none" />
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          </Section>

          <Section id="contact" title="Get in touch">
            <Reveal className="contact">
              <p className="contact-lead">Open to internships, remote jobs and freelance work.</p>
              <a className="contact-mail" href={`mailto:${person.email}`}>
                {person.email}
              </a>
              <ul className="contact-links">
                <li>
                  <a href={person.whatsapp}>WhatsApp {person.whatsappLabel}</a>
                </li>
                <li>
                  <a href={person.github}>GitHub</a>
                </li>
                <li>
                  <a href={person.linkedin}>LinkedIn</a>
                </li>
              </ul>
            </Reveal>
          </Section>
        </main>
      </TracePage>
      <Footer />
    </>
  );
}

void clientProjects;
