import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const APPLICANT_GUEST_PATHS = ["/applicant/login", "/applicant/signup"];
const APPLICANT_PROTECTED = "/applicant/dashboard";
const OFFICER_PROTECTED = "/officer/dashboard";
const OFFICER_LOGIN = "/officer/login";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Logged-in applicants shouldn't visit login/signup — bounce to dashboard
  if (user && APPLICANT_GUEST_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = APPLICANT_PROTECTED;
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Unauthenticated users can't access applicant dashboard
  if (!user && (pathname === APPLICANT_PROTECTED || pathname.startsWith(`${APPLICANT_PROTECTED}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = "/applicant/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Unauthenticated users can't access officer dashboard
  if (!user && (pathname === OFFICER_PROTECTED || pathname.startsWith(`${OFFICER_PROTECTED}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = OFFICER_LOGIN;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
