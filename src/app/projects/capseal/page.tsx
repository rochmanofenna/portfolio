import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import ChainVerifier, { type VerifierAction } from "./ChainVerifier";

const DIR = path.join(process.cwd(), "public/projects/capseal");

export const metadata = {
  title: "CapSeal",
  description:
    "A trust layer for AI coding agents: risky actions gated before execution, every action sealed into a tamper-evident SHA-256 hash chain you can verify in your browser.",
};

type RawAction = {
  action_id: string;
  action_type: string;
  receipt_hash: string;
  canonical_fields: Record<string, unknown>;
  gate_decision: string | null;
  gate_score: number | null;
  metadata?: { description?: string; risk_label?: string | null };
};

type Manifest = {
  session_name: string;
  actions_count: number;
  chain_hash: string;
  created_at: string;
  verification_profile: string;
};

type Proof = {
  air_id: string;
  proof_type: string;
  commitment: { num_rows: number; row_root: string };
  constraint_verification: {
    num_constraints_checked: number;
    valid: boolean;
  };
  statement: { trace_spec_hash: string; num_actions: number };
};

async function loadReceipt() {
  const [manifestRaw, actionsRaw, proofRaw] = await Promise.all([
    fs.readFile(path.join(DIR, "gesture-manifest.json"), "utf8"),
    fs.readFile(path.join(DIR, "gesture-actions.jsonl"), "utf8"),
    fs.readFile(path.join(DIR, "gesture-proof.json"), "utf8"),
  ]);

  const raw: RawAction[] = actionsRaw
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line) as RawAction);

  const actions: VerifierAction[] = raw.map((action) => ({
    action_id: action.action_id,
    action_type: action.action_type,
    receipt_hash: action.receipt_hash,
    canonical_fields: action.canonical_fields,
    gate_decision: action.gate_decision,
    gate_score: action.gate_score,
    risk_label: action.metadata?.risk_label ?? null,
    description: action.metadata?.description ?? null,
  }));

  return {
    manifest: JSON.parse(manifestRaw) as Manifest,
    proof: JSON.parse(proofRaw) as Proof,
    actions,
  };
}

export default async function CapSealPage() {
  const { manifest, proof, actions } = await loadReceipt();
  const gated = actions.filter((a) => a.gate_decision);

  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-[18px] leading-relaxed">
      <Link
        href="/"
        className="text-[15px] text-neutral-500 underline underline-offset-4 hover:no-underline"
      >
        Ryan Rochmanofenna
      </Link>

      <h1 className="mt-8 text-4xl font-bold tracking-tight">CapSeal</h1>

      <p className="mt-4 text-lg text-neutral-500">
        A trust layer for AI coding agents. It learns which changes fail on your
        codebase, gates risky actions before they run, and seals every action
        into a tamper-evident hash chain &mdash; so what an agent did to your
        repo is a checkable fact rather than a claim.
      </p>

      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
        <a
          className="underline underline-offset-4 hover:no-underline"
          href="https://github.com/rochmanofenna/capseal"
        >
          Source on GitHub &rarr;
        </a>
      </p>

      <section className="mt-16">
        <h2 className="font-medium">Verify a real receipt, right here</h2>
        <p className="mt-2 text-neutral-500">
          Below is an actual sealed run &mdash; a{" "}
          <span className="font-mono text-[15px]">{manifest.session_name}</span>{" "}
          session where an agent patched a command-injection bug. Verifying a
          receipt is deterministic arithmetic, so it needs no server: your
          browser recomputes every SHA-256 hash and walks the chain itself.
        </p>

        <ChainVerifier actions={actions} chainHash={manifest.chain_hash} />
      </section>

      <section className="mt-16">
        <h2 className="font-medium">What a seal actually covers</h2>
        <p className="mt-2 text-neutral-500">
          Each action hashes a fixed set of canonical fields: its identity, its
          gate decision, its timestamp, its parent&rsquo;s hash, and{" "}
          <em>hashes</em> of the instruction, input, and output &mdash; never
          the content itself. So a receipt stays a few kilobytes and leaks no
          source code, while any change to the underlying content still breaks
          the seal. Each action commits to its parent, so altering action three
          invalidates three and severs every link after it.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-medium">Gating before execution, not after</h2>
        <p className="mt-2 text-neutral-500">
          A receipt proves what happened. The gate decides whether it should
          happen at all. CapSeal learns per-codebase failure rates as Beta
          posteriors over risk features, then scores each proposed action before
          it runs. In this run, {gated.length} of {actions.length} actions were
          held for human review:
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-[15px]">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="py-2 pr-4 font-medium">Decision</th>
                <th className="py-2 pr-4 font-medium">Score</th>
                <th className="py-2 font-medium">Risk features</th>
              </tr>
            </thead>
            <tbody>
              {gated.slice(0, 3).map((action) => (
                <tr
                  key={action.action_id}
                  className="border-b border-neutral-100 dark:border-neutral-900"
                >
                  <td className="py-2 pr-4 font-mono text-xs">
                    {action.gate_decision}
                  </td>
                  <td className="py-2 pr-4 font-mono tabular-nums">
                    {action.gate_score}
                  </td>
                  <td className="py-2 font-mono text-xs text-neutral-500">
                    {action.risk_label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[15px] text-neutral-500">
          Those risk features are the model&rsquo;s reasoning made legible:
          security-sensitive, single-file, untested. A human sees why something
          was stopped, not just that it was.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="font-medium">Inspecting a receipt from the CLI</h2>
        <video
          controls
          preload="metadata"
          playsInline
          className="mt-4 w-full border border-neutral-200 dark:border-neutral-800"
          src="/projects/capseal/inspecting-a-receipt.mp4"
        />
      </section>

      <section className="mt-16">
        <h2 className="font-medium">Beyond the hash chain</h2>
        <p className="mt-2 text-neutral-500">
          A hash chain proves the log wasn&rsquo;t edited after the fact. It
          doesn&rsquo;t prove the run followed its own rules. For that, CapSeal
          also emits a transparent integrity proof &mdash; no trusted setup,
          post-quantum assumptions &mdash; built from an algebraic
          intermediate representation over the action trace, vector commitments,
          FRI folding, and a Merkle commitment, with written binding and
          soundness bounds.
        </p>

        <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-neutral-200 py-4 font-mono text-[15px] sm:grid-cols-4 dark:border-neutral-800">
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">
              AIR
            </dt>
            <dd>{proof.air_id}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">
              Constraints
            </dt>
            <dd>{proof.constraint_verification.num_constraints_checked}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">
              Trace rows
            </dt>
            <dd>{proof.commitment.num_rows}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-neutral-400">
              Verified
            </dt>
            <dd>{String(proof.constraint_verification.valid)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-[15px] text-neutral-500">
          That part isn&rsquo;t demoed live: proving is far too heavy to run in
          a browser tab, and a verifier for it would be a lot of JavaScript to
          show something most readers can&rsquo;t distinguish from the hash
          chain they just watched break.
        </p>
      </section>

      <section className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
          Stack
        </h2>
        <p className="mt-3 text-neutral-500">
          Python, MCP (official SDK), Rust, Semgrep, SHA-256 receipt chains.
          Runs as an MCP server, so any agent that speaks MCP is gated and
          sealed without changing how you work.
        </p>
      </section>
    </main>
  );
}
