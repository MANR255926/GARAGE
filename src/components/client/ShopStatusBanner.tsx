"use client";

import { Clock, CheckCircle2, XCircle, Info } from "lucide-react";
import { SHOP_SETTINGS, type ShopSettings } from "@/lib/mock-data";

interface ShopStatusBannerProps {
  settings?: ShopSettings;
}

export function ShopStatusBanner({ settings = SHOP_SETTINGS }: ShopStatusBannerProps) {
  const { isOpen, openingTime, closingTime, message } = settings;

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-300 border"
      style={{
        background: isOpen ? "var(--card)" : "var(--chip)",
        borderColor: isOpen ? "var(--border)" : "transparent",
        boxShadow: "0 1px 3px rgba(20,22,26,0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full font-inter text-[11px] font-semibold"
            style={{
              background: isOpen ? "var(--lime)" : "var(--chip)",
              color: isOpen ? "var(--ink-2)" : "var(--slate)",
            }}
          >
            {isOpen ? (
              <CheckCircle2 size={12} className="stroke-[2.5]" />
            ) : (
              <XCircle size={12} />
            )}
            {isOpen ? "Shop Open" : "Closed"}
          </span>
          <span className="font-inter text-xs font-medium" style={{ color: "var(--slate)" }}>
            {openingTime} – {closingTime}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Clock size={13} color="var(--slate)" />
          <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--ink)" }}>
            Today
          </span>
        </div>
      </div>

      {message && (
        <div
          className="flex items-start gap-2 rounded-xl p-2.5 mt-1"
          style={{ background: isOpen ? "var(--chip)" : "var(--card)" }}
        >
          <Info size={14} className="shrink-0 mt-0.5" style={{ color: "var(--slate)" }} />
          <p className="font-inter text-xs leading-snug" style={{ color: "var(--ink)" }}>
            {message}
          </p>
        </div>
      )}
    </div>
  );
}