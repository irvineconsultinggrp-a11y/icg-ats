import { NextResponse } from "next/server";

import { requireOfficer } from "@/lib/auth/session";

import {
  MAX_HOSTING_OFFICERS_PER_ROOM,
  normalizeOfficerSlots,
} from "@/lib/interview-schedule/room-hosts";

import { INTERVIEW_ROOMS } from "@/lib/group-interview/sessions";

import { createAdminClient } from "@/utils/supabase/admin";



export async function GET() {

  const gate = await requireOfficer();

  if ("response" in gate) return gate.response;



  const admin = createAdminClient();

  const { data, error } = await admin.from("interview_room_hosts").select("slot_key, officer_names");



  if (error) {

    console.error("[interview-schedule/room-hosts GET]", error);

    return NextResponse.json({ error: error.message }, { status: 500 });

  }



  const map: Record<string, string[]> = {};

  for (const row of data ?? []) {

    if (row.slot_key) {
      map[row.slot_key] = normalizeOfficerSlots(
        row.officer_names as string[] | null,
        MAX_HOSTING_OFFICERS_PER_ROOM,
      );
    }

  }

  return NextResponse.json({ data: map });

}



export async function PUT(request: Request) {

  const gate = await requireOfficer();

  if ("response" in gate) return gate.response;



  let body: { slotKey?: string; officerNames?: unknown };

  try {

    body = (await request.json()) as { slotKey?: string; officerNames?: unknown };

  } catch {

    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  }



  const slotKey = body.slotKey?.trim();

  if (!slotKey) return NextResponse.json({ error: "Missing slotKey" }, { status: 400 });



  const valid = INTERVIEW_ROOMS.some((room) => slotKey.endsWith(`::${room}`));

  if (!valid) return NextResponse.json({ error: "Invalid slot key" }, { status: 400 });



  const officerNames = normalizeOfficerSlots(
    Array.isArray(body.officerNames) ? (body.officerNames as string[]) : [],
    MAX_HOSTING_OFFICERS_PER_ROOM,
  );

  const hasAny = officerNames.some((n) => n.length > 0);

  const admin = createAdminClient();



  if (!hasAny) {

    const { error } = await admin.from("interview_room_hosts").delete().eq("slot_key", slotKey);

    if (error) {

      console.error("[interview-schedule/room-hosts PUT delete]", error);

      return NextResponse.json({ error: error.message }, { status: 500 });

    }

    return NextResponse.json({ ok: true });

  }



  const stored = officerNames.filter((n) => n.length > 0);



  const { error } = await admin.from("interview_room_hosts").upsert(

    {

      slot_key: slotKey,

      officer_names: stored,

      updated_at: new Date().toISOString(),

    },

    { onConflict: "slot_key" },

  );



  if (error) {

    console.error("[interview-schedule/room-hosts PUT]", error);

    return NextResponse.json({ error: error.message }, { status: 500 });

  }



  return NextResponse.json({ ok: true });

}

