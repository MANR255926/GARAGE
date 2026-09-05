"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Sun, Moon, ChevronRight, Sparkles } from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { useTheme } from "@/components/shared/ThemeProvider";
import { createClient } from "@/lib/supabase/client";

type Step = "phone" | "otp";

export default function ClientLoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to home
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace("/client/home");
      }
    });
  }, [router]);

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (phone.trim().length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    setStep("otp");
  }

  function handleOtpChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      const el = document.getElementById(`client-otp-${idx + 1}`);
      (el as HTMLInputElement | null)?.focus();
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const el = document.getElementById(`client-otp-${idx - 1}`);
      (el as HTMLInputElement | null)?.focus();
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            phone: phone.trim() || undefined,
            name: "Guest User",
          },
        },
      });

      if (authError) {
        setError(authError.message || "Authentication failed. Please try again.");
        setLoading(false);
        return;
      }

      if (data?.session) {
        router.push("/client/home");
      } else {
        router.push("/client/home");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setLoading(false);
    }
  }

  const shadow = dark
    ? "0 1px 3px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(20,22,26,0.06)";

  return (
    <main
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-x-hidden"
      style={{ background: "var(--page)" }}
    >
      <BackgroundPattern />

      {/* Theme toggle top-right */}
      <button
        id="btn-client-login-theme"
        onClick={toggleTheme}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all z-20"
        style={{ background: "var(--card)", boxShadow: shadow }}
      >
        {dark ? (
          <Sun size={16} color="var(--lime)" />
        ) : (
          <Moon size={16} color="var(--ink)" />
        )}
      </button>

      <div
        className="relative w-full max-w-[420px] mx-auto rounded-3xl p-6 sm:p-8"
        style={{
          background: "var(--card)",
          boxShadow: dark
            ? "0 8px 40px rgba(0,0,0,0.4)"
            : "0 8px 40px rgba(20,22,26,0.1)",
          zIndex: 10,
        }}
      >
        {/* Brand header */}
        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
            style={{ background: "var(--ink-2)" }}
          >
            <Wrench size={18} color="var(--lime)" />
          </div>
          <div>
            <span
              className="font-oswald font-semibold text-xl tracking-wide block leading-none"
              style={{ color: "var(--ink)" }}
            >
              ALLYAN GARAGE
            </span>
            <span className="font-inter text-[11px] font-medium" style={{ color: "var(--slate)" }}>
              Customer Portal
            </span>
          </div>
        </div>

        {step === "phone" ? (
          <>
            <div className="mb-6">
              <h1
                className="font-oswald text-2xl sm:text-3xl font-semibold mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Welcome to Allyan Garage
              </h1>
              <p className="font-inter text-xs leading-relaxed" style={{ color: "var(--slate)" }}>
                Enter your phone number to book a service or check live updates on your vehicle.
              </p>
            </div>

            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="client-phone-input"
                  className="font-inter text-xs font-semibold block mb-1.5"
                  style={{ color: "var(--ink)" }}
                >
                  Mobile Number
                </label>
                <input
                  id="client-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full rounded-xl px-4 py-3 font-inter text-sm border outline-none transition-colors"
                  style={{
                    background: "var(--chip)",
                    color: "var(--ink)",
                    borderColor: error ? "#EF4444" : "var(--border)",
                  }}
                  autoFocus
                />
                {error && (
                  <p className="font-inter text-[11px] mt-1.5" style={{ color: "#EF4444" }}>
                    {error}
                  </p>
                )}
              </div>

              <div
                className="rounded-xl p-3 flex items-center gap-2.5 border"
                style={{ background: "var(--chip)", borderColor: "var(--border)" }}
              >
                <Sparkles size={16} className="text-lime-500 shrink-0" style={{ color: "var(--ink)" }} />
                <p className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                  Instant access with SMS code. No password required.
                </p>
              </div>

              <button
                id="btn-client-send-otp"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.99]"
                style={{ background: "var(--lime)", color: "var(--ink-2)" }}
              >
                Continue <ChevronRight size={16} />
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1
                className="font-oswald text-2xl sm:text-3xl font-semibold mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                Verification Code
              </h1>
              <p className="font-inter text-xs leading-relaxed" style={{ color: "var(--slate)" }}>
                We sent a 6-digit code to <strong style={{ color: "var(--ink)" }}>{phone}</strong>.{" "}
                <button
                  type="button"
                  className="underline font-semibold"
                  style={{ color: "var(--slate)" }}
                  onClick={() => {
                    setStep("phone");
                    setOtp(["", "", "", "", "", ""]);
                    setError("");
                  }}
                >
                  Change
                </button>
              </p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              {/* Odometer-style OTP boxes */}
              <div className="flex gap-2 justify-between">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`client-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center rounded-xl font-mono text-xl font-semibold border outline-none transition-all"
                    style={{
                      background: digit ? "var(--ink-2)" : "var(--chip)",
                      color: digit ? "var(--lime)" : "var(--ink)",
                      borderColor: error ? "#EF4444" : "var(--border)",
                    }}
                    aria-label={`OTP digit ${i + 1}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              {error && (
                <p className="font-inter text-[11px] text-center" style={{ color: "#EF4444" }}>
                  {error}
                </p>
              )}

              <button
                id="btn-client-verify-otp"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                style={{ background: "var(--lime)", color: "var(--ink-2)" }}
              >
                {loading ? "Signing in..." : "Verify & Continue"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}