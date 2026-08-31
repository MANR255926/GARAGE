"use client";

import { Check, Camera, Clock } from "lucide-react";
import type { JobHistoryItem, JobStatus } from "@/lib/mock-data";

interface StatusStepperProps {
  history: JobHistoryItem[];
  currentStatus: JobStatus;
}

export function StatusStepper({ history }: StatusStepperProps) {
  return (
    <div className="flex flex-col gap-4">
      {history.map((item, index) => {
        const isLast = index === history.length - 1;

        return (
          <div key={item.id} className="relative flex items-start gap-3.5">
            {/* Vertical connecting line */}
            {!isLast && (
              <div
                className="absolute left-4 top-8 bottom-0 w-0.5"
                style={{ background: "var(--border)" }}
              />
            )}

            {/* Stepper Node Icon */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border relative z-10 shadow-sm transition-all"
              style={{
                background: isLast ? "var(--lime)" : "var(--card)",
                borderColor: isLast ? "var(--lime)" : "var(--border)",
              }}
            >
              {item.status === "completed" ? (
                <Check size={14} className="stroke-[3]" style={{ color: "var(--ink-2)" }} />
              ) : isLast ? (
                <div
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ background: "var(--ink-2)" }}
                />
              ) : (
                <Check size={13} style={{ color: "var(--slate)" }} />
              )}
            </div>

            {/* Step Card Content */}
            <div
              className="flex-1 rounded-2xl p-4 border transition-all duration-200"
              style={{
                background: "var(--card)",
                borderColor: isLast ? "var(--lime)" : "var(--border)",
                borderWidth: isLast ? "1.5px" : "1px",
                boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className="font-inter text-xs font-semibold"
                  style={{ color: "var(--ink)" }}
                >
                  {item.statusText}
                </span>
                <span
                  className="flex items-center gap-1 font-mono text-[10px] font-medium"
                  style={{ color: "var(--slate)" }}
                >
                  <Clock size={11} /> {item.time}
                </span>
              </div>

              <p className="font-inter text-xs leading-relaxed mb-2" style={{ color: "var(--slate)" }}>
                {item.note}
              </p>

              {/* Photo attachment placeholder if present */}
              {item.photoUrl && (
                <div
                  className="relative rounded-xl p-3 flex items-center gap-2.5 border mt-2"
                  style={{ background: "var(--chip)", borderColor: "var(--border)" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--card)" }}
                  >
                    <Camera size={16} color="var(--slate)" />
                  </div>
                  <div>
                    <p className="font-inter text-xs font-medium" style={{ color: "var(--ink)" }}>
                      Inspection Photo Attached
                    </p>
                    <p className="font-inter text-[10px]" style={{ color: "var(--slate)" }}>
                      Uploaded by technician at {item.time}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}