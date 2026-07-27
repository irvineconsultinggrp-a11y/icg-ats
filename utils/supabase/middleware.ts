import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getPublicSupabaseEnv } from "./env";

const APPLICANT_GUEST_PATHS = ["/applicant/login", "/applicant/signup"];
const APPLICANT_PROTECTED = "/applicant/dashboard";
const OFFICER_PROTECTED = "/officer/dashboard";
const OFFICER_LOGIN = "/officer/login";

function roleFromJwt(user: { app_metadata?: Record<string, unknown> } | null) {
  const raw = user?.app_metadata?.role;
  return raw === "applicant" || raw === "officer" ? raw : null;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const { url: supabaseUrl, key: supabaseKey } = getPublicSupabaseEnv();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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

  if (pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    return supabaseResponse;
  }

  if (user && APPLICANT_GUEST_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (roleFromJwt(user) === "applicant") {
      const url = request.nextUrl.clone();
      url.pathname = APPLICANT_PROTECTED;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (pathname === APPLICANT_PROTECTED || pathname.startsWith(`${APPLICANT_PROTECTED}/`)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/applicant/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (roleFromJwt(user) !== "applicant") {
      const url = request.nextUrl.clone();
      url.pathname = "/applicant/login";
      url.searchParams.set("error", "role");
      return NextResponse.redirect(url);
    }
  }

  if (pathname === OFFICER_PROTECTED || pathname.startsWith(`${OFFICER_PROTECTED}/`)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = OFFICER_LOGIN;
      return NextResponse.redirect(url);
    }
    if (roleFromJwt(user) !== "officer") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
