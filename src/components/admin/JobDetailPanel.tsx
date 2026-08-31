"use client";

import { Camera, Download, Share2, Maximize2 } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import type { Job } from "@/lib/mock-data";
import { useTheme } from "@/components/shared/ThemeProvider";

const STATUS_LABELS: Record<string, string> = {
  pending:     "Pending",
  in_progress: "In Progress",
  on_hold:     "On Hold",
  completed:   "Completed",
};

const STATUS_DOT: Record<string, string> = {
  pending:     "#FAAD14",
  in_progress: "#FB923C",
  on_hold:     "#8A93A0",
  completed:   "#22C55E",
};

interface JobDetailPanelProps {
  job: Job;
  onUpdateStatus?: () => void;
}

export function JobDetailPanel({ job, onUpdateStatus }: JobDetailPanelProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const shadow = dark
    ? "0 1px 3px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(20,22,26,0.06)";

  return (
    <div className="col-span-6 flex flex-col gap-5">
      {/* ── Latest Update card ── */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--card)", boxShadow: shadow }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
              Latest Update
            </p>
            <h2
              className="font-oswald text-lg font-semibold"
              style={{ color: "var(--ink)" }}
            >
              {job.model} — {job.tag}
            </h2>
          </div>
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-inter text-[11px] font-semibold"
            style={{ background: "var(--warn)", color: "var(--ink)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: STATUS_DOT[job.status] ?? "#FB923C" }}
            />
            {STATUS_LABELS[job.status] ?? job.status}
          </span>
        </div>

        {/* Photo placeholder */}
        <div
          className="relative w-full aspect-video rounded-xl flex items-center justify-center"
          style={{ background: "var(--chip)" }}
        >
          <div className="flex flex-col items-center gap-2">
            <Camera size={26} color="var(--slate)" />
            <span className="font-inter text-xs" style={{ color: "var(--slate)" }}>
              Photo update — uploaded {job.photoTime}
            </span>
          </div>
          <span
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full font-inter text-[10px] font-semibold"
            style={{ background: "var(--card)", color: "var(--ink)" }}
          >
            Photo Update
          </span>
          <button
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--card)" }}
            aria-label="Expand photo"
          >
            <Maximize2 size={13} color="var(--ink)" />
          </button>
        </div>

        {/* Note */}
        <p
          className="font-inter text-xs mt-3 p-3 rounded-lg"
          style={{ background: "var(--chip)", color: "var(--ink)" }}
        >
          &quot;{job.note}&quot;
        </p>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-full font-inter text-[11px] font-medium border"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--ink)",
            }}
          >
            <Download size={12} /> Save photo
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-full font-inter text-[11px] font-medium border"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--ink)",
            }}
          >
            <Share2 size={12} /> Notify client
          </button>
        </div>
      </div>

      {/* ── Job Progress card ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--card)", boxShadow: shadow }}
      >
        <h3
          className="font-oswald text-base font-semibold mb-4"
          style={{ color: "var(--ink)" }}
        >
          Job Progress
        </h3>
        <div className="flex flex-col gap-4">
          {job.progress.map((p) => (
            <ProgressBar key={p.label} label={p.label} pct={p.pct} />
          ))}
        </div>
        <button
          id="btn-update-job-status"
          onClick={onUpdateStatus}
          className="w-full mt-5 py-3 rounded-xl font-inter text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--lime)", color: "var(--ink-2)" }}
        >
          Update Job Status
        </button>
      </div>
    </div>
  );
}
