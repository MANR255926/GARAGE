"use client";

import { Clock, Award, Star, Globe, MoreVertical } from "lucide-react";
import type { Mechanic } from "@/lib/mock-data";

interface MechanicPanelProps {
  mechanic: Mechanic;
}

export function MechanicPanel({ mechanic }: MechanicPanelProps) {
  const stats = [
    { Icon: Clock,  label: mechanic.experience,                          sub: "Experience"      },
    { Icon: Award,  label: mechanic.specialization,                      sub: "Specialization"  },
    { Icon: Star,   label: `${mechanic.rating} (${mechanic.ratingCount})`, sub: "Ratings"       },
    { Icon: Globe,  label: mechanic.availability,                        sub: "Availability"    },
  ];

  return (
    <div className="col-span-3">
      <div
        className="rounded-2xl p-5"
        style={{
          background: "var(--card)",
          boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
        }}
      >
        {/* Avatar + name */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-inter text-sm font-semibold"
              style={{ background: "var(--ink-2)", color: "var(--lime)" }}
            >
              {mechanic.initials}
            </div>
            <div>
              <p className="font-inter text-sm font-semibold" style={{ color: "var(--ink)" }}>
                {mechanic.name}
              </p>
              <p className="font-inter text-[11px]" style={{ color: "var(--slate)" }}>
                Mechanic
              </p>
            </div>
          </div>
          <MoreVertical size={15} color="var(--slate)" />
        </div>

        {/* 2×2 stat grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map(({ Icon, label, sub }) => (
            <div
              key={sub}
              className="rounded-xl p-3"
              style={{ background: "var(--chip)" }}
            >
              <Icon size={14} color="var(--ink)" />
              <p className="font-inter text-xs font-semibold mt-2" style={{ color: "var(--ink)" }}>
                {label}
              </p>
              <p className="font-inter text-[10px]" style={{ color: "var(--slate)" }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <p className="font-inter text-xs mb-4" style={{ color: "var(--slate)" }}>
          {mechanic.bio}
        </p>

        {/* Skill tags */}
        <p className="font-inter text-[11px] font-semibold mb-2" style={{ color: "var(--ink)" }}>
          Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {mechanic.skills.map((s) => (
            <span
              key={s}
              className="px-2.5 py-1 rounded-full font-inter text-[10px] font-medium"
              style={{ background: "var(--chip)", color: "var(--ink)" }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
