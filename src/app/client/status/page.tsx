"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sun,
  Moon,
  Phone,
} from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { useTheme } from "@/components/shared/ThemeProvider";
import { VehicleCard } from "@/components/client/VehicleCard";
import { StatusStepper } from "@/components/client/StatusStepper";
import {
  CLIENT_JOB,
  CLIENT_VEHICLE,
  CLIENT_JOB_HISTORY,
  MECHANICS,
} from "@/lib/mock-data";

export default function ClientStatusPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const mechanic = MECHANICS[CLIENT_JOB.mechanicId];

  // Overall progress percentage for CLIENT_JOB
  const overallProgress = Math.round(
    CLIENT_JOB.progress.reduce((sum, p) => sum + p.pct, 0) /
      Math.max(CLIENT_JOB.progress.length, 1)
  );

  const shadow = dark
    ? "0 1px 3px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(20,22,26,0.06)";

  return (
    <main
      className="min-h-screen w-full p-4 sm:p-6 pb-20 relative overflow-x-hidden"
      style={{ background: "var(--page)" }}
    >
      <BackgroundPattern />

      <div className="max-w-[420px] mx-auto relative z-10 flex flex-col gap-5">
        {/* Top bar */}
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/client/home")}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all border"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: shadow,
              }}
              aria-label="Go to home"
            >
              <ArrowLeft size={16} color="var(--ink)" />
            </button>
            <div>
              <p className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                Live Workshop Monitor
              </p>
              <h1
                className="font-oswald text-xl font-semibold leading-tight"
                style={{ color: "var(--ink)" }}
              >
                My Car Status
              </h1>
            </div>
          </div>

          <button
            id="btn-status-theme-toggle"
            onClick={toggleTheme}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: "var(--card)", boxShadow: shadow }}
          >
            {dark ? (
              <Sun size={15} color="var(--lime)" />
            ) : (
              <Moon size={15} color="var(--ink)" />
            )}
          </button>
        </header>

        {/* Vehicle Number Plate Card */}
        <VehicleCard
          vehicle={CLIENT_VEHICLE}
          tag={CLIENT_JOB.tag}
          intakeDate={CLIENT_JOB.date}
        />

        {/* Assigned Mechanic & Progress Summary */}
        <div
          className="rounded-2xl p-4 border flex flex-col gap-3.5"
          style={{
            background: "var(--card)",
            borderColor: "var(--border)",
            boxShadow: shadow,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-inter text-xs font-semibold"
                style={{ background: "var(--ink-2)", color: "var(--lime)" }}
              >
                {mechanic?.initials || "PS"}
              </div>
              <div>
                <p className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
                  {mechanic?.name || "Assigned Technician"}
                </p>
                <p className="font-inter text-[10px]" style={{ color: "var(--slate)" }}>
                  Lead Mechanic · {mechanic?.specialization}
                </p>
              </div>
            </div>

            <span
              className="px-2.5 py-1 rounded-full font-inter text-[10px] font-semibold"
              style={{ background: "var(--warn)", color: "var(--ink)" }}
            >
              In Progress
            </span>
          </div>

          {/* Detailed Progress Bars */}
          <div className="flex flex-col gap-2 pt-1 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-inter" style={{ color: "var(--slate)" }}>
                Total Job Completion
              </span>
              <span className="font-mono font-semibold" style={{ color: "var(--ink)" }}>
                {overallProgress}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "var(--chip)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${overallProgress}%`,
                  background: "var(--lime)",
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              {CLIENT_JOB.progress.map((p) => (
                <div key={p.label} className="p-2 rounded-xl" style={{ background: "var(--chip)" }}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-inter truncate pr-1" style={{ color: "var(--ink)" }}>
                      {p.label}
                    </span>
                    <span className="font-mono font-semibold" style={{ color: "var(--slate)" }}>
                      {p.pct}%
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden bg-black/10 dark:bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${p.pct}%`,
                        background: p.pct === 100 ? "var(--lime)" : "var(--fill)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Timeline Stepper */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3
              className="font-oswald text-base font-semibold"
              style={{ color: "var(--ink)" }}
            >
              Repair Timeline &amp; Logs
            </h3>
            <span className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
              Updated 10:40 AM
            </span>
          </div>

          <StatusStepper
            history={CLIENT_JOB_HISTORY}
            currentStatus={CLIENT_JOB.status}
          />
        </section>

        {/* Workshop Contact CTA */}
        <div className="flex items-center gap-3 pt-2">
          <a
            href="tel:+923000000000"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-xs font-semibold border transition-all hover:opacity-90 active:scale-[0.99]"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--ink)",
              boxShadow: shadow,
            }}
          >
            <Phone size={14} /> Call Workshop
          </a>

          <Link
            href="/client/book"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-xs font-semibold transition-all hover:opacity-90 active:scale-[0.99]"
            style={{ background: "var(--lime)", color: "var(--ink-2)" }}
          >
            Book Another Job
          </Link>
        </div>
      </div>
    </main>
  );
}