import { ROUND_1_HOSTING_OFFICERS_PER_ROOM } from "@/lib/group-interview/sessions";

export const MAX_HOSTING_OFFICERS_PER_ROOM = ROUND_1_HOSTING_OFFICERS_PER_ROOM;

export type RoomHostMap = Record<string, string[]>;

export function normalizeOfficerSlots(
  names: string[] | undefined | null,
  slotCount: number = MAX_HOSTING_OFFICERS_PER_ROOM,
): string[] {
  const max = Math.max(1, Math.min(slotCount, MAX_HOSTING_OFFICERS_PER_ROOM));
  const slots = (names ?? []).slice(0, max).map((n) => n.trim().slice(0, 120));
  while (slots.length < max) slots.push("");
  return slots;
}

export function officerSlotsEqual(
  a: string[],
  b: string[],
  slotCount: number = MAX_HOSTING_OFFICERS_PER_ROOM,
): boolean {
  return normalizeOfficerSlots(a, slotCount).every(
    (v, i) => v === normalizeOfficerSlots(b, slotCount)[i],
  );
}

export async function fetchRoomHosts(): Promise<{ data?: RoomHostMap; error?: string }> {
  const res = await fetch("/api/interview-schedule/room-hosts", { credentials: "include" });
  const body = (await res.json()) as { data?: RoomHostMap; error?: string };
  if (!res.ok) return { error: body.error ?? "Failed to load room hosts." };
  return { data: body.data ?? {} };
}

export async function saveRoomHosts(
  slotKey: string,
  officerNames: string[],
  slotCount: number = MAX_HOSTING_OFFICERS_PER_ROOM,
): Promise<{ error?: string }> {
  const res = await fetch("/api/interview-schedule/room-hosts", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slotKey,
      officerNames: normalizeOfficerSlots(officerNames, slotCount),
    }),
  });
  const body = (await res.json()) as { error?: string };
  if (!res.ok) return { error: body.error ?? "Failed to save hosting officers." };
  return {};
}
