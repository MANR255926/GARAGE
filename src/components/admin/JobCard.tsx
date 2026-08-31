"use client";

import { Calendar, Car, MoreVertical } from "lucide-react";
import type { Job, Mechanic } from "@/lib/mock-data";
import { useTheme } from "@/components/shared/ThemeProvider";

interface JobCardProps {
  job: Job;
  mechanic: Mechanic;
  selected: boolean;
  onClick: () => void;
}

export function JobCard({ job, mechanic, selected, onClick }: JobCardProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const shadow = dark
    ? "0 1px 3px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(20,22,26,0.06)";

  return (
    <button
      id={`job-card-${job.id}`}
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200"
      style={{
        background: "var(--card)",
        border: selected
          ? "2px solid var(--lime)"
          : "2px solid transparent",
        boxShadow: shadow,
      }}
      aria-pressed={selected}
      aria-label={`Job for ${job.model} — ${job.tag}`}
    >
      {/* Date row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} color="var(--slate)" />
          <span className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
            {job.date}
          </span>
        </div>
        <MoreVertical size={14} color="var(--slate)" />
      </div>

      {/* Car glyph with plate badge */}
      <div
        className="relative w-full h-24 rounded-xl flex items-center justify-center mb-3"
        style={{ background: "var(--chip)" }}
      >
        <Car size={40} color="var(--ink)" strokeWidth={1.2} className="opacity-80" />
        <span
          className="absolute bottom-2 right-2 px-2 py-0.5 rounded font-mono text-[10px] font-semibold tracking-wide"
          style={{ background: "var(--ink-2)", color: "var(--lime)" }}
        >
          {job.plate}
        </span>
      </div>

      {/* Mechanic avatar + name + service tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center font-inter text-[10px] font-semibold"
            style={{ background: "var(--chip)", color: "var(--ink)" }}
          >
            {mechanic.initials}
          </div>
          <div>
            <p className="font-inter text-xs font-medium" style={{ color: "var(--ink)" }}>
              {mechanic.name}
            </p>
            <p className="font-inter text-[10px]" style={{ color: "var(--slate)" }}>
              Mechanic
            </p>
          </div>
        </div>
        <span
          className="font-inter text-[10px] font-medium px-2 py-1 rounded-full"
          style={{
            background: job.status === "in_progress" ? "var(--lime)" : "var(--chip)",
            color: job.status === "in_progress" ? "var(--ink-2)" : "var(--ink)",
          }}
        >
          {job.tag}
        </span>
      </div>
    </button>
  );
}
