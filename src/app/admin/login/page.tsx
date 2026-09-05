"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Sun, Moon, ChevronRight } from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { useTheme } from "@/components/shared/ThemeProvider";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();
        if (profile?.role === "admin") {
          router.replace("/admin/dashboard");
        }
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        setError(authError?.message || "Invalid login credentials.");
        setLoading(false);
        return;
      }

      // Verify admin role
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile || profile.role !== "admin") {
        await supabase.auth.signOut();
        setError("Access denied: Not an administrator account.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setLoading(false);
    }
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
          <span
            className="font-oswald font-semibold text-xl tracking-wide"
            style={{ color: "var(--ink)" }}
          >
            ALLYAN GARAGE
          </span>
        </div>

        <h1
          className="font-oswald text-2xl font-semibold mb-1"
          style={{ color: "var(--ink)" }}
        >
          Admin Login
        </h1>
        <p
          className="font-inter text-xs mb-6"
          style={{ color: "var(--slate)" }}
        >
          Enter your admin email and password to sign in.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="input-email"
              className="font-inter text-xs font-semibold block mb-1.5"
              style={{ color: "var(--ink)" }}
            >
              Email Address
            </label>
            <input
              id="input-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@allyangarage.com"
              className="w-full rounded-xl px-4 py-3 font-inter text-sm border outline-none"
              style={{
                background: "var(--chip)",
                color: "var(--ink)",
                borderColor: error ? "#EF4444" : "var(--border)",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="input-password"
              className="font-inter text-xs font-semibold block mb-1.5"
              style={{ color: "var(--ink)" }}
            >
              Password
            </label>
            <input
              id="input-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl px-4 py-3 font-inter text-sm border outline-none"
              style={{
                background: "var(--chip)",
                color: "var(--ink)",
                borderColor: error ? "#EF4444" : "var(--border)",
              }}
            />
          </div>

          {error && (
            <p
              id="login-error-msg"
              className="font-inter text-[11px] text-center"
              style={{ color: "#EF4444" }}
            >
              {error}
            </p>
          )}

          <button
            id="btn-admin-login"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 mt-1"
            style={{ background: "var(--lime)", color: "var(--ink-2)" }}
          >
            {loading ? "Signing In..." : "Sign In"}{" "}
            <ChevronRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}