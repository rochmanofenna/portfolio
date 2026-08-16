export type LogLevel = "info" | "warn" | "error";

export type LogStage =
  | "code_generation"
  | "sanitize"
  | "validate"
  | "render"
  | "done";

export type LogEvent = {
  t_ms: number;
  stage: LogStage;
  level: LogLevel;
  msg: string;
};

export type Run = {
  slug: string;
  started_at: string;
  total_ms: number;
  events: LogEvent[];
};

export type Meta = {
  slug: string;
  model: string;
  attempts: number;
  llm_calls: number;
  input_tokens: number;
  output_tokens: number;
  cost_cents: number;
  total_ms: number;
  aspect_ratio: string;
  quality: string;
  resolution: string;
  duration_s: number;
  frames: number;
  size_bytes: number;
  has_audio: boolean;
  voiceover: boolean;
};

export type IndexEntry = {
  slug: string;
  prompt: string;
  aspect_ratio: string;
  duration_s: number;
  model: string;
  cost_cents: number;
  attempts: number;
  total_ms: number;
  has_video: boolean;
  error: string | null;
};

export type Demo = {
  entry: IndexEntry;
  run: Run;
  meta: Meta;
  code: string;
};
