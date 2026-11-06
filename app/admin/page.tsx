import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logout } from "@/app/login/actions";

type AdminUser = {
  id: string;
  email?: string;
  created_at: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  user_metadata?: Record<string, unknown>;
};

const sourceLabels: Record<string, string> = {
  google_search: "Google Search", google_ads: "Google Ads", bing: "Bing",
  yahoo: "Yahoo", duckduckgo: "DuckDuckGo", facebook: "Facebook",
  instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube",
  x_twitter: "X", snapchat: "Snapchat", pinterest: "Pinterest",
  linkedin: "LinkedIn", reddit: "Reddit", threads: "Threads",
  whatsapp: "WhatsApp", telegram: "Telegram", discord: "Discord",
  twitch: "Twitch", quora: "Quora", bluesky: "Bluesky",
  friend_family: "Friend or family", influencer_creator: "Influencer / creator",
  blog_article: "Blog / article", podcast: "Podcast", online_ad: "Online ad",
  dating_community: "Dating community", news_media: "News / magazine",
  app_store: "App store", event_meetup: "Event / meetup", other: "Other",
  not_sure: "Not sure",
};

function metadataText(user: AdminUser, key: string) {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value : "";
}

function dateLabel(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

export default async function AdminPage() {
  const authClient = await createClient();
  const { data, error } = await authClient.auth.getClaims();
  if (error || !data?.claims) redirect("/login");

  const email = typeof data.claims.email === "string" ? data.claims.email.toLowerCase() : "";
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!email || !admins.includes(email)) redirect("/dashboard");

  const adminKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!adminKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return <main className="admin-shell"><section className="admin-card">
      <p className="eyebrow">SUREDATE · ADMIN</p><h1>Finish admin setup</h1>
      <p className="muted">Your account is on the admin allowlist. Add the Supabase server-side secret to your Vercel environment variables to load account data.</p>
      <p className="setup-code">SUPABASE_SECRET_KEY</p>
      <p className="muted">Use the Supabase secret key (or legacy service_role key). Keep it server-side only and never add it to a NEXT_PUBLIC variable.</p>
      <Link href="/dashboard">Back to dashboard</Link>
    </section></main>;
  }

  const supabaseAdmin = createAdminClient();
  const { data: userData, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    return <main className="admin-shell"><section className="admin-card">
      <p className="eyebrow">SUREDATE · ADMIN</p><h1>We couldn't load accounts</h1>
      <p className="muted">Check that the Supabase secret key is correct and has not expired.</p>
      <Link href="/dashboard">Back to dashboard</Link>
    </section></main>;
  }

  const users = (userData.users as AdminUser[]).slice().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const total = users.length;
  const emailConfirmed = users.filter((user) => Boolean(user.email_confirmed_at)).length;
  const phoneConfirmed = users.filter((user) => Boolean(user.phone_confirmed_at)).length;
  const sourceCounts = new Map<string, number>();
  for (const user of users) {
    const source = metadataText(user, "heard_about_us");
    if (source) sourceCounts.set(source, (sourceCounts.get(source) ?? 0) + 1);
  }
  const sources = [...sourceCounts.entries()].sort((a, b) => b[1] - a[1]);

  return <main className="admin-shell">
    <header className="admin-header">
      <div><p className="eyebrow">SUREDATE · ADMIN</p><h1>Overview</h1>
        <p className="muted">A private view of account growth and signup sources.</p></div>
      <div className="admin-actions"><Link href="/dashboard">Member view</Link>
        <form action={logout}><button className="secondary" type="submit">Sign out</button></form></div>
    </header>

    <section className="stat-grid" aria-label="Account statistics">
      <article className="stat-card"><span>Total accounts loaded</span><strong>{total.toLocaleString()}</strong><small>First 1,000 accounts</small></article>
      <article className="stat-card"><span>Email confirmed</span><strong>{emailConfirmed.toLocaleString()}</strong><small>{total ? Math.round(emailConfirmed / total * 100) : 0}% of loaded accounts</small></article>
      <article className="stat-card"><span>Phone confirmed</span><strong>{phoneConfirmed.toLocaleString()}</strong><small>Based on confirmed phone timestamps</small></article>
    </section>

    <section className="admin-card">
      <div className="section-heading"><div><h2>Recent signups</h2><p className="muted">Most recently created accounts in the loaded set.</p></div></div>
      {users.length ? <div className="table-wrap"><table className="admin-table">
        <thead><tr><th>Member</th><th>Joined</th><th>Email</th><th>Phone</th><th>Discovery source</th></tr></thead>
        <tbody>{users.slice(0, 12).map((user) => {
          const source = metadataText(user, "heard_about_us");
          const name = metadataText(user, "display_name") || user.email || "Member";
          return <tr key={user.id}>
            <td><strong>{name}</strong><small>{user.email ?? "No email"}</small></td>
            <td>{dateLabel(user.created_at)}</td>
            <td><span className={user.email_confirmed_at ? "status-pill is-good" : "status-pill"}>{user.email_confirmed_at ? "Confirmed" : "Pending"}</span></td>
            <td><span className={user.phone_confirmed_at ? "status-pill is-good" : "status-pill"}>{user.phone_confirmed_at ? "Confirmed" : "Not verified"}</span></td>
            <td>{source ? (sourceLabels[source] ?? source) : "Not provided"}</td>
          </tr>;
        })}</tbody>
      </table></div> : <p className="empty-state">No accounts found yet.</p>}
    </section>

    <section className="admin-card">
      <div className="section-heading"><div><h2>How people find SureDate</h2><p className="muted">Optional signup answers from the loaded accounts.</p></div></div>
      {sources.length ? <div className="source-list">{sources.map(([source, count]) =>
        <div className="source-row" key={source}><span>{sourceLabels[source] ?? source}</span>
          <div className="source-track"><i style={{ width: `${Math.max(4, count / Math.max(...sources.map((item) => item[1])) * 100)}%` }} /></div>
          <strong>{count}</strong></div>
      )}</div> : <p className="empty-state">No referral-source answers have been recorded yet.</p>}
    </section>
    <p className="admin-footnote">Privacy note: this view only displays account email, display name, signup date, verification status and referral source. It does not display private profile details.</p>
  </main>;
}
