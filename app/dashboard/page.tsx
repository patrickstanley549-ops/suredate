import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) redirect("/login");
  const email = typeof data.claims.email === "string" ? data.claims.email : "Signed-in user";
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  const isAdmin = admins.includes(email.toLowerCase());

  return <main><section className="panel">
    <p className="muted">SUREDATE</p><h1>Your dashboard</h1>
    <p className="muted">You are signed in as {email}.</p>
    {isAdmin && <p className="notice"><Link href="/admin">Open admin dashboard</Link></p>}
    <form action={logout}><button type="submit">Sign out</button></form>
  </section></main>;
}
