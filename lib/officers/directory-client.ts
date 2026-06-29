import type { OfficerDirectoryRow } from "@/lib/types/database";

export type DirectoryMember = {
  id: string;
  name: string;
  role: string;
  category: "executive" | "director" | "member";
  bio: string;
  interests: string[];
  photo: string;
  calendlyUrl: string | null;
};

export function mapOfficerCategory(
  category: string | null,
): DirectoryMember["category"] {
  if (category === "executive" || category === "director") return category;
  return "member";
}

export function officerPhotoUrl(officer: OfficerDirectoryRow): string {
  if (officer.avatar_url) return officer.avatar_url;
  return `/images/headshots/${officer.name}.png`;
}

export function mapOfficerToMember(officer: OfficerDirectoryRow): DirectoryMember {
  const interests = officer.hobbies
    ? officer.hobbies.split(/[,;|]/).map((s) => s.trim()).filter(Boolean)
    : [];

  return {
    id: officer.id,
    name: officer.name,
    role: officer.role ?? "ICG Officer",
    category: mapOfficerCategory(officer.category),
    bio: officer.hobbies
      ? `Connect with ${officer.name} about ${officer.hobbies}.`
      : `Connect with ${officer.name} to learn more about ICG.`,
    interests,
    photo: officerPhotoUrl(officer),
    calendlyUrl: officer.calendly_link,
  };
}

export async function fetchOfficerDirectory(): Promise<{
  data?: DirectoryMember[];
  error?: string;
}> {
  const res = await fetch("/api/officers/directory", { credentials: "include" });
  const body = (await res.json()) as { data?: OfficerDirectoryRow[]; error?: string };
  if (!res.ok) return { error: body.error ?? "Failed to load officers." };
  return { data: (body.data ?? []).map(mapOfficerToMember) };
}

export async function fetchMyCoffeeChatRequests(): Promise<{
  data?: Array<{ id: string; officer_id: string; status: string }>;
  error?: string;
}> {
  const res = await fetch("/api/coffee-chat-requests", { credentials: "include" });
  const body = (await res.json()) as {
    data?: Array<{ id: string; officer_id: string; status: string }>;
    error?: string;
  };
  if (!res.ok) return { error: body.error ?? "Failed to load requests." };
  return { data: body.data ?? [] };
}

export async function createCoffeeChatRequest(
  officerId: string,
  message?: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/coffee-chat-requests", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ officerId, message }),
  });
  const body = (await res.json()) as { error?: string };
  if (!res.ok) return { ok: false, error: body.error ?? "Failed to send request." };
  return { ok: true };
}
