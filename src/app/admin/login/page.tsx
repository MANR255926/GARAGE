"use client";

import { useState } from "react";
import { Wrench, Sun, Moon, ChevronRight } from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { useTheme } from "@/components/shared/ThemeProvider";

type Step = "phone" | "otp";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");

  function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (phone.length < 7) {
      setError("Enter a valid phone number.");
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
      const el = document.getElementById(`otp-${idx + 1}`);
      (el as HTMLInputElement | null)?.focus();
    }
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      const el = document.getElementById(`otp-${idx - 1}`);
      (el as HTMLInputElement | null)?.focus();
    }
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    // Mock: any 6-digit code succeeds
    setError("");
    alert(`Mock login success! Code: ${code}`);
  }

  const shadow = dark
    ? "0 1px 3px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(20,22,26,0.06)";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 relative"
      style={{ background: "var(--page)" }}
    >
      <BackgroundPattern />

      {/* Theme toggle — top right */}
      <button
        id="btn-login-theme"
        onClick={toggleTheme}
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "var(--card)", boxShadow: shadow, zIndex: 20 }}
      >
        {dark ? (
          <Sun size={16} color="var(--lime)" />
        ) : (
          <Moon size={16} color="var(--ink)" />
        )}
      </button>

      <div
        className="relative rounded-3xl p-8 w-full max-w-sm"
        style={{
          background: "var(--card)",
          boxShadow: dark
            ? "0 8px 40px rgba(0,0,0,0.4)"
            : "0 8px 40px rgba(20,22,26,0.1)",
          zIndex: 10,
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--ink-2)" }}
          >
            <Wrench size={18} color="var(--lime)" />
          </div>
          <span className="font-oswald font-semibold text-xl tracking-wide" style={{ color: "var(--ink)" }}>
            ALLYAN GARAGE
          </span>
        </div>

        {step === "phone" ? (
          <>
            <h1 className="font-oswald text-2xl font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Admin Login
            </h1>
            <p className="font-inter text-xs mb-6" style={{ color: "var(--slate)" }}>
              Enter your registered phone number to receive a one-time code.
            </p>

            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
              <div>
                <label className="font-inter text-xs font-semibold block mb-1.5" style={{ color: "var(--ink)" }}>
                  Phone Number
                </label>
                <input
                  id="input-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  className="w-full rounded-xl px-4 py-3 font-inter text-sm border outline-none"
                  style={{
                    background: "var(--chip)",
                    color: "var(--ink)",
                    borderColor: error ? "#EF4444" : "var(--border)",
                  }}
                />
                {error && (
                  <p className="font-inter text-[11px] mt-1" style={{ color: "#EF4444" }}>
                    {error}
                  </p>
                )}
              </div>

              <button
                id="btn-send-code"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--lime)", color: "var(--ink-2)" }}
              >
                Send Code <ChevronRight size={16} />
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-oswald text-2xl font-semibold mb-1" style={{ color: "var(--ink)" }}>
              Enter OTP
            </h1>
            <p className="font-inter text-xs mb-6" style={{ color: "var(--slate)" }}>
              We sent a 6-digit code to <strong>{phone}</strong>.{" "}
              <button
                className="underline"
                style={{ color: "var(--lime)" }}
                onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(""); }}
              >
                Change
              </button>
            </p>

            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              {/* Odometer-style OTP boxes */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
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
                  />
                ))}
              </div>

              {error && (
                <p className="font-inter text-[11px] text-center" style={{ color: "#EF4444" }}>
                  {error}
                </p>
              )}

              <button
                id="btn-verify-otp"
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--lime)", color: "var(--ink-2)" }}
              >
                Verify &amp; Sign In
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
