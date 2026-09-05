// src/lib/mock-data.ts
// All mock data â€” no real Supabase calls in this session.

export type JobStatus = "pending" | "in_progress" | "on_hold" | "completed";

export interface Mechanic {
  id: string;
  name: string;
  initials: string;
  specialization: string;
  experience: string;
  rating: string;
  ratingCount: number;
  availability: string;
  bio: string;
  skills: string[];
  activeJobs: number;
}

export interface ServiceProgress {
  label: string;
  pct: number;
}

export interface Job {
  id: number;
  plate: string;
  model: string;
  date: string;
  mechanicId: string;
  tag: string;
  status: JobStatus;
  note: string;
  photoTime: string;
  progress: ServiceProgress[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  plate_number: string;
}

export interface ShopSettings {
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  message: string;
}

export interface JobHistoryItem {
  id: string;
  status: JobStatus;
  statusText: string;
  time: string;
  date: string;
  note: string;
  photoUrl?: string;
}

export const MECHANICS: Record<string, Mechanic> = {
  "mech-01": {
    id: "mech-01",
    name: "Phillip Saris",
    initials: "PS",
    specialization: "Engine Repair",
    experience: "5 Years",
    rating: "4.8",
    ratingCount: 61,
    availability: "8 AM â€“ 5 PM",
    bio: "Handles engine diagnostics and tuning for the workshop's daily intake. Currently assigned to 3 active jobs.",
    skills: ["Engine Overhauls", "Electrical Systems", "Diagnostics"],
    activeJobs: 3,
  },
  "mech-02": {
    id: "mech-02",
    name: "Marcus Bator",
    initials: "MB",
    specialization: "Lube & Fluids",
    experience: "3 Years",
    rating: "4.6",
    ratingCount: 38,
    availability: "9 AM â€“ 6 PM",
    bio: "Specializes in preventive maintenance and fluid systems. Quick turnaround on routine services.",
    skills: ["Oil Change", "Fluid Flush", "Filter Replacement"],
    activeJobs: 2,
  },
  "mech-03": {
    id: "mech-03",
    name: "Jakob Dokidis",
    initials: "JD",
    specialization: "Engine Tuning",
    experience: "7 Years",
    rating: "4.9",
    ratingCount: 102,
    availability: "8 AM â€“ 4 PM",
    bio: "Senior engine tuning specialist with extensive experience on Japanese and European makes.",
    skills: ["Engine Tuning", "Performance Mods", "ECU Calibration"],
    activeJobs: 4,
  },
};

export const JOBS: Job[] = [
  {
    id: 1,
    plate: "LEA-2201",
    model: "Honda Civic",
    date: "Aug 12, 2024",
    mechanicId: "mech-01",
    tag: "Paint & Body",
    status: "in_progress",
    note: "Engine tuning done, moving to paint. Front bumper primed and ready for base coat.",
    photoTime: "10:40 AM",
    progress: [
      { label: "Engine Tuning", pct: 85 },
      { label: "Paint & Body", pct: 40 },
      { label: "Wheel Alignment", pct: 100 },
      { label: "AC Repair", pct: 0 },
    ],
  },
  {
    id: 2,
    plate: "KHI-8830",
    model: "Suzuki Alto",
    date: "Aug 12, 2024",
    mechanicId: "mech-02",
    tag: "Oil Change",
    status: "completed",
    note: "Oil and filter replaced. Air filter cleaned. All fluid levels topped up.",
    photoTime: "9:15 AM",
    progress: [
      { label: "Oil Change", pct: 100 },
      { label: "Filter Check", pct: 100 },
    ],
  },
  {
    id: 3,
    plate: "LHE-1190",
    model: "Toyota Corolla",
    date: "Aug 11, 2024",
    mechanicId: "mech-03",
    tag: "Engine Tuning",
    status: "pending",
    note: "Vehicle received. Initial diagnostics scheduled for 11 AM.",
    photoTime: "8:00 AM",
    progress: [
      { label: "Diagnostics", pct: 20 },
      { label: "Engine Tuning", pct: 0 },
      { label: "Test Drive", pct: 0 },
    ],
  },
];

export const SERVICES: Service[] = [
  { id: "svc-01", name: "Oil Change",      description: "Full synthetic oil & filter replacement", price_min: 2500,  price_max: 3500,  active: true  },
  { id: "svc-02", name: "Engine Tuning",   description: "Performance tuning & ECU calibration",    price_min: 8000,  price_max: 20000, active: true  },
  { id: "svc-03", name: "Paint & Body",    description: "Full exterior paint correction & repair",  price_min: 15000, price_max: 80000, active: true  },
  { id: "svc-04", name: "Wheel Alignment", description: "4-wheel computerized alignment",           price_min: 1500,  price_max: 2500,  active: true  },
  { id: "svc-05", name: "AC Repair",       description: "Refrigerant recharge & system inspection", price_min: 3000,  price_max: 10000, active: true  },
  { id: "svc-06", name: "Brake Service",   description: "Pad & rotor replacement, caliper check",   price_min: 4000,  price_max: 12000, active: false },
];

export const SHOP_SETTINGS: ShopSettings = {
  isOpen: true,
  openingTime: "08:00",
  closingTime: "17:00",
  message: "Workshop is active! Express lane open for oil & fluid services today.",
};

export const CLIENT_VEHICLE: Vehicle = {
  id: "veh-01",
  make: "Honda",
  model: "Civic Oriel 1.8",
  plate_number: "LEA-2201",
};

export const CLIENT_JOB: Job = {
  id: 1,
  plate: "LEA-2201",
  model: "Honda Civic Oriel 1.8",
  date: "Aug 12, 2024",
  mechanicId: "mech-01",
  tag: "Paint & Body",
  status: "in_progress",
  note: "Engine tuning done, moving to paint. Front bumper primed and ready for base coat.",
  photoTime: "10:40 AM",
  progress: [
    { label: "Engine Tuning", pct: 85 },
    { label: "Paint & Body", pct: 40 },
    { label: "Wheel Alignment", pct: 100 },
    { label: "AC Repair", pct: 0 },
  ],
};

export const CLIENT_JOB_HISTORY: JobHistoryItem[] = [
  {
    id: "hist-01",
    status: "pending",
    statusText: "Vehicle Checked In",
    time: "08:30 AM",
    date: "Aug 12, 2024",
    note: "Vehicle received at intake bay. Inspection & diagnostic scan queued.",
  },
  {
    id: "hist-02",
    status: "in_progress",
    statusText: "Engine Diagnostics Complete",
    time: "09:45 AM",
    date: "Aug 12, 2024",
    note: "Tuning calibration uploaded. Spark plugs replaced and throttle body cleaned.",
  },
  {
    id: "hist-03",
    status: "in_progress",
    statusText: "Body Prep & Priming",
    time: "10:40 AM",
    date: "Aug 12, 2024",
    note: "Engine tuning done, moving to paint. Front bumper primed and ready for base coat.",
    photoUrl: "/placeholder-car.jpg",
  },
];