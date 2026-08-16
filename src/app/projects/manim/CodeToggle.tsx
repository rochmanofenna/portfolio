"use client";

import { useState } from "react";

export default function CodeToggle({ code }: { code: string }) {
  const [open, setOpen] = useState(false);
  const lineCount = code.trimEnd().split("\n").length;

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((value) => !value)}
        className="text-sm underline underline-offset-4 hover:no-underline"
        aria-expanded={open}
      >
        {open ? "Hide" : "Show"} generated scene.py ({lineCount} lines)
      </button>

      {open && (
        <pre className="mt-2 max-h-96 overflow-auto border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs leading-relaxed dark:border-neutral-800 dark:bg-neutral-900">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
