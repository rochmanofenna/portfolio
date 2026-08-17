import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import CodeToggle from "./CodeToggle";
import LogReplay from "./LogReplay";
import { STAGES } from "./stages";
import type { Demo, IndexEntry, Meta, Run } from "./types";

const DEMOS_DIR = path.join(process.cwd(), "public/demos/manim");

export const metadata = {
  title: "Generative Manim",
  description:
    "Text prompt to rendered math animation: five recorded pipeline runs, with the logs and generated Manim source behind each one.",
};

async function readJson<T>(...segments: string[]): Promise<T> {
  const raw = await fs.readFile(path.join(DEMOS_DIR, ...segments), "utf8");
  return JSON.parse(raw) as T;
}

async function loadDemos(): Promise<Demo[]> {
  const index = await readJson<IndexEntry[]>("index.json");

  return Promise.all(
    index.map(async (entry) => ({
      entry,
      run: await readJson<Run>(entry.slug, "run.json"),
      meta: await readJson<Meta>(entry.slug, "meta.json"),
      code: await fs.readFile(
        path.join(DEMOS_DIR, entry.slug, "scene.py"),
        "utf8",
      ),
    })),
  );
}

function formatWallTime(ms: number) {
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function formatCents(cents: number) {
  return cents < 100 ? `${cents.toFixed(1)}¢` : `$${(cents / 100).toFixed(2)}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-subtle">
        {label}
      </dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

export default async function ManimPage() {
  const demos = await loadDemos();

  const totalCents = demos.reduce((sum, d) => sum + d.meta.cost_cents, 0);
  const totalMs = demos.reduce((sum, d) => sum + d.meta.total_ms, 0);
  const totalVideoSeconds = demos.reduce((sum, d) => sum + d.meta.duration_s, 0);

  return (
    <main className="mx-auto max-w-[72ch] px-6 py-24 text-[18px] leading-relaxed">
      <Link
        href="/"
        className="text-sm text-muted underline underline-offset-4 hover:no-underline"
      >
        Ryan Rochmanofenna
      </Link>

      <h1 className="mt-8 text-4xl font-bold tracking-tight">
        Generative Manim
      </h1>

      <p className="mt-4 text-lg text-muted">
        A text prompt becomes a narrated math animation: an LLM writes a Manim
        scene, a sanitizer and pre-flight validator catch what it got wrong, and
        Manim renders the result to video.
      </p>

      <p className="mt-4">
        <a
          className="text-sm underline underline-offset-4 hover:no-underline"
          href="https://github.com/rochmanofenna/Generative-Manim-Template"
        >
          Source on GitHub &rarr;
        </a>
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-4 text-sm sm:grid-cols-4">
        <Stat label="Runs" value={String(demos.length)} />
        <Stat label="Total cost" value={formatCents(totalCents)} />
        <Stat label="Pipeline time" value={formatWallTime(totalMs)} />
        <Stat
          label="Video produced"
          value={formatWallTime(totalVideoSeconds * 1000)}
        />
      </dl>

      <p className="mt-4 text-sm text-muted">
        These are recorded runs, not live generation &mdash; each one costs real
        API tokens and takes minutes. The logs and timestamps below are the real
        ones; only the waiting between events is compressed, so you don&rsquo;t
        sit through 67 seconds of silent rendering.
      </p>

      <div className="mt-16 space-y-20">
        {demos.map(({ entry, run, meta, code }) => (
          <section key={entry.slug}>
            <h2 className="text-xl font-medium tracking-tight">
              &ldquo;{entry.prompt}&rdquo;
            </h2>

            <div className={meta.aspect_ratio === "9:16" ? "max-w-xs" : ""}>
              <video
                controls
                preload="metadata"
                playsInline
                className="mt-4 w-full border border-line"
                src={`/demos/manim/${entry.slug}/out.mp4`}
              />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Stat label="Model" value={meta.model} />
              <Stat label="Cost" value={formatCents(meta.cost_cents)} />
              <Stat label="Pipeline" value={formatWallTime(meta.total_ms)} />
              <Stat label="Attempts" value={String(meta.attempts)} />
              <Stat label="Output" value={`${meta.duration_s.toFixed(0)}s video`} />
              <Stat label="Resolution" value={meta.resolution} />
              <Stat label="Frames" value={meta.frames.toLocaleString()} />
              <Stat
                label="Tokens out"
                value={meta.output_tokens.toLocaleString()}
              />
            </dl>

            <LogReplay events={run.events} totalMs={run.total_ms} />
            <CodeToggle code={code} />
          </section>
        ))}
      </div>

      <section className="mt-20 border-t border-line pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          What the stages do
        </h2>

        <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {STAGES.map(({ stage, color, description }) => (
            <div key={stage}>
              <dt className="flex items-center gap-2 font-mono text-xs">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {stage}
              </dt>
              <dd className="mt-1 text-sm text-muted">{description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
