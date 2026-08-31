"use client";

import { Car, ShieldCheck } from "lucide-react";
import type { Vehicle } from "@/lib/mock-data";

interface VehicleCardProps {
  vehicle: Vehicle;
  tag?: string;
  intakeDate?: string;
}

export function VehicleCard({
  vehicle,
  tag = "Paint & Body",
  intakeDate = "Aug 12, 2024",
}: VehicleCardProps) {
  return (
    <div
      className="rounded-3xl p-5 border relative overflow-hidden flex flex-col justify-between"
      style={{
        background: "var(--ink-2)",
        borderColor: "var(--border)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      }}
    >
      {/* Background Car watermark */}
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
        <Car size={140} color="var(--lime)" />
      </div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(215, 241, 58, 0.15)" }}
          >
            <ShieldCheck size={14} color="var(--lime)" />
          </div>
          <span className="font-inter text-xs font-medium text-white/70">
            Registered Vehicle
          </span>
        </div>

        <span className="font-inter text-[11px] text-white/50">
          In: {intakeDate}
        </span>
      </div>

      {/* Plate Badge treatment */}
      <div className="flex flex-col gap-1 relative z-10">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="font-mono text-2xl sm:text-3xl font-bold tracking-widest px-3.5 py-1 rounded-xl border border-white/10 inline-block"
            style={{ background: "#0D0E11", color: "var(--lime)" }}
          >
            {vehicle.plate_number}
          </span>
          <span
            className="font-inter text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: "var(--lime)", color: "var(--ink-2)" }}
          >
            {tag}
          </span>
        </div>

        <h2 className="font-oswald text-lg font-semibold text-white tracking-wide mt-2">
          {vehicle.make} {vehicle.model}
        </h2>
      </div>
    </div>
  );
}