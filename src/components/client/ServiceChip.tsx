"use client";

import { ArrowUpRight } from "lucide-react";
import { type Service } from "@/lib/mock-data";

interface ServiceChipProps {
  service: Service;
  onClick?: () => void;
}

export function ServiceChip({ service, onClick }: ServiceChipProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex flex-col text-left shrink-0 rounded-2xl p-3.5 border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
        minWidth: "160px",
      }}
    >
      <div className="flex items-center justify-between w-full mb-1">
        <span
          className="font-inter text-xs font-semibold"
          style={{ color: "var(--ink)" }}
        >
          {service.name}
        </span>
        <ArrowUpRight size={13} style={{ color: "var(--slate)" }} />
      </div>
      <p
        className="font-inter text-[10px] line-clamp-1 mb-2"
        style={{ color: "var(--slate)" }}
      >
        {service.description}
      </p>
      <span
        className="font-mono text-[11px] font-semibold tracking-tight"
        style={{ color: "var(--ink)" }}
      >
        Rs. {service.price_min.toLocaleString()} – {service.price_max.toLocaleString()}
      </span>
    </button>
  );
}