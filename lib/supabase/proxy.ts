import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  const { data: userData } = data?.claims ? await supabase.auth.getUser() : { data: { user: null } };
  const user = userData?.user;
  const phoneVerified = Boolean(user?.phone_confirmed_at);
  const path = request.nextUrl.pathname;
  if (path.startsWith("/dashboard") && !data?.claims) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.searchParams.set("next", path);
    const redirect = NextResponse.redirect(target);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }
  if (data?.claims && !phoneVerified && path !== "/verify-phone") {
    const target = request.nextUrl.clone();
    target.pathname = "/verify-phone";
    target.search = "";
    return NextResponse.redirect(target);
  }
  if (path === "/login" && data?.claims && phoneVerified) {
    const target = request.nextUrl.clone();
    target.pathname = "/dashboard";
    target.search = "";
    return NextResponse.redirect(target);
  }
  if (path === "/verify-phone" && data?.claims && phoneVerified) {
    const target = request.nextUrl.clone();
    target.pathname = "/dashboard";
    target.search = "";
    return NextResponse.redirect(target);
  }
  return response;
}
