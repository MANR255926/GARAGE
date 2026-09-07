"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Plus, Wrench, RefreshCw } from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { NavPill } from "@/components/admin/NavPill";
import { JobCard } from "@/components/admin/JobCard";
import { JobDetailPanel, type RealJobUpdate } from "@/components/admin/JobDetailPanel";
import { MechanicPanel } from "@/components/admin/MechanicPanel";
import { UpdateJobStatusModal } from "@/components/admin/UpdateJobStatusModal";
import { MECHANICS, type Job, type Mechanic, type JobStatus } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

interface VehicleJoined {
  id: string;
  make: string;
  model: string;
  plate_number: string;
}

interface ServiceJoined {
  id: string;
  name: string;
}

interface UserJoined {
  id: string;
  name: string | null;
  phone: string | null;
}

interface RawBookingRow {
  id: string;
  user_id: string;
  vehicle_id: string;
  service_id: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
  vehicles: VehicleJoined | VehicleJoined[] | null;
  services: ServiceJoined | ServiceJoined[] | null;
  users: UserJoined | UserJoined[] | null;
  job_updates: RealJobUpdate[] | null;
}

const DEFAULT_MOCK_PROGRESS = [
  { label: "Vehicle Intake & Inspection", pct: 100 },
  { label: "Core Diagnostics & Service", pct: 60 },
  { label: "Fluid Flush & Testing", pct: 30 },
  { label: "Final Quality Check", pct: 0 },
];

const UNASSIGNED_MECHANIC: Mechanic = {
  id: "unassigned",
  name: "Unassigned",
  initials: "UA",
  specialization: "General Workshop",
  experience: "-",
  rating: "5.0",
  ratingCount: 0,
  availability: "Available",
  bio: "Pending technician assignment at workshop intake.",
  skills: ["General Service"],
  activeJobs: 0,
};

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookings, setBookings] = useState<RawBookingRow[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Check admin session
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
    }
    checkAuth();
  }, [router]);

  // Fetch real bookings
  const fetchBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const res = await fetch("/api/bookings");
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await res.json();
      const list: RawBookingRow[] = data.bookings || [];
      setBookings(list);
      if (list.length > 0) {
        setSelectedBookingId((prev) => {
          if (prev && list.some((b) => b.id === prev)) {
            return prev;
          }
          return list[0].id;
        });
      } else {
        setSelectedBookingId(null);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (!checkingAuth) {
      fetchBookings();
    }
  }, [checkingAuth, fetchBookings]);

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

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId) || bookings[0] || null;

  // Normalize joined objects
  const vehicleObj = selectedBooking
    ? Array.isArray(selectedBooking.vehicles)
      ? selectedBooking.vehicles[0]
      : selectedBooking.vehicles
    : null;

  const serviceObj = selectedBooking
    ? Array.isArray(selectedBooking.services)
      ? selectedBooking.services[0]
      : selectedBooking.services
    : null;

  const updatesList = (selectedBooking?.job_updates || []).slice().sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const latestUpdate = updatesList.length > 0 ? updatesList[updatesList.length - 1] : null;

  const currentJobStatus: JobStatus = latestUpdate
    ? (latestUpdate.status_text as JobStatus)
    : selectedBooking?.status === "confirmed"
    ? "in_progress"
    : selectedBooking?.status === "completed"
    ? "completed"
    : "pending";

  const mappedJob: Job | null = selectedBooking
    ? {
        id: 1, // numeric proxy for Job type
        plate: vehicleObj?.plate_number || "PENDING",
        model: `${vehicleObj?.make || "Vehicle"} ${vehicleObj?.model || ""}`.trim(),
        date: selectedBooking.date,
        mechanicId: "mech-01",
        tag: serviceObj?.name || "General Service",
        status: currentJobStatus,
        note: latestUpdate?.note || "No technician notes logged yet.",
        photoTime: latestUpdate
          ? new Date(latestUpdate.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Scheduled",
        progress: DEFAULT_MOCK_PROGRESS,
      }
    : null;

  const mechanic = MECHANICS["mech-01"];

  return (
    <div
      className="min-h-screen w-full p-6 relative"
      style={{ background: "var(--page)" }}
    >
      <BackgroundPattern />

      <div className="max-w-[1360px] mx-auto relative" style={{ zIndex: 10 }}>
        {/* Top nav */}
        <NavPill activeTab={1} />

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/client/home")}
              className="w-10 h-10 rounded-full flex items-center justify-center border transition-all"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
              }}
              aria-label="Go back"
            >
              <ArrowLeft size={16} color="var(--ink)" />
            </button>
            <div>
              <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
                Workshop Dashboard
              </p>
              <h1
                className="font-oswald text-2xl font-semibold"
                style={{ color: "var(--ink)" }}
              >
                Live Job Monitoring
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="flex items-center gap-2 rounded-full px-3.5 py-2 font-inter text-xs font-medium border transition-all hover:opacity-80"
              style={{
                color: "var(--ink)",
                background: "var(--card)",
                borderColor: "var(--border)",
              }}
              title="Refresh Bookings"
            >
              <RefreshCw size={13} className={loadingBookings ? "animate-spin" : ""} />
              Refresh
            </button>
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2.5 font-inter text-xs font-medium border"
              style={{
                color: "var(--ink)",
                background: "var(--card)",
                borderColor: "var(--border)",
                boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
              }}
            >
              <Calendar size={14} />
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <button
              id="btn-add-booking"
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 font-inter text-xs font-semibold transition-opacity hover:opacity-90"
              style={{ background: "var(--lime)", color: "var(--ink-2)" }}
            >
              <Plus size={14} />
              Add Booking
            </button>
          </div>
        </div>

        {/* Main 12-column grid */}
        <div className="grid grid-cols-12 gap-5">
          {/* Job queue — col-span-3 */}
          <div className="col-span-3 flex flex-col gap-3">
            {loadingBookings && bookings.length === 0 ? (
              <div
                className="rounded-2xl p-6 border text-center flex flex-col items-center gap-2"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <div className="w-6 h-6 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
                <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
                  Loading bookings...
                </p>
              </div>
            ) : bookings.length === 0 ? (
              <div
                className="rounded-2xl p-8 border text-center flex flex-col items-center gap-3"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <Wrench size={24} color="var(--slate)" />
                <p className="font-inter text-xs font-medium" style={{ color: "var(--ink)" }}>
                  No bookings yet
                </p>
                <p className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                  Client service appointments will appear here live as they are booked.
                </p>
              </div>
            ) : (
              bookings.map((b) => {
                const bVeh = Array.isArray(b.vehicles) ? b.vehicles[0] : b.vehicles;
                const bSrv = Array.isArray(b.services) ? b.services[0] : b.services;
                const bUpdates = (b.job_updates || []).slice().sort(
                  (x, y) => new Date(x.created_at).getTime() - new Date(y.created_at).getTime()
                );
                const bLatest = bUpdates.length > 0 ? bUpdates[bUpdates.length - 1] : null;

                const itemStatus: JobStatus = bLatest
                  ? (bLatest.status_text as JobStatus)
                  : b.status === "confirmed"
                  ? "in_progress"
                  : b.status === "completed"
                  ? "completed"
                  : "pending";

                const cardJob: Job = {
                  id: b.id as unknown as number,
                  plate: bVeh?.plate_number || "PENDING",
                  model: `${bVeh?.make || "Vehicle"} ${bVeh?.model || ""}`.trim(),
                  date: b.date,
                  mechanicId: "mech-01",
                  tag: bSrv?.name || "General Service",
                  status: itemStatus,
                  note: bLatest?.note || "",
                  photoTime: "",
                  progress: DEFAULT_MOCK_PROGRESS,
                };

                return (
                  <JobCard
                    key={b.id}
                    job={cardJob}
                    mechanic={UNASSIGNED_MECHANIC}
                    selected={b.id === selectedBookingId}
                    onClick={() => setSelectedBookingId(b.id)}
                  />
                );
              })
            )}
          </div>

          {/* Job detail — col-span-6 */}
          {mappedJob && selectedBooking ? (
            <JobDetailPanel
              job={mappedJob}
              latestUpdate={latestUpdate}
              onUpdateStatus={() => setModalOpen(true)}
            />
          ) : (
            <div
              className="col-span-6 rounded-2xl p-12 border text-center flex flex-col items-center justify-center gap-3"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <Wrench size={32} color="var(--slate)" />
              <p className="font-oswald text-lg font-semibold" style={{ color: "var(--ink)" }}>
                No Job Selected
              </p>
              <p className="font-inter text-xs" style={{ color: "var(--slate)" }}>
                Select a booking from the queue to view real-time status and technician notes.
              </p>
            </div>
          )}

          {/* Mechanic panel — col-span-3 */}
          <MechanicPanel mechanic={mechanic} />
        </div>
      </div>

      {/* Update status modal */}
      {modalOpen && mappedJob && selectedBooking && (
        <UpdateJobStatusModal
          job={mappedJob}
          bookingId={selectedBooking.id}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            fetchBookings();
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}