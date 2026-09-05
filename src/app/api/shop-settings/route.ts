import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("shop_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.is_open !== undefined) updateData.is_open = Boolean(body.is_open);
    if (body.opening_time !== undefined) updateData.opening_time = body.opening_time;
    if (body.closing_time !== undefined) updateData.closing_time = body.closing_time;
    if (body.message !== undefined) updateData.message = body.message;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("shop_settings")
      .upsert({ id: 1, ...updateData })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ settings: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}