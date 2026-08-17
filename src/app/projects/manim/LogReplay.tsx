"use client";

import { useEffect, useMemo, useState } from "react";
import { STAGE_COLOR, toSpans } from "./stages";
import type { LogEvent } from "./types";

// Real gaps between events run to 67s of silent Manim rendering. Replaying
// that faithfully means staring at a frozen pane, so the wait is compressed
// while the displayed timestamps stay the real ones.
const MAX_GAP_MS = 1200;
const MIN_GAP_MS = 220;

function compressGap(fromMs: number, toMs: number) {
  const real = toMs - fromMs;
  if (real <= 0) return MIN_GAP_MS;
  return Math.min(Math.max(real, MIN_GAP_MS), MAX_GAP_MS);
}

function formatOffset(ms: number) {
  return `+${(ms / 1000).toFixed(1)}s`;
}

const LEVEL_STYLES: Record<LogEvent["level"], string> = {
  info: "text-muted",
  warn: "text-amber-600 dark:text-amber-500",
  error: "text-red-600 dark:text-red-500",
};

export default function LogReplay({
  events,
  totalMs,
}: {
  events: LogEvent[];
  totalMs: number;
}) {
  const [shown, setShown] = useState(0);
  const [running, setRunning] = useState(false);
  const [clockMs, setClockMs] = useState(0);

  const spans = useMemo(() => toSpans(events, totalMs), [events, totalMs]);

  useEffect(() => {
    if (!running) return;

    if (shown >= events.length) {
      setRunning(false);
      setClockMs(totalMs);
      return;
    }

    const fromMs = shown === 0 ? 0 : events[shown - 1].t_ms;
    const toMs = events[shown].t_ms;
    const delay = shown === 0 ? MIN_GAP_MS : compressGap(fromMs, toMs);

    // Interpolate the displayed clock across the compressed delay, so during
    // the render gap it visibly races from +34.3s to +101.0s.
    const startedAt = performance.now();
    let frame = requestAnimationFrame(function tick() {
      const progress = Math.min(1, (performance.now() - startedAt) / delay);
      setClockMs(fromMs + (toMs - fromMs) * progress);
      if (progress < 1) frame = requestAnimationFrame(tick);
    });

    const timer = setTimeout(() => setShown((count) => count + 1), delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [running, shown, events, totalMs]);

  function start() {
    setShown(0);
    setClockMs(0);
    setRunning(true);
  }

  const finished = !running && shown >= events.length;
  const idle = !running && shown === 0;
  const progress = idle ? 1 : Math.min(1, clockMs / totalMs);

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-4">
        <button
          onClick={start}
          disabled={running}
          className="text-sm underline underline-offset-4 hover:no-underline disabled:cursor-default disabled:no-underline disabled:opacity-50"
        >
          {idle ? "Replay this run" : running ? "Running…" : "Replay again"}
        </button>
        <span className="font-mono text-xs tabular-nums text-muted">
          {formatOffset(clockMs)}
        </span>
      </div>

      {/* Proportional stage timeline: render dominates, which is the point. */}
      <div
        className="mt-2 flex h-1.5 w-full overflow-hidden"
        style={{ opacity: idle ? 0.45 : 1 }}
      >
        {spans.map((span, i) => (
          <div
            key={i}
            title={span.stage}
            style={{
              width: `${((span.end - span.start) / totalMs) * 100}%`,
              backgroundColor: STAGE_COLOR[span.stage],
              filter:
                idle || span.start / totalMs < progress
                  ? "none"
                  : "grayscale(1) opacity(0.3)",
            }}
          />
        ))}
      </div>

      <ol
        aria-live="polite"
        className="mt-3 space-y-1 border-l border-line pl-4 font-mono text-xs"
      >
        {events.slice(0, shown).map((event, i) => (
          <li key={i} className="flex gap-3">
            <span className="w-14 shrink-0 tabular-nums text-subtle">
              {formatOffset(event.t_ms)}
            </span>
            <span className="flex w-32 shrink-0 items-center gap-2 text-subtle">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: STAGE_COLOR[event.stage] }}
              />
              {event.stage}
            </span>
            <span className={LEVEL_STYLES[event.level]}>{event.msg}</span>
          </li>
        ))}

        {idle && (
          <li className="text-subtle">
            {events.length} events, {(totalMs / 1000).toFixed(1)}s wall time
          </li>
        )}

        {running && shown > 0 && shown < events.length && (
          <li className="text-subtle">…</li>
        )}

        {finished && (
          <li className="text-subtle">
            done in {(totalMs / 1000).toFixed(1)}s
          </li>
        )}
      </ol>
    </div>
  );
}
