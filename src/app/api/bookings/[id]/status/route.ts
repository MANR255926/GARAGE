import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    const { id: bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status_text, note } = body;

    const validStatuses = ["pending", "in_progress", "on_hold", "completed"];
    if (!status_text || !validStatuses.includes(status_text)) {
      return NextResponse.json(
        { error: `Invalid status_text. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Exact mapping per prompt:
    // status_text 'pending'      -> bookings.status 'pending'
    // status_text 'in_progress'  -> bookings.status 'confirmed'
    // status_text 'on_hold'      -> bookings.status 'confirmed'
    // status_text 'completed'    -> bookings.status 'completed'
    let mappedBookingStatus: string;
    switch (status_text) {
      case "in_progress":
      case "on_hold":
        mappedBookingStatus = "confirmed";
        break;
      case "completed":
        mappedBookingStatus = "completed";
        break;
      case "pending":
      default:
        mappedBookingStatus = "pending";
        break;
    }

    const supabase = createAdminClient();

    // 1. Insert job_updates row
    const { data: jobUpdate, error: insertErr } = await supabase
      .from("job_updates")
      .insert({
        booking_id: bookingId,
        status_text,
        note: note ? String(note).trim() : null,
        photo_url: null,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // 2. Update bookings.status column
    const { data: updatedBooking, error: updateBookingErr } = await supabase
      .from("bookings")
      .update({
        status: mappedBookingStatus,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (updateBookingErr) {
      return NextResponse.json({ error: updateBookingErr.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        job_update: jobUpdate,
        booking: updatedBooking,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
