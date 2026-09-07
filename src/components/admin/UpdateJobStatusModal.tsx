"use client";

import { useState } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import type { Job, JobStatus } from "@/lib/mock-data";

const STATUSES: { value: JobStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

interface UpdateJobStatusModalProps {
  job: Job;
  bookingId?: string;
  onClose: () => void;
  onSaved?: () => void;
  onSave?: (updates: { status: JobStatus; note: string; progress: number }) => void;
}

export function UpdateJobStatusModal({
  job,
  bookingId,
  onClose,
  onSaved,
  onSave,
}: UpdateJobStatusModalProps) {
  const [status, setStatus] = useState<JobStatus>(job.status);
  const [note, setNote] = useState(job.note === "No technician notes logged yet." ? "" : job.note);
  const [progress, setProgress] = useState(
    job.progress.reduce((sum, p) => sum + p.pct, 0) /
      Math.max(job.progress.length, 1)
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);

    // If bookingId is provided, trigger real DB update
    if (bookingId) {
      try {
        setSubmitting(true);
        const res = await fetch(`/api/bookings/${bookingId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status_text: status,
            note: note.trim() || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to update job status.");
        }

        onSaved?.();
        onClose();
        return;
      } catch (err: unknown) {
        console.error("Status update error:", err);
        const msg = err instanceof Error ? err.message : "Failed to update status.";
        setError(msg);
        setSubmitting(false);
        return;
      }
    }

    // Fallback if no bookingId
    onSave?.({ status, note, progress });
    onSaved?.();
    onClose();
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.5)", zIndex: 100 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="rounded-2xl p-6 w-full max-w-md mx-4 relative"
        style={{
          background: "var(--card)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Close */}
        <button
          id="btn-modal-close"
          disabled={submitting}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: "var(--chip)" }}
          aria-label="Close modal"
        >
          <X size={14} color="var(--ink)" />
        </button>

        <h2
          id="modal-title"
          className="font-oswald text-xl font-semibold mb-1"
          style={{ color: "var(--ink)" }}
        >
          Update Job Status
        </h2>
        <p className="font-inter text-xs mb-4" style={{ color: "var(--slate)" }}>
          {job.model} · {job.plate}
        </p>

        {error && (
          <div
            className="rounded-xl p-3 mb-4 flex items-center gap-2 text-xs font-inter border"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              borderColor: "rgba(239, 68, 68, 0.3)",
              color: "#EF4444",
            }}
          >
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Status dropdown */}
        <label className="block mb-1">
          <span className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
            Status
          </span>
        </label>
        <select
          id="select-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as JobStatus)}
          className="w-full rounded-xl px-3 py-2.5 font-inter text-sm mb-4 border outline-none"
          style={{
            background: "var(--chip)",
            color: "var(--ink)",
            borderColor: "var(--border)",
          }}
        >
          {STATUSES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {/* Note textarea */}
        <label className="block mb-1">
          <span className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
            Technician Note
          </span>
        </label>
        <textarea
          id="textarea-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 font-inter text-sm mb-4 border outline-none resize-none"
          style={{
            background: "var(--chip)",
            color: "var(--ink)",
            borderColor: "var(--border)",
          }}
          placeholder="Describe the latest workshop update..."
        />

        {/* Progress slider */}
        <label className="flex items-center justify-between mb-1">
          <span className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
            Overall Progress (Preview)
          </span>
          <span className="font-mono text-xs font-semibold" style={{ color: "var(--slate)" }}>
            {Math.round(progress)}%
          </span>
        </label>
        <input
          id="slider-progress"
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full mb-4 accent-lime"
          style={{ accentColor: "var(--lime)" }}
        />

        {/* Photo upload (mock) */}
        <label className="block mb-1">
          <span className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
            Photo Attachment (Optional)
          </span>
        </label>
        <label
          htmlFor="input-photo"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 border cursor-pointer mb-5"
          style={{
            background: "var(--chip)",
            borderColor: "var(--border)",
            color: "var(--slate)",
          }}
        >
          <Upload size={14} />
          <span className="font-inter text-xs">
            {fileName ?? "Choose photo (mock — no upload)"}
          </span>
        </label>
        <input
          id="input-photo"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            id="btn-modal-save"
            disabled={submitting}
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-inter text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
            style={{ background: "var(--lime)", color: "var(--ink-2)" }}
          >
            {submitting ? "Saving..." : "Save Update"}
          </button>
          <button
            id="btn-modal-notify"
            disabled={submitting}
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-inter text-sm font-semibold border transition-all hover:opacity-80 active:scale-[0.99] disabled:opacity-50"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--ink)",
            }}
          >
            {submitting ? "Saving..." : "Save & Notify"}
          </button>
        </div>
      </div>
    </div>
  );
}
