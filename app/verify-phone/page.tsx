import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendPhoneCode, verifyPhone, logout } from "@/app/login/actions";

type Props = { searchParams: Promise<{ error?: string; message?: string }> };

const errors: Record<string, string> = {
  "invalid-phone": "Enter a valid phone number in international format, including + and country code.",
  "sms-send-failed": "We could not send the SMS. Check the number or try again later.",
  "invalid-code": "That code is incorrect or has expired. Request a new code and try again.",
};

export default async function VerifyPhonePage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  if (user.phone_confirmed_at) redirect("/dashboard");
  const savedPhone = typeof user.user_metadata?.pending_phone === "string" ? user.user_metadata.pending_phone : "";
  const phone = user.phone ?? savedPhone;

  return <main><section className="panel">
    <p className="muted">SUREDATE</p>
    <h1>Verify your phone</h1>
    <p className="muted">Your email is confirmed. Verify your phone number with a one-time SMS code to finish setting up your SureDate account.</p>
    {params.error && <p className="notice" role="alert">{errors[params.error] ?? "Something went wrong. Please try again."}</p>}
    {params.message === "code-sent" && <p className="notice" role="status">We sent a 6-digit code by SMS. Enter it below.</p>}
    <form action={sendPhoneCode}>
      <label>Mobile number
        <input name="phone" type="tel" autoComplete="tel" placeholder="+6281234567890" defaultValue={phone} pattern="\+[1-9][0-9]{7,14}" required />
      </label>
      <p className="field-help">Use international format, including + and your country code.</p>
      <button type="submit">Send verification code</button>
    </form>
    <form action={verifyPhone}>
      <input type="hidden" name="phone" value={phone} />
      <label>6-digit SMS code
        <input name="token" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required />
      </label>
      <button className="secondary" type="submit">Verify phone and continue</button>
    </form>
    <form action={logout}><button className="secondary" type="submit">Sign out</button></form>
  </section></main>;
}
