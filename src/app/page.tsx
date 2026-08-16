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
    period: "May 2022 — Aug 2022; May 2023 — Jun 2023",
    location: "NYC",
    description:
      "Real-time order-tracking backend on AWS Lambda serving 10k+ concurrent sessions at 99.9% uptime.",
  },
];

const projects = [
  {
    name: "CapSeal",
    description:
      "MCP server that gates AI-coding-agent actions against a per-codebase learned risk model, then seals each action into a tamper-evident, SHA-256 hash-chained receipt with a verifying CLI.",
    href: "/projects/capseal",
  },
  {
    name: "Sajian",
    description:
      "Multi-tenant restaurant platform: one Next.js app serving many restaurants by subdomain, with AI-generated storefronts and live QR-to-cashier ordering into the ESB point-of-sale.",
    href: "/projects/sajian",
  },
  {
    name: "Mindiology",
    description:
      "Site for my parents' F&B group and cafe. Became the first live tenant on Sajian.",
    href: "https://github.com/rochmanofenna/mindiology",
  },
];

const links = [
  { label: "GitHub", href: "https://github.com/rochmanofenna" },
  { label: "LinkedIn", href: "https://linkedin.com/in/ryanroch" },
  { label: "Email", href: "mailto:rr3758@nyu.edu" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
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
        <p className="mt-3 text-lg text-neutral-500">AI Engineer</p>

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
      </header>

      <main className="space-y-14">
        <section>
          <SectionHeading>Education</SectionHeading>
          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium">New York University</span>
              <span className="shrink-0 text-[15px] text-neutral-500">
                Sep 2020 — Dec 2025
              </span>
            </div>
            <p className="text-neutral-500">
              B.A. Computer Science &amp; Mathematics, Minor in Philosophy
            </p>
          </div>
        </section>

        <section>
          <SectionHeading>Experience</SectionHeading>
          <ul className="mt-4 space-y-8">
            {experience.map((job) => (
              <li key={job.org}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-medium">{job.org}</span>
                  <span className="shrink-0 text-[15px] text-neutral-500">
                    {job.period}
                  </span>
                </div>
                <p className="text-[15px] text-neutral-500">
                  {job.role} &middot; {job.location}
                </p>
                <p className="mt-2 text-neutral-500">{job.description}</p>
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
                <a
                  className="font-medium underline underline-offset-4 hover:no-underline"
                  href={project.href}
                >
                  {project.name}
                </a>
                <p className="mt-2 text-neutral-500">{project.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
