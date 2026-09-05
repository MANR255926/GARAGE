-- ============================================================
-- Migration: 0002_public_reads_and_user_sync.sql
-- Description:
-- 1. Sync new auth.users (including anonymous users) into public.users.
-- 2. Allow public/anonymous SELECT on services.
-- 3. Allow public/anonymous SELECT on shop_settings.
-- ============================================================

-- ── 1. User sync trigger on auth.users ───────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Guest User'),
    COALESCE(NEW.phone, NEW.email, NEW.id::text),
    'client'
  )
  ON CONFLICT (id) DO UPDATE
    SET phone = EXCLUDED.phone
    WHERE public.users.phone IS NULL OR public.users.phone = '';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ── 2. Services public read policy ───────────────────────────
DROP POLICY IF EXISTS "services: authenticated read" ON public.services;
DROP POLICY IF EXISTS "services: public read" ON public.services;

CREATE POLICY "services: public read"
  ON public.services FOR SELECT
  USING (TRUE);

-- ── 3. Shop settings public read policy ──────────────────────
DROP POLICY IF EXISTS "shop_settings: authenticated read" ON public.shop_settings;
DROP POLICY IF EXISTS "shop_settings: public read" ON public.shop_settings;

CREATE POLICY "shop_settings: public read"
  ON public.shop_settings FOR SELECT
  USING (TRUE);