"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    redirect("/forgot-password?error=invalid-email");
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.suredate.online";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: new URL("/auth/callback?next=/update-password", origin).toString(),
  });

  if (error) {
    // Log diagnostic details only; never log the submitted email or credentials.
    console.error("[password-reset] Supabase email request failed", {
      name: error.name,
      status: error.status,
      code: error.code,
      message: error.message.split(email).join("[redacted]"),
    });
    redirect("/forgot-password?error=send-failed");
  }

  redirect("/forgot-password?message=sent");
}
