import React, { useState } from "react";
import {
  Wrench,
  Search,
  MessageSquare,
  Bell,
  Plus,
  Calendar,
  ArrowLeft,
  Maximize2,
  Download,
  Share2,
  Star,
  Clock,
  Award,
  Globe,
  Camera,
  MoreVertical,
  Car,
  LayoutGrid,
  Settings,
  Users,
  ClipboardList,
  Sun,
  Moon,
  Disc,
  Gauge,
  Droplet,
  PaintBucket,
} from "lucide-react";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
`;

const THEMES = {
  light: {
    lime: "#D7F13A",
    ink: "#14161A",
    ink2: "#1E2126",
    page: "#F3F4F2",
    card: "#FFFFFF",
    chip: "#E7E9E4",
    slate: "#8A93A0",
    fill: "#AFC2D4",
    text: "#14161A",
    shadow: "0 1px 3px rgba(20,22,26,0.06)",
    navPill: "#1E2126",
    border: "#E7E9E4",
    warn: "#FCEFD6",
  },
  dark: {
    lime: "#D7F13A",
    ink: "#F3F4F2",
    ink2: "#26282E",
    page: "#101114",
    card: "#1A1C21",
    chip: "#26282E",
    slate: "#8A93A0",
    fill: "#4F6478",
    text: "#F3F4F2",
    shadow: "0 1px 3px rgba(0,0,0,0.35)",
    navPill: "#000000",
    border: "#2A2D33",
    warn: "#3A331C",
  },
};

const JOBS = [
  { id: 1, plate: "LEA-2201", model: "Honda Civic", date: "Aug 12, 2024", mechanic: "Phillip Saris", tag: "Paint & Body", active: true },
  { id: 2, plate: "KHI-8830", model: "Suzuki Alto", date: "Aug 12, 2024", mechanic: "Marcus Bator", tag: "Oil Change", active: false },
  { id: 3, plate: "LHE-1190", model: "Toyota Corolla", date: "Aug 11, 2024", mechanic: "Jakob Dokidis", tag: "Engine Tuning", active: false },
];

const PROGRESS = [
  { label: "Engine Tuning", pct: 85 },
  { label: "Paint & Body", pct: 40 },
  { label: "Wheel Alignment", pct: 100 },
  { label: "AC Repair", pct: 0 },
];

const PATTERN_ICONS = [Wrench, Car, Settings, Disc, Gauge, Droplet, PaintBucket];

// Deterministic layout (not random-per-render) so it never shifts, even on theme toggle.
function buildBackgroundPattern() {
  const seedPositions = [
    { top: 4, left: 6, rot: -12 }, { top: 10, left: 32 }, { top: 6, left: 58, rot: 10 },
    { top: 14, left: 82, rot: -6 }, { top: 24, left: 16, rot: 8 }, { top: 22, left: 46, rot: -18 },
    { top: 28, left: 70, rot: 14 }, { top: 20, left: 94, rot: -8 }, { top: 38, left: 4, rot: 20 },
    { top: 40, left: 28, rot: -10 }, { top: 44, left: 54, rot: 6 }, { top: 36, left: 88, rot: -14 },
    { top: 52, left: 12, rot: -6 }, { top: 56, left: 40, rot: 16 }, { top: 50, left: 64, rot: -20 },
    { top: 58, left: 96, rot: 10 }, { top: 66, left: 8, rot: 12 }, { top: 70, left: 34, rot: -8 },
    { top: 64, left: 60, rot: 18 }, { top: 72, left: 84, rot: -12 }, { top: 82, left: 20, rot: -16 },
    { top: 86, left: 48, rot: 8 }, { top: 80, left: 74, rot: -6 }, { top: 92, left: 92, rot: 14 },
    { top: 94, left: 2, rot: -10 },
  ];
  return seedPositions.map((pos, i) => ({
    Icon: PATTERN_ICONS[i % PATTERN_ICONS.length],
    top: pos.top,
    left: pos.left,
    rot: pos.rot || 0,
    size: 34 + ((i * 7) % 3) * 10,
  }));
}

function BackgroundPattern({ C }) {
  const pattern = React.useMemo(buildBackgroundPattern, []);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none" style={{ zIndex: 0 }}>
      {pattern.map((p, i) => (
        <p.Icon
          key={i}
          size={p.size}
          color={C.text}
          strokeWidth={1.2}
          style={{
            position: "absolute",
            top: `${p.top}%`,
            left: `${p.left}%`,
            transform: `rotate(${p.rot}deg)`,
            opacity: 0.14,
          }}
        />
      ))}
    </div>
  );
}

function NavPill({ C }) {
  const items = [LayoutGrid, Wrench, ClipboardList, Settings, Users];
  return (
    <div className="flex items-center gap-1 rounded-full px-1.5 py-1.5" style={{ background: C.navPill }}>
      {items.map((Icon, i) => (
        <button
          key={i}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: i === 1 ? C.lime : "transparent" }}
        >
          <Icon size={16} color={i === 1 ? C.ink2 : C.slate} />
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ label, pct, C }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-['Inter'] text-sm font-medium" style={{ color: C.text }}>{label}</span>
        <span className="font-['IBM_Plex_Mono'] text-xs font-semibold" style={{ color: C.slate }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full w-full" style={{ background: C.chip }}>
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? C.lime : C.fill }} />
      </div>
    </div>
  );
}

function JobCard({ job, selected, onClick, C }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl p-4 transition-all"
      style={{ background: C.card, border: selected ? `2px solid ${C.lime}` : "2px solid transparent", boxShadow: C.shadow }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} color={C.slate} />
          <span className="font-['Inter'] text-[11px]" style={{ color: C.slate }}>{job.date}</span>
        </div>
        <MoreVertical size={14} color={C.slate} />
      </div>

      <div className="relative w-full h-24 rounded-xl flex items-center justify-center mb-3" style={{ background: C.chip }}>
        <Car size={40} color={C.text} strokeWidth={1.2} className="opacity-80" />
        <span
          className="absolute bottom-2 right-2 px-2 py-0.5 rounded font-['IBM_Plex_Mono'] text-[10px] font-semibold tracking-wide"
          style={{ background: C.ink2, color: C.lime }}
        >
          {job.plate}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-['Inter'] text-[10px] font-semibold" style={{ background: C.chip, color: C.text }}>
            {job.mechanic.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-['Inter'] text-xs font-medium" style={{ color: C.text }}>{job.mechanic}</p>
            <p className="font-['Inter'] text-[10px]" style={{ color: C.slate }}>Mechanic</p>
          </div>
        </div>
        <span className="font-['Inter'] text-[10px] font-medium px-2 py-1 rounded-full" style={{ background: job.active ? C.lime : C.chip, color: job.active ? C.ink2 : C.text }}>
          {job.tag}
        </span>
      </div>
    </button>
  );
}

export default function AdminDashboardPreview() {
  const [selected, setSelected] = useState(1);
  const [dark, setDark] = useState(false);
  const C = dark ? THEMES.dark : THEMES.light;
  const job = JOBS.find((j) => j.id === selected);

  return (
    <div className="min-h-screen w-full p-6 transition-colors duration-300 relative" style={{ background: C.page }}>
      <style>{FONTS}</style>
      <BackgroundPattern C={C} />
      <div className="max-w-[1360px] mx-auto relative z-10">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.ink2 }}>
              <Wrench size={16} color={C.lime} />
            </div>
            <span className="font-['Oswald'] font-semibold text-lg tracking-wide" style={{ color: C.text }}>ALLYAN GARAGE</span>
          </div>

          <NavPill C={C} />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: C.card, boxShadow: C.shadow }}>
              <Search size={14} color={C.slate} />
              <span className="font-['Inter'] text-xs" style={{ color: C.slate }}>Search jobs, clients...</span>
            </div>

            <button
              onClick={() => setDark(!dark)}
              className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden"
              style={{ background: C.card, boxShadow: C.shadow }}
              aria-label="Toggle theme"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={16} color={C.lime} /> : <Moon size={16} color={C.text} />}
            </button>

            <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.card, boxShadow: C.shadow }}>
              <MessageSquare size={16} color={C.text} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center relative" style={{ background: C.card, boxShadow: C.shadow }}>
              <Bell size={16} color={C.text} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: C.lime }} />
            </button>
            <div className="flex items-center gap-2 pl-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-['Inter'] text-xs font-semibold" style={{ background: C.ink2, color: C.lime }}>
                DB
              </div>
              <div>
                <p className="font-['Inter'] text-xs font-semibold" style={{ color: C.text }}>Davis Bergson</p>
                <p className="font-['Inter'] text-[10px]" style={{ color: C.slate }}>Admin Cashier</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.card, boxShadow: C.shadow }}>
              <ArrowLeft size={16} color={C.text} />
            </button>
            <div>
              <p className="font-['Inter'] text-xs" style={{ color: C.slate }}>Workshop Dashboard</p>
              <h1 className="font-['Oswald'] text-2xl font-semibold" style={{ color: C.text }}>Live Job Monitoring</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full px-4 py-2.5 font-['Inter'] text-xs font-medium" style={{ color: C.text, background: C.card, boxShadow: C.shadow }}>
              <Calendar size={14} />
              Aug 12, 2024
            </div>
            <button className="flex items-center gap-1.5 rounded-full px-4 py-2.5 font-['Inter'] text-xs font-semibold" style={{ background: C.lime, color: C.ink2 }}>
              <Plus size={14} />
              Add Booking
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-5">

          {/* Job queue */}
          <div className="col-span-3 flex flex-col gap-3">
            {JOBS.map((j) => (
              <JobCard key={j.id} job={j} selected={j.id === selected} onClick={() => setSelected(j.id)} C={C} />
            ))}
          </div>

          {/* Job detail */}
          <div className="col-span-6 flex flex-col gap-5">
            <div className="rounded-2xl p-4" style={{ background: C.card, boxShadow: C.shadow }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-['Inter'] text-[11px]" style={{ color: C.slate }}>Latest Update</p>
                  <h2 className="font-['Oswald'] text-lg font-semibold" style={{ color: C.text }}>{job.model} — {job.tag}</h2>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-['Inter'] text-[11px] font-semibold" style={{ background: C.warn, color: C.text }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  In Progress
                </span>
              </div>

              <div className="relative w-full aspect-video rounded-xl flex items-center justify-center" style={{ background: C.chip }}>
                <div className="flex flex-col items-center gap-2">
                  <Camera size={26} color={C.slate} />
                  <span className="font-['Inter'] text-xs" style={{ color: C.slate }}>Photo update — uploaded 10:40 AM</span>
                </div>
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full font-['Inter'] text-[10px] font-semibold" style={{ background: C.card, color: C.text }}>
                  Photo Update
                </span>
                <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.card }}>
                  <Maximize2 size={13} color={C.text} />
                </button>
              </div>

              <p className="font-['Inter'] text-xs mt-3 p-3 rounded-lg" style={{ background: C.chip, color: C.text }}>
                "Engine tuning done, moving to paint. Front bumper primed and ready for base coat."
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-full font-['Inter'] text-[11px] font-medium border" style={{ background: C.card, borderColor: C.border, color: C.text }}>
                  <Download size={12} /> Save photo
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-full font-['Inter'] text-[11px] font-medium border" style={{ background: C.card, borderColor: C.border, color: C.text }}>
                  <Share2 size={12} /> Notify client
                </button>
              </div>
            </div>

            <div className="rounded-2xl p-5" style={{ background: C.card, boxShadow: C.shadow }}>
              <h3 className="font-['Oswald'] text-base font-semibold mb-4" style={{ color: C.text }}>Job Progress</h3>
              <div className="flex flex-col gap-4">
                {PROGRESS.map((p) => (
                  <ProgressBar key={p.label} label={p.label} pct={p.pct} C={C} />
                ))}
              </div>
              <button className="w-full mt-5 py-3 rounded-xl font-['Inter'] text-sm font-semibold" style={{ background: C.lime, color: C.ink2 }}>
                Update Job Status
              </button>
            </div>
          </div>

          {/* Mechanic panel */}
          <div className="col-span-3">
            <div className="rounded-2xl p-5" style={{ background: C.card, boxShadow: C.shadow }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-['Inter'] text-sm font-semibold" style={{ background: C.ink2, color: C.lime }}>
                    {job.mechanic.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-['Inter'] text-sm font-semibold" style={{ color: C.text }}>{job.mechanic}</p>
                    <p className="font-['Inter'] text-[11px]" style={{ color: C.slate }}>Mechanic</p>
                  </div>
                </div>
                <MoreVertical size={15} color={C.slate} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { Icon: Clock, label: "5 Years", sub: "Experience" },
                  { Icon: Award, label: "Engine Repair", sub: "Specialization" },
                  { Icon: Star, label: "4.8 (61)", sub: "Ratings" },
                  { Icon: Globe, label: "8 AM – 5 PM", sub: "Availability" },
                ].map(({ Icon, label, sub }) => (
                  <div key={sub} className="rounded-xl p-3" style={{ background: C.chip }}>
                    <Icon size={14} color={C.text} />
                    <p className="font-['Inter'] text-xs font-semibold mt-2" style={{ color: C.text }}>{label}</p>
                    <p className="font-['Inter'] text-[10px]" style={{ color: C.slate }}>{sub}</p>
                  </div>
                ))}
              </div>

              <p className="font-['Inter'] text-xs mb-4" style={{ color: C.slate }}>
                Handles engine diagnostics and tuning for the workshop's daily intake. Currently assigned to 3 active jobs.
              </p>

              <p className="font-['Inter'] text-[11px] font-semibold mb-2" style={{ color: C.text }}>Skills</p>
              <div className="flex flex-wrap gap-2">
                {["Engine Overhauls", "Electrical Systems", "Diagnostics"].map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-full font-['Inter'] text-[10px] font-medium" style={{ background: C.chip, color: C.text }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Palette swatch */}
            <div className="rounded-2xl p-4 mt-5" style={{ background: C.card, boxShadow: C.shadow }}>
              <p className="font-['Inter'] text-[11px] font-semibold mb-3" style={{ color: C.text }}>Palette</p>
              <div className="flex gap-2">
                {[C.lime, C.ink2, C.fill, C.slate].map((c) => (
                  <div key={c} className="flex-1 h-10 rounded-lg" style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
