import type { LogStage } from "./types";

// Manim's own palette, so the stage colors match the thing being rendered.
export const STAGES: {
  stage: LogStage;
  color: string;
  description: string;
}[] = [
  {
    stage: "code_generation",
    color: "#58C4DD",
    description:
      "One call to Claude writes a complete Manim scene, narration included.",
  },
  {
    stage: "sanitize",
    color: "#9A72AC",
    description:
      "Rewrites typographic characters the model emits — em dashes, curly quotes — that LaTeX refuses to compile.",
  },
  {
    stage: "validate",
    color: "#83C167",
    description:
      "Parses the scene, checks the class exists, and rejects narration too long for the speech endpoint. Failures here are repaired before a render is paid for.",
  },
  {
    stage: "render",
    color: "#F0AC5F",
    description:
      "Manim renders frame by frame. A render that fails goes back to the model with the error attached; an outage is retried without one.",
  },
  {
    stage: "done",
    color: "#5CD0B3",
    description: "The MP4 is muxed for streaming and checked for size.",
  },
];

export const STAGE_COLOR = Object.fromEntries(
  STAGES.map(({ stage, color }) => [stage, color]),
) as Record<LogStage, string>;

export type Span = { stage: LogStage; start: number; end: number };

/** Contiguous runs of a stage, so a repeated stage shows as a second band. */
export function toSpans(
  events: { stage: LogStage; t_ms: number }[],
  total: number,
): Span[] {
  const spans: Span[] = [];

  for (const event of events) {
    const last = spans[spans.length - 1];
    if (last && last.stage === event.stage) {
      last.end = event.t_ms;
    } else {
      if (last) last.end = event.t_ms;
      spans.push({ stage: event.stage, start: event.t_ms, end: event.t_ms });
    }
  }

  if (spans.length) spans[spans.length - 1].end = total;
  return spans;
}
