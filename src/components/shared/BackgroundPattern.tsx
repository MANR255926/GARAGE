"use client";

import React from "react";
import {
  Wrench,
  Car,
  Settings,
  Disc,
  Gauge,
  Droplet,
  PaintBucket,
  Zap,
  RotateCw,
  Wind,
  Fuel,
  Thermometer,
  Battery,
  Radio,
  Compass,
  Cog,
  Sliders,
  BarChart2,
  ShieldCheck,
  Key,
  AlertTriangle,
  Clipboard,
  Clock,
  MapPin,
} from "lucide-react";

// 25 hardcoded positions — never randomized, never shifts on re-render or theme toggle
const PATTERN = [
  { Icon: Wrench,       top:  4, left:  6, rot: -12, size: 34 },
  { Icon: Car,          top: 10, left: 32, rot:   0, size: 44 },
  { Icon: Settings,     top:  6, left: 58, rot:  10, size: 34 },
  { Icon: Disc,         top: 14, left: 82, rot:  -6, size: 54 },
  { Icon: Gauge,        top: 24, left: 16, rot:   8, size: 44 },
  { Icon: Droplet,      top: 22, left: 46, rot: -18, size: 34 },
  { Icon: PaintBucket,  top: 28, left: 70, rot:  14, size: 54 },
  { Icon: Zap,          top: 20, left: 94, rot:  -8, size: 34 },
  { Icon: RotateCw,     top: 38, left:  4, rot:  20, size: 44 },
  { Icon: Wind,         top: 40, left: 28, rot: -10, size: 34 },
  { Icon: Fuel,         top: 44, left: 54, rot:   6, size: 54 },
  { Icon: Thermometer,  top: 36, left: 88, rot: -14, size: 34 },
  { Icon: Battery,      top: 52, left: 12, rot:  -6, size: 44 },
  { Icon: Radio,        top: 56, left: 40, rot:  16, size: 34 },
  { Icon: Compass,      top: 50, left: 64, rot: -20, size: 54 },
  { Icon: Cog,          top: 58, left: 96, rot:  10, size: 44 },
  { Icon: Sliders,      top: 66, left:  8, rot:  12, size: 34 },
  { Icon: BarChart2,    top: 70, left: 34, rot:  -8, size: 44 },
  { Icon: ShieldCheck,  top: 64, left: 60, rot:  18, size: 34 },
  { Icon: Key,          top: 72, left: 84, rot: -12, size: 54 },
  { Icon: AlertTriangle,top: 82, left: 20, rot: -16, size: 34 },
  { Icon: Clipboard,    top: 86, left: 48, rot:   8, size: 44 },
  { Icon: Clock,        top: 80, left: 74, rot:  -6, size: 34 },
  { Icon: MapPin,       top: 92, left: 92, rot:  14, size: 44 },
  { Icon: Car,          top: 94, left:  2, rot: -10, size: 54 },
];

export function BackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none select-none"
      style={{ zIndex: 0 }}
    >
      {PATTERN.map(({ Icon, top, left, rot, size }, i) => (
        <Icon
          key={i}
          size={size}
          strokeWidth={1.2}
          style={{
            position: "absolute",
            top: `${top}%`,
            left: `${left}%`,
            transform: `rotate(${rot}deg)`,
            opacity: 0.14,
            color: "var(--ink)",
          }}
        />
      ))}
    </div>
  );
}
