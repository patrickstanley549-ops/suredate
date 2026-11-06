"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect("/forgot-password?error=invalid-email");
  }

  const headerStore = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? headerStore.get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: new URL("/auth/callback?next=/update-password", origin).toString(),
  });

  if (error) redirect("/forgot-password?error=send-failed");
  redirect("/forgot-password?message=sent");
}
