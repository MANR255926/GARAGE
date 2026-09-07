"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sun,
  Moon,
  Phone,
  Wrench,
  Sparkles,
} from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { useTheme } from "@/components/shared/ThemeProvider";
import { VehicleCard } from "@/components/client/VehicleCard";
import { StatusStepper } from "@/components/client/StatusStepper";
import { createClient } from "@/lib/supabase/client";
import type { JobHistoryItem, JobStatus } from "@/lib/mock-data";

interface VehicleData {
  id: string;
  make: string;
  model: string;
  plate_number: string;
}

interface ServiceData {
  id: string;
  name: string;
}

interface BookingData {
  id: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
  vehicles: VehicleData | null;
  services: ServiceData | null;
}

interface JobUpdateData {
  id: string;
  booking_id: string;
  status_text: "pending" | "in_progress" | "on_hold" | "completed";
  note: string | null;
  photo_url: string | null;
  created_at: string;
}

// Presentational approximation, not a stored value
function getStatusProgress(status: string): number {
  switch (status) {
    case "completed":
      return 100;
    case "in_progress":
    case "on_hold":
      return 50;
    case "pending":
    default:
      return 10;
  }
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending Intake";
    case "in_progress":
      return "In Progress";
    case "on_hold":
      return "On Hold";
    case "completed":
      return "Completed";
    default:
      return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export default function ClientStatusPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [jobUpdates, setJobUpdates] = useState<JobUpdateData[]>([]);

  useEffect(() => {
    const supabase = createClient();

    async function loadClientData() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace("/client/login");
          return;
        }

        const userId = session.user.id;

        // 1. Fetch current user's latest booking joined with vehicles and services
        const { data: bookingData, error: bookingErr } = await supabase
          .from("bookings")
          .select(`
            id,
            date,
            time,
            status,
            created_at,
            vehicles (
              id,
              make,
              model,
              plate_number
            ),
            services (
              id,
              name
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (bookingErr) {
          console.error("Failed to load booking:", bookingErr);
          setLoading(false);
          return;
        }

        if (!bookingData) {
          setBooking(null);
          setLoading(false);
          return;
        }

        // Normalize single join objects (Supabase can return single object or array depending on relation type)
        const normalizedBooking: BookingData = {
          id: bookingData.id,
          date: bookingData.date,
          time: bookingData.time,
          status: bookingData.status,
          created_at: bookingData.created_at,
          vehicles: Array.isArray(bookingData.vehicles)
            ? bookingData.vehicles[0] || null
            : bookingData.vehicles,
          services: Array.isArray(bookingData.services)
            ? bookingData.services[0] || null
            : bookingData.services,
        };

        setBooking(normalizedBooking);

        // 2. Fetch job updates for this booking
        const { data: updates, error: updatesErr } = await supabase
          .from("job_updates")
          .select("id, booking_id, status_text, note, photo_url, created_at")
          .eq("booking_id", normalizedBooking.id)
          .order("created_at", { ascending: true });

        if (updatesErr) {
          console.error("Failed to load job updates:", updatesErr);
        } else {
          setJobUpdates((updates as JobUpdateData[]) || []);
        }
      } catch (err) {
        console.error("Unexpected error in client status:", err);
      } finally {
        setLoading(false);
      }
    }

    loadClientData();
  }, [router]);

  const shadow = dark
    ? "0 1px 3px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(20,22,26,0.06)";

  if (loading) {
    return (
      <main
        className="min-h-screen w-full p-4 sm:p-6 pb-20 relative overflow-x-hidden flex items-center justify-center"
        style={{ background: "var(--page)" }}
      >
        <BackgroundPattern />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-10 h-10 border-3 border-lime-400 border-t-transparent rounded-full animate-spin" />
          <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
            Loading vehicle status...
          </p>
        </div>
      </main>
    );
  }

  // ─── EMPTY STATE: No active bookings ───
  if (!booking) {
    return (
      <main
        className="min-h-screen w-full p-4 sm:p-6 pb-20 relative overflow-x-hidden"
        style={{ background: "var(--page)" }}
      >
        <BackgroundPattern />

        <div className="max-w-[420px] mx-auto relative z-10 flex flex-col gap-6">
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
              id="btn-status-theme-toggle-empty"
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

          {/* Clean Empty State Card */}
          <section
            className="rounded-3xl p-8 border text-center flex flex-col items-center gap-4 mt-8"
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              boxShadow: shadow,
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
              style={{ background: "var(--chip)" }}
            >
              <Wrench size={28} color="var(--slate)" />
            </div>

            <div>
              <h2
                className="font-oswald text-2xl font-semibold mb-1.5"
                style={{ color: "var(--ink)" }}
              >
                No active bookings yet
              </h2>
              <p
                className="font-inter text-xs leading-relaxed max-w-xs mx-auto"
                style={{ color: "var(--slate)" }}
              >
                You have not booked any services yet. Schedule a maintenance or inspection appointment to track real-time workshop progress here.
              </p>
            </div>

            <Link
              id="btn-empty-book-service"
              href="/client/book"
              className="w-full max-w-xs flex items-center justify-center gap-2 py-3.5 rounded-xl font-inter text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] mt-2"
              style={{ background: "var(--lime)", color: "var(--ink-2)" }}
            >
              <Sparkles size={16} /> Book a Service
            </Link>
          </section>
        </div>
      </main>
    );
  }

  // ─── ACTIVE BOOKING STATE ───
  // Calculate progress and latest status
  const latestStatusText =
    jobUpdates.length > 0
      ? jobUpdates[jobUpdates.length - 1].status_text
      : booking.status === "confirmed"
      ? "in_progress"
      : booking.status === "completed"
      ? "completed"
      : "pending";

  const overallProgress = getStatusProgress(latestStatusText);

  // Map job_updates to StatusStepper history
  const historyItems: JobHistoryItem[] =
    jobUpdates.length > 0
      ? jobUpdates.map((u) => {
          const d = new Date(u.created_at);
          const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
          return {
            id: u.id,
            status: u.status_text as JobStatus,
            statusText: formatStatusLabel(u.status_text),
            time: timeStr,
            date: dateStr,
            note: u.note || "Status updated by workshop technician.",
            photoUrl: u.photo_url || undefined,
          };
        })
      : [
          {
            id: `initial-${booking.id}`,
            status: "pending" as JobStatus,
            statusText: "Booking Placed",
            time: booking.time ? booking.time.slice(0, 5) : "Scheduled",
            date: booking.date,
            note: "Your service booking has been placed and is waiting for workshop intake.",
          },
        ];

  const vehicleObj = {
    id: booking.vehicles?.id || "veh-unknown",
    make: booking.vehicles?.make || "Vehicle",
    model: booking.vehicles?.model || "Standard",
    plate_number: booking.vehicles?.plate_number || "PENDING",
  };

  const serviceTag = booking.services?.name || "General Service";

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

        {/* Real Vehicle Number Plate Card */}
        <VehicleCard
          vehicle={vehicleObj}
          tag={serviceTag}
          intakeDate={booking.date}
        />

        {/* Progress Summary Card */}
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
                AG
              </div>
              <div>
                <p className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
                  Allyan Workshop Bay 1
                </p>
                <p className="font-inter text-[10px]" style={{ color: "var(--slate)" }}>
                  {serviceTag} · {booking.time ? booking.time.slice(0, 5) : "10:30"} Slot
                </p>
              </div>
            </div>

            <span
              className="px-2.5 py-1 rounded-full font-inter text-[10px] font-semibold"
              style={{
                background:
                  latestStatusText === "completed"
                    ? "var(--lime)"
                    : latestStatusText === "on_hold"
                    ? "rgba(239,68,68,0.15)"
                    : "var(--warn)",
                color:
                  latestStatusText === "completed"
                    ? "var(--ink-2)"
                    : latestStatusText === "on_hold"
                    ? "#EF4444"
                    : "var(--ink)",
              }}
            >
              {formatStatusLabel(latestStatusText)}
            </span>
          </div>

          {/* Overall Progress Bar */}
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
              className="w-full h-2.5 rounded-full overflow-hidden"
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
              {jobUpdates.length > 0 ? "Live Updates" : "Scheduled"}
            </span>
          </div>

          <StatusStepper
            history={historyItems}
            currentStatus={latestStatusText as JobStatus}
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