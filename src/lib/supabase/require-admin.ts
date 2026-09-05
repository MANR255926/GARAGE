import { createClient } from "@/lib/supabase/server";

export type RequireAdminResult =
  | { authorized: true; userId: string }
  | { authorized: false; status: 401 | 403; error: string };

export async function requireAdmin(): Promise<RequireAdminResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      authorized: false,
      status: 401,
      error: "Unauthorized",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden",
    };
  }

  return {
    authorized: true,
    userId: user.id,
  };
}