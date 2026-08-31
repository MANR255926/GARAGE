-- ============================================================
-- Allyan Garage — Supabase Schema
-- ============================================================
-- Run this in the Supabase SQL Editor on a fresh database.
-- Assumes auth.users already exists (Supabase auth default).
-- ============================================================

-- ── Shared updated_at trigger ────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ── 1. users ─────────────────────────────────────────────────
-- Extends auth.users. id is the same UUID Supabase auth uses.

CREATE TABLE public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  phone       TEXT        NOT NULL UNIQUE,
  role        TEXT        NOT NULL DEFAULT 'client'
                          CHECK (role IN ('client', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role  ON public.users(role);
CREATE INDEX idx_users_phone ON public.users(phone);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 2. vehicles ──────────────────────────────────────────────

CREATE TABLE public.vehicles (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  make         TEXT        NOT NULL,
  model        TEXT        NOT NULL,
  plate_number TEXT        NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);

CREATE TRIGGER trg_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 3. services ──────────────────────────────────────────────

CREATE TABLE public.services (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  price_min   NUMERIC(10,2) NOT NULL CHECK (price_min >= 0),
  price_max   NUMERIC(10,2) NOT NULL CHECK (price_max >= price_min),
  active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_active ON public.services(active);

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. bookings ──────────────────────────────────────────────
-- No unique constraint on (date, time) by design —
-- slot-conflict enforcement lives in application logic.

CREATE TABLE public.bookings (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  vehicle_id  UUID        NOT NULL REFERENCES public.vehicles(id) ON DELETE RESTRICT,
  service_id  UUID        NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  date        DATE        NOT NULL,
  time        TIME        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_user_id    ON public.bookings(user_id);
CREATE INDEX idx_bookings_vehicle_id ON public.bookings(vehicle_id);
CREATE INDEX idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX idx_bookings_date       ON public.bookings(date);
CREATE INDEX idx_bookings_status     ON public.bookings(status);

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 5. job_updates ───────────────────────────────────────────

CREATE TABLE public.job_updates (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id  UUID        NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status_text TEXT        NOT NULL,
  photo_url   TEXT,
  note        TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — job_updates are immutable append-only records.
);

CREATE INDEX idx_job_updates_booking_id ON public.job_updates(booking_id);

-- ── 6. shop_settings ─────────────────────────────────────────
-- Singleton row enforced via a fixed id value of 1.
-- Use an INSERT ON CONFLICT DO UPDATE (upsert) pattern from the app.

CREATE TABLE public.shop_settings (
  id            INTEGER     PRIMARY KEY DEFAULT 1,
  is_open       BOOLEAN     NOT NULL DEFAULT TRUE,
  opening_time  TIME        NOT NULL DEFAULT '08:00',
  closing_time  TIME        NOT NULL DEFAULT '17:00',
  message       TEXT        NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Hard-enforce singleton: id must always be 1
  CONSTRAINT shop_settings_singleton CHECK (id = 1)
);

CREATE TRIGGER trg_shop_settings_updated_at
  BEFORE UPDATE ON public.shop_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed the singleton row so it always exists
INSERT INTO public.shop_settings (id, is_open, opening_time, closing_time, message)
VALUES (1, TRUE, '08:00', '17:00', 'Welcome to Allyan Garage!')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_updates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

-- ── Helper function: is current user an admin? ───────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ── users RLS ────────────────────────────────────────────────

-- Clients: can read/update their own row only
CREATE POLICY "users: client read own"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "users: client insert own"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "users: client update own"
  ON public.users FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE POLICY "users: admin delete"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- ── vehicles RLS ─────────────────────────────────────────────

CREATE POLICY "vehicles: client read own"
  ON public.vehicles FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "vehicles: client insert own"
  ON public.vehicles FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "vehicles: client update own"
  ON public.vehicles FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "vehicles: admin delete"
  ON public.vehicles FOR DELETE
  USING (public.is_admin());

-- ── services RLS ─────────────────────────────────────────────
-- All authenticated users can read services (needed for booking).
-- Only admins can write.

CREATE POLICY "services: authenticated read"
  ON public.services FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "services: admin insert"
  ON public.services FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "services: admin update"
  ON public.services FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "services: admin delete"
  ON public.services FOR DELETE
  USING (public.is_admin());

-- ── bookings RLS ─────────────────────────────────────────────

CREATE POLICY "bookings: client read own"
  ON public.bookings FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "bookings: client insert own"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "bookings: client update own"
  ON public.bookings FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "bookings: admin delete"
  ON public.bookings FOR DELETE
  USING (public.is_admin());

-- ── job_updates RLS ──────────────────────────────────────────
-- Readable by the owning client (via their booking) and all admins.
-- Writable only by admins.

CREATE POLICY "job_updates: client read own"
  ON public.job_updates FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = job_updates.booking_id
        AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "job_updates: admin insert"
  ON public.job_updates FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "job_updates: admin update"
  ON public.job_updates FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "job_updates: admin delete"
  ON public.job_updates FOR DELETE
  USING (public.is_admin());

-- ── shop_settings RLS ────────────────────────────────────────
-- Readable by all authenticated users (clients need it to show open/closed).
-- Writable only by admins.

CREATE POLICY "shop_settings: authenticated read"
  ON public.shop_settings FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "shop_settings: admin update"
  ON public.shop_settings FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- (No INSERT/DELETE policies — singleton is seeded above and never re-inserted.)
