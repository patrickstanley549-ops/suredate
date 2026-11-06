import Link from "next/link";
import { requestPasswordReset } from "./actions";

type Props = { searchParams: Promise<{ error?: string; message?: string }> };

export default async function ForgotPasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  return <main><section className="panel">
    <p className="muted">SUREDATE</p>
    <h1>Reset your password</h1>
    <p className="muted">Enter the email address on your SureDate account. If an account exists, we&apos;ll send you a secure password-reset link.</p>
    {params.error === "invalid-email" && <p className="notice" role="alert">Enter a valid email address.</p>}
    {params.error === "send-failed" && <p className="notice" role="alert">We couldn&apos;t send the reset email right now. Please try again later.</p>}
    {params.message === "sent" && <p className="notice" role="status">If an account exists for that email, a password-reset link has been sent. Check your inbox and spam folder.</p>}
    <form action={requestPasswordReset}>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <button type="submit">Send reset link</button>
    </form>
    <p className="notice"><Link href="/login">Back to sign in</Link></p>
  </section></main>;
}
