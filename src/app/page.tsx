import Link from "next/link";

type Job = {
  org: string;
  role: string;
  period: string;
  location: string;
  description: string;
  demo?: { href: string; label: string };
};

const experience: Job[] = [
  {
    org: "Lintasarta",
    role: "Forward Deployed AI Engineer",
    period: "Apr 2026 — Present",
    location: "Jakarta, Indonesia",
    demo: {
      href: "/projects/rag",
      label: "See the ingestion pipeline and a retrieval trace",
    },
    description:
      "Four-stage LangGraph pipeline structuring 500k+ Indonesian legal and corporate PDFs into a knowledge graph, plus the cross-store RAG service and Go telemetry behind the in-house DekaLLM platform.",
  },
  {
    org: "Sending Labs",
    role: "Software Engineer",
    period: "Jun 2025 — Sep 2025",
    location: "NYC",
    demo: {
      href: "/projects/manim",
      label: "See the pipeline run, end to end",
    },
    description:
      "Generative Manim pipeline pairing GPT-4o and Claude to produce narrated CFA educational video, with async streaming that cut perceived latency 70% and failover holding 99.9% uptime.",
  },
  {
    org: "VideoTutor AI",
    role: "Early Software Engineer",
    period: "Apr 2025 — Jun 2025",
    location: "Remote",
    demo: {
      href: "/projects/manim",
      label: "See Manim rendering at this scale",
    },
    description:
      "Containerized ManimGL on Modal and Fly.io GPUs with an async batch pipeline: 5x throughput, 35% lower cost, 1080p renders in 38s at p99.",
  },
  {
    org: "Independent Contract",
    role: "Software Engineer, Trading Execution Systems",
    period: "Jun 2024 — Mar 2025",
    location: "Remote",
    description:
      "Systematic trading system running end to end across three strategies on a 2GB droplet: real-time ingestion, phase-gated model promotion, out-of-sample evaluation infrastructure, and a Rust hot path for decision-time inference.",
  },
  {
    org: "Olo",
    role: "Software Engineer Intern, Platform",
    period: "Summers 2022, 2023",
    location: "NYC",
    description:
      "Real-time order-tracking backend on AWS Lambda serving 10k+ concurrent sessions at 99.9% uptime.",
  },
];

type Project = {
  name: string;
  description: string;
  link: { href: string; label: string };
};

const projects: Project[] = [
  {
    name: "CapSeal",
    description:
      "MCP server that gates AI-coding-agent actions against a per-codebase learned risk model, then seals each action into a tamper-evident, SHA-256 hash-chained receipt with a verifying CLI.",
    link: {
      href: "/projects/capseal",
      label: "Verify a real receipt in your browser",
    },
  },
  {
    name: "Sajian",
    description:
      "Multi-tenant restaurant platform: one Next.js app serving many restaurants by subdomain, with AI-generated storefronts and live QR-to-cashier ordering into the ESB point-of-sale.",
    link: { href: "/projects/sajian", label: "Read the writeup" },
  },
  {
    name: "Mindiology",
    description:
      "iOS ordering and loyalty app for my parents' F&B group in Jakarta, spanning several restaurant brands. Also the first live tenant on Sajian.",
    link: {
      href: "/projects/mindiology",
      label: "See the app",
    },
  },
];

const links = [
  { label: "GitHub", href: "https://github.com/rochmanofenna" },
  { label: "LinkedIn", href: "https://linkedin.com/in/ryanroch" },
  { label: "Email", href: "mailto:rr3758@nyu.edu" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-widest text-subtle">
      {children}
    </h2>
  );
}

export default function Home() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 text-[18px] leading-relaxed md:grid-cols-[16rem_1fr] md:gap-20 md:py-24">
      <header className="md:sticky md:top-24 md:self-start">
        <h1 className="text-4xl font-bold tracking-tight">
          Ryan Rochmanofenna
        </h1>
        <p className="mt-3 text-lg text-muted">AI Engineer</p>

        <nav className="mt-6 flex gap-4 md:mt-8 md:flex-col md:gap-2">
          {links.map((link) => (
            <a
              key={link.label}
              className="underline underline-offset-4 hover:no-underline"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <section className="mt-10">
          <SectionHeading>Education</SectionHeading>
          <div className="mt-3 text-[15px]">
            <p className="font-medium">New York University</p>
            <p className="text-muted">
              B.A. Computer Science &amp; Mathematics
            </p>
            <p className="text-muted">Minor in Philosophy</p>
            <p className="mt-1 text-subtle">Sep 2020 — Dec 2025</p>
          </div>
        </section>
      </header>

      <main className="max-w-[68ch] space-y-14">
        <section>
          <SectionHeading>Experience</SectionHeading>
          <ul className="mt-4 space-y-8">
            {experience.map((job) => (
              <li key={job.org}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium">{job.org}</span>
                  <span className="shrink-0 text-[15px] text-muted">
                    {job.period}
                  </span>
                </div>
                <p className="text-[15px] text-muted">
                  {job.role} &middot; {job.location}
                </p>
                <p className="mt-2 text-muted">{job.description}</p>
                {job.demo && (
                  <p className="mt-2">
                    <Link
                      className="text-[15px] underline underline-offset-4 hover:no-underline"
                      href={job.demo.href}
                    >
                      {job.demo.label} &rarr;
                    </Link>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading>Projects</SectionHeading>
          <ul className="mt-4 space-y-8">
            {projects.map((project) => (
              <li key={project.name}>
                <span className="font-medium">{project.name}</span>
                <p className="mt-2 text-muted">{project.description}</p>
                <p className="mt-2">
                  {project.link.href.startsWith("/") ? (
                    <Link
                      className="text-[15px] underline underline-offset-4 hover:no-underline"
                      href={project.link.href}
                    >
                      {project.link.label} &rarr;
                    </Link>
                  ) : (
                    <a
                      className="text-[15px] underline underline-offset-4 hover:no-underline"
                      href={project.link.href}
                    >
                      {project.link.label} &rarr;
                    </a>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <footer className="border-t border-line pt-8 text-[15px] text-muted">
          Reach me at{" "}
          <a
            className="underline underline-offset-4 hover:no-underline"
            href="mailto:rr3758@nyu.edu"
          >
            rr3758@nyu.edu
          </a>
          .
        </footer>
      </main>
    </div>
  );
}
