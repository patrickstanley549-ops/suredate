"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (password.length < 8) redirect("/update-password?error=password-too-short");
  if (password !== confirmPassword) redirect("/update-password?error=password-mismatch");

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/forgot-password?error=invalid-link");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/update-password?error=update-failed");
  redirect("/login?message=password-updated");
}
