"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { BackgroundPattern } from "@/components/shared/BackgroundPattern";
import { NavPill } from "@/components/admin/NavPill";
import { JobCard } from "@/components/admin/JobCard";
import { JobDetailPanel } from "@/components/admin/JobDetailPanel";
import { MechanicPanel } from "@/components/admin/MechanicPanel";
import { UpdateJobStatusModal } from "@/components/admin/UpdateJobStatusModal";
import { JOBS, MECHANICS } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [selectedId, setSelectedId] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

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

  const job = JOBS.find((j) => j.id === selectedId)!;
  const mechanic = MECHANICS[job.mechanicId];

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
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "var(--card)",
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
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2.5 font-inter text-xs font-medium"
              style={{
                color: "var(--ink)",
                background: "var(--card)",
                boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
              }}
            >
              <Calendar size={14} />
              Aug 12, 2024
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
            {JOBS.map((j) => (
              <JobCard
                key={j.id}
                job={j}
                mechanic={MECHANICS[j.mechanicId]}
                selected={j.id === selectedId}
                onClick={() => setSelectedId(j.id)}
              />
            ))}
          </div>

          {/* Job detail — col-span-6 */}
          <JobDetailPanel
            job={job}
            onUpdateStatus={() => setModalOpen(true)}
          />

          {/* Mechanic panel — col-span-3 */}
          <MechanicPanel mechanic={mechanic} />
        </div>
      </div>

      {/* Update status modal */}
      {modalOpen && (
        <UpdateJobStatusModal
          job={job}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}