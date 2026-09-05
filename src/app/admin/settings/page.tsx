"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavPill } from "@/components/admin/NavPill";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("17:00");
  const [announcement, setAnnouncement] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadSettings() {
    try {
      const res = await fetch("/api/shop-settings");
      const data = await res.json();
      if (data.settings) {
        setIsOpen(Boolean(data.settings.is_open));
        if (data.settings.opening_time) {
          setOpeningTime(data.settings.opening_time.slice(0, 5));
        }
        if (data.settings.closing_time) {
          setClosingTime(data.settings.closing_time.slice(0, 5));
        }
        if (data.settings.message) {
          setAnnouncement(data.settings.message);
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const supabase = createClient();
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/admin/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !profile || profile.role !== "admin") {
        router.replace("/error-page?code=403");
        return;
      }

      setCheckingAuth(false);
      loadSettings();
    }
    checkAuth();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/shop-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_open: isOpen,
          opening_time: openingTime,
          closing_time: closingTime,
          message: announcement,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  }

  if (checkingAuth) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{ background: "var(--page)" }}
      >
        <BackgroundPattern />
        <div className="flex flex-col items-center gap-3 relative" style={{ zIndex: 10 }}>
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{
              border: "3px solid var(--border)",
              borderTopColor: "var(--lime)",
            }}
          />
          <p className="font-inter text-xs font-medium" style={{ color: "var(--slate)" }}>
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full p-6 relative"
      style={{ background: "var(--page)" }}
    >
      <BackgroundPattern />

      <div className="max-w-[1360px] mx-auto relative" style={{ zIndex: 10 }}>
        <NavPill activeTab={3} />

        <div className="max-w-xl mx-auto mt-4">
          <div className="mb-6">
            <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
              Admin Settings
            </p>
            <h1 className="font-oswald text-2xl font-semibold" style={{ color: "var(--ink)" }}>
              Shop Settings
            </h1>
          </div>

          <form
            onSubmit={handleSave}
            className="rounded-2xl p-6 flex flex-col gap-6"
            style={{
              background: "var(--card)",
              boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
            }}
          >
            {/* Shop open/closed toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-inter text-sm font-semibold" style={{ color: "var(--ink)" }}>
                  Shop Status
                </p>
                <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
                  {isOpen ? "Currently accepting bookings" : "Closed — bookings paused"}
                </p>
              </div>
              <button
                id="toggle-shop-status"
                type="button"
                role="switch"
                aria-checked={isOpen}
                onClick={() => setIsOpen((v) => !v)}
                className="relative w-12 h-6 rounded-full transition-colors duration-300"
                style={{ background: isOpen ? "var(--lime)" : "var(--chip)" }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
                  style={{
                    background: isOpen ? "var(--ink-2)" : "var(--slate)",
                    left: isOpen ? "26px" : "2px",
                  }}
                />
              </button>
            </div>

            <hr style={{ borderColor: "var(--border)" }} />

            {/* Opening time */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-opening-time"
                className="font-inter text-xs font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Opening Time
              </label>
              <input
                id="input-opening-time"
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="rounded-xl px-4 py-2.5 font-inter text-sm border outline-none"
                style={{
                  background: "var(--chip)",
                  color: "var(--ink)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* Closing time */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="input-closing-time"
                className="font-inter text-xs font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Closing Time
              </label>
              <input
                id="input-closing-time"
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="rounded-xl px-4 py-2.5 font-inter text-sm border outline-none"
                style={{
                  background: "var(--chip)",
                  color: "var(--ink)",
                  borderColor: "var(--border)",
                }}
              />
            </div>

            {/* Customer announcement */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="textarea-announcement"
                className="font-inter text-xs font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Customer Announcement
              </label>
              <textarea
                id="textarea-announcement"
                rows={4}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="rounded-xl px-4 py-2.5 font-inter text-sm border outline-none resize-none"
                style={{
                  background: "var(--chip)",
                  color: "var(--ink)",
                  borderColor: "var(--border)",
                }}
                placeholder="Message shown to clients on the booking page..."
              />
              <p className="font-inter text-[10px]" style={{ color: "var(--slate)" }}>
                {announcement.length}/280 characters
              </p>
            </div>

            {/* Save button */}
            <button
              id="btn-save-settings"
              type="submit"
              disabled={saving || loading}
              className="w-full py-3 rounded-xl font-inter text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: saved ? "var(--fill)" : "var(--lime)",
                color: "var(--ink-2)",
              }}
            >
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Settings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}