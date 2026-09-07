import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function GET() {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        user_id,
        vehicle_id,
        service_id,
        date,
        time,
        status,
        created_at,
        vehicles (
          id,
          make,
          model,
          plate_number
        ),
        services (
          id,
          name
        ),
        users:user_id (
          id,
          name,
          phone
        ),
        job_updates (
          id,
          status_text,
          note,
          photo_url,
          created_at
        )
      `)
      .order("date", { ascending: false })
      .order("time", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ bookings: data || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
