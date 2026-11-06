import Link from "next/link";
import { login, signup } from "./actions";

type Props = { searchParams: Promise<{ error?: string; message?: string; next?: string }> };
const errors: Record<string, string> = {
  "invalid-credentials": "Email or password is incorrect.",
  "password-too-short": "Use a password with at least 8 characters.",
  "invalid-date": "Enter a valid date of birth.",
  "under-18": "Suredate is for adults aged 18 and over.",
  "display-name-required": "Enter a display name (up to 40 characters).",
  "gender-required": "Choose a gender to create your profile.",
  "signup-failed": "We could not create your account. Please check your details and try again.",
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return <main><section className="panel">
    <p className="muted">SUREDATE</p><h1>Welcome</h1>
    <p className="muted">Sign in or create an account to continue.</p>
    {params.error && <p className="notice" role="alert">{errors[params.error] ?? "Something went wrong."}</p>}
    {params.message === "check-email" && <p className="notice" role="status">Check your email for the confirmation link. Your profile details have been saved privately.</p>}
    <form action={login}>
      <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
      <h2>Sign in</h2>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
      <button type="submit">Sign in</button>
    </form>
    <form action={signup}>
      <h2>Create your Suredate account</h2>
      <p className="muted">Your date of birth, display name and gender are required. Other personal details are optional and kept private.</p>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
      <label>Display name<input name="display_name" type="text" autoComplete="nickname" maxLength={40} required /></label>
      <label>Gender
        <select name="gender" defaultValue="" required>
          <option value="" disabled>Select your gender</option>
          <option value="Woman">Woman</option>
          <option value="Man">Man</option>
          <option value="Non-binary">Non-binary</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
      </label>
      <label>Date of birth
        <input name="date_of_birth" type="date" autoComplete="bday" required />
      </label>
      <p className="field-help">You must be at least 18 years old to join. Your full date of birth is never shown on your public profile.</p>
      <details>
        <summary>Optional profile details</summary>
        <div className="optional-fields">
          <label>Country<input name="country" type="text" autoComplete="country-name" maxLength={100} placeholder="Your country" /></label>
          <label>Race / ethnicity<input name="race_ethnicity" type="text" maxLength={80} placeholder="Optional" /></label>
          <label>Religion<input name="religion" type="text" maxLength={80} placeholder="Optional" /></label>
          <label>Height (cm)<input name="height_cm" type="number" min={80} max={250} step={1} inputMode="numeric" placeholder="Optional" /></label>
          <label>Weight (kg)<input name="weight_kg" type="number" min={20} max={500} step="0.1" inputMode="decimal" placeholder="Optional" /></label>
          <label>Clothing size<input name="clothing_size" type="text" maxLength={30} placeholder="Optional" /></label>
        </div>
      </details>
      <label>How did you hear about SureDate? (optional)
        <select name="heard_about_us" defaultValue="">
          <option value="">Select a source (optional)</option>
          <optgroup label="Search engines">
            <option value="google_search">Google Search</option>
            <option value="google_ads">Google Ads</option>
            <option value="bing">Bing</option>
            <option value="yahoo">Yahoo</option>
            <option value="duckduckgo">DuckDuckGo</option>
          </optgroup>
          <optgroup label="Social media and messaging">
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="x_twitter">X (Twitter)</option>
            <option value="snapchat">Snapchat</option>
            <option value="pinterest">Pinterest</option>
            <option value="linkedin">LinkedIn</option>
            <option value="reddit">Reddit</option>
            <option value="threads">Threads</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
            <option value="discord">Discord</option>
            <option value="twitch">Twitch</option>
            <option value="quora">Quora</option>
            <option value="bluesky">Bluesky</option>
          </optgroup>
          <optgroup label="Recommendations and other channels">
            <option value="friend_family">Friend or family</option>
            <option value="influencer_creator">Influencer or content creator</option>
            <option value="blog_article">Blog or online article</option>
            <option value="podcast">Podcast</option>
            <option value="online_ad">Online advertisement</option>
            <option value="dating_community">Dating or online community</option>
            <option value="news_media">News or magazine</option>
            <option value="app_store">App store</option>
            <option value="event_meetup">Event or meetup</option>
            <option value="other">Other</option>
            <option value="not_sure">I&apos;m not sure / I don&apos;t remember</option>
          </optgroup>
        </select>
      </label>
      <label>If you selected Other, please specify (optional)
        <input name="heard_about_us_other" type="text" maxLength={120} placeholder="Where did you hear about us?" />
      </label>
      <button className="secondary" type="submit">Create account</button>
    </form>
    <p className="notice"><Link href="/">Back to home</Link></p>
  </section></main>;
}
