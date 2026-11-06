import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "./actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password?error=invalid-link");

  return <main><section className="panel">
    <p className="muted">SUREDATE</p>
    <h1>Choose a new password</h1>
    <p className="muted">Use at least 8 characters. This changes your SureDate password only.</p>
    {params.error === "password-too-short" && <p className="notice" role="alert">Use a password with at least 8 characters.</p>}
    {params.error === "password-mismatch" && <p className="notice" role="alert">The passwords do not match.</p>}
    {params.error === "update-failed" && <p className="notice" role="alert">We couldn&apos;t update your password. Please request a new reset link.</p>}
    <form action={updatePassword}>
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <label>Confirm new password<input name="confirm_password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <button type="submit">Save new password</button>
    </form>
    <p className="notice"><Link href="/login">Back to sign in</Link></p>
  </section></main>;
}
