# Suredate

A Next.js App Router starter with Supabase email/password authentication.

## Setup

1. Use Node.js 20.9 or newer.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your Supabase project's API settings.
4. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
5. In Supabase Dashboard → Authentication → URL Configuration, set the local Site URL to `http://localhost:3000` and add `http://localhost:3000/auth/callback` to Redirect URLs.
6. Run `npm install`, then `npm run dev`.

Open `http://localhost:3000/login` to sign in or create an account. Keep email confirmation enabled in production.

## Authentication

- Uses `@supabase/ssr` with separate browser and server clients.
- Root `proxy.ts` refreshes auth cookies and gates `/dashboard`.
- Server-side identity checks use `supabase.auth.getClaims()`.
- Never expose a Supabase secret/service-role key in browser code or commit credentials.
- Add your production origin and callback URL to Supabase Auth URL Configuration before deployment.
