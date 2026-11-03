import Link from "next/link";
import { login, signup } from "./actions";

type Props = { searchParams: Promise<{ error?: string; message?: string; next?: string }> };
const errors: Record<string, string> = {
  "invalid-credentials": "Email or password is incorrect.",
  "password-too-short": "Use a password with at least 8 characters.",
  "signup-failed": "We could not create your account. Please try again.",
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return <main><section className="panel">
    <p className="muted">SUREDATE</p><h1>Welcome</h1>
    <p className="muted">Sign in or create an account to continue.</p>
    {params.error && <p className="notice" role="alert">{errors[params.error] ?? "Something went wrong."}</p>}
    {params.message === "check-email" && <p className="notice">Check your email for the confirmation link.</p>}
    <form action={login}>
      <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
      <button type="submit">Sign in</button>
    </form>
    <form action={signup}>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <button className="secondary" type="submit">Create account</button>
    </form>
    <p className="notice"><Link href="/">Back to home</Link></p>
  </section></main>;
}
