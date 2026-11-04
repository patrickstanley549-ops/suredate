"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/dashboard";
}

function isAdult(dateText: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return false;
  const birth = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== dateText) return false;
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const birthdayHasNotOccurred =
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate());
  if (birthdayHasNotOccurred) age -= 1;
  return age >= 18;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=invalid-credentials");
  redirect(next);
}

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const dateOfBirth = String(formData.get("date_of_birth") ?? "").trim();

  if (password.length < 8) redirect("/login?error=password-too-short");
  if (!displayName || displayName.length > 40) redirect("/login?error=display-name-required");
  if (!gender || gender.length > 40) redirect("/login?error=gender-required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) redirect("/login?error=invalid-date");
  const parsedBirthDate = new Date(`${dateOfBirth}T00:00:00.000Z`);
  if (Number.isNaN(parsedBirthDate.getTime()) || parsedBirthDate.toISOString().slice(0, 10) !== dateOfBirth) {
    redirect("/login?error=invalid-date");
  }
  if (!isAdult(dateOfBirth)) redirect("/login?error=under-18");

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: {
        display_name: displayName,
        gender,
        date_of_birth: dateOfBirth,
        country: String(formData.get("country") ?? "").trim(),
        race_ethnicity: String(formData.get("race_ethnicity") ?? "").trim(),
        religion: String(formData.get("religion") ?? "").trim(),
        height_cm: String(formData.get("height_cm") ?? "").trim(),
        weight_kg: String(formData.get("weight_kg") ?? "").trim(),
        clothing_size: String(formData.get("clothing_size") ?? "").trim(),
      },
    },
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("18 years")) redirect("/login?error=under-18");
    if (message.includes("date of birth")) redirect("/login?error=invalid-date");
    redirect("/login?error=signup-failed");
  }
  redirect("/login?message=check-email");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
