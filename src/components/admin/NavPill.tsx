"use client";

import {
  LayoutGrid,
  Wrench,
  ClipboardList,
  Settings,
  Users,
  Search,
  Sun,
  Moon,
  MessageSquare,
  Bell,
} from "lucide-react";
import { useTheme } from "@/components/shared/ThemeProvider";

interface NavPillProps {
  activeTab?: number;
  onTabChange?: (idx: number) => void;
  adminName?: string;
  adminRole?: string;
  adminInitials?: string;
}

const NAV_ITEMS = [
  { Icon: LayoutGrid,   label: "Dashboard" },
  { Icon: Wrench,       label: "Workshop"  },
  { Icon: ClipboardList,label: "Bookings"  },
  { Icon: Settings,     label: "Settings"  },
  { Icon: Users,        label: "Team"      },
];

export function NavPill({
  activeTab = 0,
  onTabChange,
  adminName = "Davis Bergson",
  adminRole = "Admin Cashier",
  adminInitials = "DB",
}: NavPillProps) {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  return (
    <header className="flex items-center justify-between mb-6">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "var(--ink-2)" }}
        >
          <Wrench size={16} color="var(--lime)" />
        </div>
        <span
          className="font-oswald font-semibold text-lg tracking-wide"
          style={{ color: "var(--ink)" }}
        >
          ALLYAN GARAGE
        </span>
      </div>

      {/* Pill nav */}
      <nav
        className="flex items-center gap-1 rounded-full px-1.5 py-1.5"
        style={{ background: dark ? "#000000" : "var(--ink-2)" }}
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map(({ Icon, label }, i) => (
          <button
            key={label}
            id={`nav-${label.toLowerCase()}`}
            aria-label={label}
            aria-current={i === activeTab ? "page" : undefined}
            onClick={() => onTabChange?.(i)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: i === activeTab ? "var(--lime)" : "transparent",
            }}
          >
            <Icon
              size={16}
              color={i === activeTab ? "var(--ink-2)" : "var(--slate)"}
            />
          </button>
        ))}
      </nav>

      {/* Right cluster */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="hidden md:flex items-center gap-2 rounded-full px-4 py-2.5"
          style={{
            background: "var(--card)",
            boxShadow: dark
              ? "0 1px 3px rgba(0,0,0,0.35)"
              : "0 1px 3px rgba(20,22,26,0.06)",
          }}
        >
          <Search size={14} color="var(--slate)" />
          <span className="font-inter text-xs" style={{ color: "var(--slate)" }}>
            Search jobs, clients...
          </span>
        </div>

        {/* Theme toggle */}
        <button
          id="btn-toggle-theme"
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "var(--card)",
            boxShadow: dark
              ? "0 1px 3px rgba(0,0,0,0.35)"
              : "0 1px 3px rgba(20,22,26,0.06)",
          }}
        >
          {dark ? (
            <Sun size={16} color="var(--lime)" />
          ) : (
            <Moon size={16} color="var(--ink)" />
          )}
        </button>

        {/* Messages */}
        <button
          id="btn-messages"
          aria-label="Messages"
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: "var(--card)",
            boxShadow: dark
              ? "0 1px 3px rgba(0,0,0,0.35)"
              : "0 1px 3px rgba(20,22,26,0.06)",
          }}
        >
          <MessageSquare size={16} color="var(--ink)" />
        </button>

        {/* Notifications */}
        <button
          id="btn-notifications"
          aria-label="Notifications"
          className="w-10 h-10 rounded-full flex items-center justify-center relative"
          style={{
            background: "var(--card)",
            boxShadow: dark
              ? "0 1px 3px rgba(0,0,0,0.35)"
              : "0 1px 3px rgba(20,22,26,0.06)",
          }}
        >
          <Bell size={16} color="var(--ink)" />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--lime)" }}
          />
        </button>

        {/* Admin profile */}
        <div className="flex items-center gap-2 pl-1">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-inter text-xs font-semibold"
            style={{ background: "var(--ink-2)", color: "var(--lime)" }}
          >
            {adminInitials}
          </div>
          <div>
            <p className="font-inter text-xs font-semibold" style={{ color: "var(--ink)" }}>
              {adminName}
            </p>
            <p className="font-inter text-[10px]" style={{ color: "var(--slate)" }}>
              {adminRole}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
