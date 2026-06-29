import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export type AppRole = "applicant" | "officer";

export function roleFromUser(user: User | null): AppRole | null {
  const raw = user?.app_metadata?.role;
  return raw === "applicant" || raw === "officer" ? raw : null;
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function requireApplicant(): Promise<{ user: User } | { response: NextResponse }> {
  const user = await getSessionUser();
  if (!user) return { response: unauthorized() };
  if (roleFromUser(user) !== "applicant") return { response: forbidden() };
  return { user };
}

export async function requireOfficer(): Promise<{ user: User } | { response: NextResponse }> {
  const user = await getSessionUser();
  if (!user) return { response: unauthorized() };
  if (roleFromUser(user) !== "officer") return { response: forbidden() };
  return { user };
}
