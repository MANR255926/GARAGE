"use client";

interface ProgressBarProps {
  label: string;
  pct: number;
}

export function ProgressBar({ label, pct }: ProgressBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="font-inter text-sm font-medium"
          style={{ color: "var(--ink)" }}
        >
          {label}
        </span>
        <span
          className="font-mono text-xs font-semibold tabular-nums"
          style={{ color: "var(--slate)" }}
        >
          {pct}%
        </span>
      </div>
      <div
        className="h-2 rounded-full w-full"
        style={{ background: "var(--chip)" }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? "var(--lime)" : "var(--fill)",
          }}
        />
      </div>
    </div>
  );
}
