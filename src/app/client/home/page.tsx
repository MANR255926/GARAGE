"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Car,
  ChevronRight,
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { useTheme } from "@/components/shared/ThemeProvider";
import { ShopStatusBanner } from "@/components/client/ShopStatusBanner";
import { ServiceChip } from "@/components/client/ServiceChip";
import {
  CLIENT_JOB,
  SERVICES,
} from "@/lib/mock-data";

export default function ClientHomePage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const activeServices = SERVICES.filter((s) => s.active);

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
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--ink-2)" }}
            >
              <Wrench size={18} color="var(--lime)" />
            </div>
            <div>
              <span
                className="font-oswald font-semibold text-lg tracking-wide block leading-none"
                style={{ color: "var(--ink)" }}
              >
                ALLYAN GARAGE
              </span>
              <span className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                Fast · Reliable · Transparent
              </span>
            </div>
          </div>

          <button
            id="btn-client-theme-toggle"
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

        {/* Greeting */}
        <div>
          <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
            Welcome back
          </p>
          <h1
            className="font-oswald text-2xl sm:text-3xl font-semibold"
            style={{ color: "var(--ink)" }}
          >
            Vehicle Care &amp; Service
          </h1>
        </div>

        {/* Shop Status Banner */}
        <ShopStatusBanner />

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            id="btn-quick-book"
            href="/client/book"
            className="flex flex-col justify-between rounded-2xl p-4 transition-all hover:opacity-95 active:scale-[0.98]"
            style={{ background: "var(--lime)", color: "var(--ink-2)" }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--ink-2)" }}>
              <PlusCircle size={16} color="var(--lime)" />
            </div>
            <div>
              <p className="font-oswald text-base font-semibold leading-tight">
                Book a Service
              </p>
              <p className="font-inter text-[11px] opacity-80 mt-0.5">
                Reserve slot &amp; vehicle
              </p>
            </div>
          </Link>

          <Link
            id="btn-quick-status"
            href="/client/status"
            className="flex flex-col justify-between rounded-2xl p-4 border transition-all hover:opacity-95 active:scale-[0.98]"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              boxShadow: shadow,
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center mb-4"
              style={{ background: "var(--chip)" }}
            >
              <Car size={16} color="var(--ink)" />
            </div>
            <div>
              <p
                className="font-oswald text-base font-semibold leading-tight"
                style={{ color: "var(--ink)" }}
              >
                My Car Status
              </p>
              <p className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                Live workshop stepper
              </p>
            </div>
          </Link>
        </div>

        {/* Active Job Preview Card */}
        {CLIENT_JOB && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span
                className="font-inter text-xs font-semibold tracking-wide uppercase"
                style={{ color: "var(--slate)" }}
              >
                Active Workshop Job
              </span>
              <Link
                href="/client/status"
                className="font-inter text-[11px] font-medium flex items-center gap-0.5 hover:underline"
                style={{ color: "var(--ink)" }}
              >
                View Live Stepper <ArrowRight size={11} />
              </Link>
            </div>

            <div
              onClick={() => router.push("/client/status")}
              className="rounded-2xl p-4 border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: shadow,
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") router.push("/client/status");
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold tracking-wider"
                      style={{ background: "var(--ink-2)", color: "var(--lime)" }}
                    >
                      {CLIENT_JOB.plate}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full font-inter text-[10px] font-medium"
                      style={{ background: "var(--warn)", color: "var(--ink)" }}
                    >
                      In Progress
                    </span>
                  </div>
                  <h3
                    className="font-oswald text-base font-semibold"
                    style={{ color: "var(--ink)" }}
                  >
                    {CLIENT_JOB.model} — {CLIENT_JOB.tag}
                  </h3>
                </div>

                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "var(--chip)" }}
                >
                  <ChevronRight size={16} color="var(--slate)" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1 text-xs">
                  <span className="font-inter" style={{ color: "var(--slate)" }}>
                    Overall Progress
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
              </div>

              {/* Latest update note */}
              <p
                className="font-inter text-xs p-2.5 rounded-xl line-clamp-2"
                style={{ background: "var(--chip)", color: "var(--ink)" }}
              >
                &ldquo;{CLIENT_JOB.note}&rdquo;
              </p>
            </div>
          </section>
        )}

        {/* Horizontal Service Chips */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span
              className="font-inter text-xs font-semibold tracking-wide uppercase"
              style={{ color: "var(--slate)" }}
            >
              Popular Services
            </span>
            <Link
              href="/client/book"
              className="font-inter text-[11px] font-medium hover:underline"
              style={{ color: "var(--slate)" }}
            >
              View all ({activeServices.length})
            </Link>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {activeServices.map((svc) => (
              <ServiceChip
                key={svc.id}
                service={svc}
                onClick={() => router.push(`/client/book?service=${svc.id}`)}
              />
            ))}
          </div>
        </section>

        {/* Footer reassurance note */}
        <div
          className="rounded-2xl p-3.5 flex items-center gap-3 border"
          style={{ background: "var(--chip)", borderColor: "var(--border)" }}
        >
          <ShieldCheck size={20} className="shrink-0" style={{ color: "var(--ink)" }} />
          <p className="font-inter text-[11px] leading-relaxed" style={{ color: "var(--slate)" }}>
            Genuine OEM parts guaranteed with automated SMS tracking on every repair.
          </p>
        </div>
      </div>
    </main>
  );
}