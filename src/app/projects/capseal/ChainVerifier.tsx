"use client";

import { useEffect, useState } from "react";

export type VerifierAction = {
  action_id: string;
  action_type: string;
  receipt_hash: string;
  canonical_fields: Record<string, unknown>;
  gate_decision: string | null;
  gate_score: number | null;
  risk_label: string | null;
  description: string | null;
};

type Result = { computed: string; sealOk: boolean; linkOk: boolean };

/**
 * Must byte-match the sealing side: json.dumps(sort_keys=True,
 * separators=(",", ":")) in Python is the same output as JSON.stringify over
 * key-sorted input here.
 */
function canonicalJson(fields: Record<string, unknown>) {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(fields).sort()) sorted[key] = fields[key];
  return JSON.stringify(sorted);
}

async function sha256Hex(input: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function short(hash: string) {
  return `${hash.slice(0, 10)}…`;
}

export default function ChainVerifier({
  actions,
  chainHash,
}: {
  actions: VerifierAction[];
  chainHash: string;
}) {
  const [edits, setEdits] = useState<Record<number, Record<string, unknown>>>(
    {},
  );
  const [results, setResults] = useState<Result[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const computedResults: Result[] = [];

      for (let i = 0; i < actions.length; i++) {
        const fields = { ...actions[i].canonical_fields, ...(edits[i] ?? {}) };
        const computed = await sha256Hex(canonicalJson(fields));
        const parent = fields.parent_receipt_hash as string | null;

        computedResults.push({
          computed,
          sealOk: computed === actions[i].receipt_hash,
          linkOk:
            i === 0
              ? parent === null
              : parent === computedResults[i - 1].computed,
        });
      }

      if (!cancelled) setResults(computedResults);
    })();

    return () => {
      cancelled = true;
    };
  }, [actions, edits]);

  function tamper(index: number, patch: Record<string, unknown>) {
    setEdits((current) => ({
      ...current,
      [index]: { ...(current[index] ?? {}), ...patch },
    }));
  }

  const tampered = Object.keys(edits).length > 0;
  const intact =
    results !== null &&
    results.every((r) => r.sealOk && r.linkOk) &&
    results[results.length - 1]?.computed === chainHash;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="font-mono text-[15px]">
          {results === null ? (
            <span className="text-neutral-500">verifying…</span>
          ) : intact ? (
            <span className="text-emerald-600 dark:text-emerald-500">
              chain intact &mdash; {results.length}/{results.length} hashes
              valid
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-500">
              chain broken at action{" "}
              {results.findIndex((r) => !r.sealOk || !r.linkOk)}
            </span>
          )}
        </p>

        {tampered && (
          <button
            onClick={() => setEdits({})}
            className="text-[15px] underline underline-offset-4 hover:no-underline"
          >
            Reset receipt
          </button>
        )}
      </div>

      <p className="mt-2 text-[15px] text-neutral-500">
        Hashes are recomputed in your browser with SHA-256. Nothing is sent
        anywhere &mdash; edit a sealed field below and watch the chain break.
      </p>

      <ol className="mt-6 space-y-4">
        {actions.map((action, i) => {
          const result = results?.[i];
          const broken = result && (!result.sealOk || !result.linkOk);

          return (
            <li
              key={action.action_id}
              className={`border-l-2 pl-4 ${
                broken
                  ? "border-red-500"
                  : "border-neutral-200 dark:border-neutral-800"
              }`}
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-mono text-xs text-neutral-400">
                  {String(i).padStart(2, "0")}
                </span>
                <span className="font-mono text-[15px]">
                  {action.action_type}
                </span>
                {action.gate_decision && (
                  <span className="font-mono text-xs text-amber-600 dark:text-amber-500">
                    {action.gate_decision}
                    {action.gate_score !== null && ` (${action.gate_score})`}
                  </span>
                )}
              </div>

              {action.description && (
                <p className="mt-1 text-[15px] text-neutral-500">
                  {action.description}
                </p>
              )}

              <div className="mt-2 font-mono text-xs">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-neutral-400">
                    sealed {short(action.receipt_hash)}
                  </span>
                  <span
                    className={
                      result?.sealOk
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-600 dark:text-red-500"
                    }
                  >
                    computed {result ? short(result.computed) : "…"}
                    {result && (result.sealOk ? " ✓" : " ✗")}
                  </span>
                  {i > 0 && (
                    <span
                      className={
                        result?.linkOk
                          ? "text-neutral-400"
                          : "text-red-600 dark:text-red-500"
                      }
                    >
                      link to previous {result?.linkOk ? "✓" : "✗ severed"}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <button
                  onClick={() =>
                    tamper(i, {
                      success: !(
                        (edits[i]?.success ??
                          action.canonical_fields.success) as boolean
                      ),
                    })
                  }
                  className="underline underline-offset-4 hover:no-underline"
                >
                  flip success
                </button>
                {action.gate_decision && (
                  <button
                    onClick={() => tamper(i, { gate_decision: "auto_approve" })}
                    className="underline underline-offset-4 hover:no-underline"
                  >
                    forge approval
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 font-mono text-xs text-neutral-400">
        manifest.chain_hash {short(chainHash)}
      </p>
    </div>
  );
}
