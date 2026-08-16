# Allyan Garage — Build Walkthrough

Summary of completed engineering work on the **Allyan Garage** platform.

---

## Key Achievements

### 1. Project Scaffolding & Design Tokens
- **Framework**: Next.js App Router with TypeScript & Tailwind CSS in `D:\GARAGE`.
- **Design Tokens**: Defined custom CSS variables in [`globals.css`](file:///d:/GARAGE/src/app/globals.css) and [`tailwind.config.js`](file:///d:/GARAGE/tailwind.config.js):
  - `--lime` (`#D7F13A` accent)
  - `--ink`, `--ink-2`, `--page`, `--card`, `--chip`, `--slate`, `--fill`, `--border-color`, `--warn`
- **Typography**: Configured `Oswald` (headings), `Inter` (body/buttons), and `IBM Plex Mono` (data/plates/timestamps) via `next/font/google` in [`layout.tsx`](file:///d:/GARAGE/src/app/layout.tsx).
- **Theme Engine**: Built FOUC-free persistent [`ThemeProvider.tsx`](file:///d:/GARAGE/src/components/ThemeProvider.tsx) supporting system default and `localStorage` toggle.

---

### 2. Componentized Admin Dashboard Migration
Migrated `garage_web_GUI.jsx` into modular Next.js components:
- [`BackgroundPattern.tsx`](file:///d:/GARAGE/src/components/shared/BackgroundPattern.tsx): 25 scattered Lucide icons with 14% opacity.
- [`NavPill.tsx`](file:///d:/GARAGE/src/components/admin/NavPill.tsx): Top pill navigation bar.
- [`JobCard.tsx`](file:///d:/GARAGE/src/components/admin/JobCard.tsx): Vehicle queue card.
- [`ProgressBar.tsx`](file:///d:/GARAGE/src/components/admin/ProgressBar.tsx): Monospace progress bar.
- [`JobDetailPanel.tsx`](file:///d:/GARAGE/src/components/admin/JobDetailPanel.tsx): Latest update card & job progress.
- [`MechanicPanel.tsx`](file:///d:/GARAGE/src/components/admin/MechanicPanel.tsx): Mechanic bio and 2x2 stat grid (palette debug card removed).
- Mounted at [`app/admin/dashboard/page.tsx`](file:///d:/GARAGE/src/app/admin/dashboard/page.tsx).

---

### 3. Remaining 4 Admin UI Screens
- **Admin Login** ([`app/admin/login/page.tsx`](file:///d:/GARAGE/src/app/admin/login/page.tsx)): Phone OTP login form with dark mode switch.
- **Shop Settings & Hours** ([`app/admin/settings/page.tsx`](file:///d:/GARAGE/src/app/admin/settings/page.tsx)): Shop open/closed toggle switch, operating hours inputs, and customer announcement editor.
- **Services Management** ([`app/admin/services/page.tsx`](file:///d:/GARAGE/src/app/admin/services/page.tsx)): CRUD table for services (`name`, `description`, `price_min`, `price_max`, `active`) with modal editor.
- **Job Status Update Modal** ([`UpdateJobStatusModal.tsx`](file:///d:/GARAGE/src/components/admin/UpdateJobStatusModal.tsx)): Modal form for status notes, photo uploads, and progress sliders.

---

### 4. Database Schema & RLS Spec
- [`supabase/schema.sql`](file:///d:/GARAGE/supabase/schema.sql): PostgreSQL DDL for all 6 tables (`users`, `vehicles`, `services`, `bookings`, `job_updates`, `shop_settings`), index definitions, `set_updated_at()` trigger, and strict Row Level Security (RLS) policies.

---

### 5. Git Commit Traceability
Initialized local git repository in `D:\GARAGE`:
- **Commit**: `feat: scaffold Next.js App Router project with Tailwind CSS design system and theme engine`
