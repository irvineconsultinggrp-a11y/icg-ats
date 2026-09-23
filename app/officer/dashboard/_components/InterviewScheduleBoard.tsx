"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchPipelineApplicants,
  interviewScheduleToPatch,
  patchApplicant,
  rowToInterviewSchedule,
} from "@/lib/applicants/stages";
import {
  buildAssignmentId,
  buildSlotId,
  getGroupInterviewSlot,
  GROUP_INTERVIEW_SLOTS,
  INTERVIEW_ROOMS,
  interviewRoomDisplayName,
  isAssignedOnScheduleDay,
  LUNCH_BREAK_LABEL,
  parseAssignmentId,
  type InterviewRoom,
} from "@/lib/group-interview/sessions";
import { computeAutoRoomAssignments } from "@/lib/interview-schedule/auto-assign";
import type { InterviewScheduleRoundConfig } from "@/lib/interview-schedule/schedule-config";
import {
  fetchRoomHosts,
  normalizeOfficerSlots,
  officerSlotsEqual,
  saveRoomHosts,
} from "@/lib/interview-schedule/room-hosts";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { BatchEmailCampaignModal } from "@/components/email/BatchEmailCampaignModal";
import {
  fetchScheduleEmailSendsClient,
  formatSendLabel,
  sendForCurrentAssignment,
  type ScheduleEmailSendRecord,
} from "@/lib/email/schedule-email-sends";
import { campaignFromRound, type EmailCampaignScope } from "@/lib/email/types";

type Applicant = ReturnType<typeof rowToInterviewSchedule>;

const APPLICANT_DRAG_TYPE = "application/x-icg-applicant-id";

function applicantIdFromDragEvent(e: React.DragEvent): string | null {
  return e.dataTransfer.getData(APPLICANT_DRAG_TYPE) || e.dataTransfer.getData("text/plain") || null;
}

function isApplicantDragEvent(e: React.DragEvent): boolean {
  const types = e.dataTransfer.types;
  return types.includes(APPLICANT_DRAG_TYPE) || types.includes("text/plain");
}

function availabilityForScheduleDay(applicant: Applicant, scheduleDay: string) {
  const slotOrder = GROUP_INTERVIEW_SLOTS.filter((s) => s.date === scheduleDay).map((s) => s.id);
  const orderIndex = new Map(slotOrder.map((id, index) => [id, index]));
  const entries: { id: string; label: string }[] = [];
  for (const id of applicant.availableSlots) {
    const slot = getGroupInterviewSlot(id);
    if (slot?.date !== scheduleDay) continue;
    entries.push({ id, label: slot.time });
  }
  entries.sort(
    (a, b) => (orderIndex.get(a.id) ?? 999) - (orderIndex.get(b.id) ?? 999),
  );
  return entries;
}

function ApplicantAvailabilityModal({
  applicant,
  scheduleDay,
  activeSlotId,
  onClose,
  onSelectSlot,
}: {
  applicant: Applicant;
  scheduleDay: string;
  activeSlotId: string | null;
  onClose: () => void;
  onSelectSlot: (slotId: string) => void;
}) {
  const label = `${applicant.firstName} ${applicant.lastName}`.trim();
  const times = availabilityForScheduleDay(applicant, scheduleDay);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="availability-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#e4e4e7] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#e4e4e7] px-6 py-4">
          <h2 id="availability-modal-title" className="text-lg font-semibold text-[#061c2a]">
            {label}
          </h2>
          <p className="text-sm text-[#6b7280] mt-0.5">{applicant.email}</p>
          <p className="text-xs text-[#6b7280] mt-2">{scheduleDay}</p>
        </div>
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280] mb-3">
            Available interview blocks
          </p>
          {times.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No availability submitted for this day.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {times.map(({ id, label: timeLabel }) => {
                const selected = activeSlotId === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectSlot(id);
                        onClose();
                      }}
                      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                        selected
                          ? "border-[#061c2a] bg-[#061c2a]/5 font-semibold text-[#061c2a]"
                          : "border-[#e4e4e7] text-[#111827] hover:border-[#061c2a]/30 hover:bg-[#fafafa]"
                      }`}
                    >
                      {timeLabel}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-xs text-[#a1a1aa] mt-4">
            Close this window, then drag their bubble into a room for the time block you want.
          </p>
        </div>
        <div className="flex justify-end border-t border-[#e4e4e7] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-lg border border-[#e4e4e7] text-sm font-medium text-[#374151] hover:bg-[#f4f4f5]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function UnscheduledBubble({
  applicant,
  scheduleDay,
  onOpenAvailability,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  applicant: Applicant;
  scheduleDay: string;
  onOpenAvailability: () => void;
  dragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}) {
  const didDragRef = useRef(false);
  const label = `${applicant.firstName} ${applicant.lastName}`.trim();
  const count = availabilityForScheduleDay(applicant, scheduleDay).length;
  const slotHint =
    count === 0
      ? "No availability this day"
      : `${count} block${count === 1 ? "" : "s"}`;

  return (
    <div
      draggable
      onDragStart={(e) => {
        didDragRef.current = true;
        onDragStart(e);
      }}
      onDragEnd={() => {
        onDragEnd();
        window.setTimeout(() => {
          didDragRef.current = false;
        }, 0);
      }}
      onClick={() => {
        if (didDragRef.current) return;
        onOpenAvailability();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenAvailability();
        }
      }}
      role="button"
      tabIndex={0}
      title={`${label} · ${applicant.email}. Click name for times; drag into a room.`}
      className={`inline-flex max-w-[220px] cursor-grab active:cursor-grabbing items-center gap-2 rounded-full border bg-white px-3 py-2 shadow-sm transition-all select-none ${
        dragging
          ? "border-[#061c2a] opacity-50 ring-2 ring-[#061c2a]/20"
          : "border-[#e4e4e7] hover:border-[#061c2a]/40 hover:shadow"
      }`}
    >
      <span
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#061c2a] text-[11px] font-semibold text-white"
        aria-hidden="true"
      >
        {applicant.firstName.charAt(0)}
        {applicant.lastName.charAt(0)}
      </span>
      <span className="min-w-0 flex flex-col leading-tight">
        <span className="truncate text-sm font-medium text-[#111827]">{label}</span>
        <span className="truncate text-[10px] text-[#6b7280]">{slotHint}</span>
      </span>
    </div>
  );
}

function ScheduleEmailSentBadge({ title }: { title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex flex-shrink-0 items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-800 cursor-help"
    >
      Sent
    </span>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RoomHostFields({
  slotKey,
  values,
  officerSlotCount,
  onSaved,
}: {
  slotKey: string;
  values: string[];
  officerSlotCount: number;
  onSaved: (names: string[]) => void;
}) {
  const [local, setLocal] = useState(() => normalizeOfficerSlots(values, officerSlotCount));
  useEffect(() => setLocal(normalizeOfficerSlots(values, officerSlotCount)), [values, officerSlotCount]);

  const persist = () => {
    const next = normalizeOfficerSlots(local, officerSlotCount);
    if (officerSlotsEqual(next, values, officerSlotCount)) return;
    void (async () => {
      const res = await saveRoomHosts(slotKey, next, officerSlotCount);
      if (!res.error) onSaved(next);
    })();
  };

  return (
    <div className="flex flex-col gap-1.5">
      {local.map((name, index) => (
        <input
          key={index}
          type="text"
          value={name}
          onChange={(e) => {
            const next = [...local];
            next[index] = e.target.value;
            setLocal(normalizeOfficerSlots(next, officerSlotCount));
          }}
          onBlur={persist}
          placeholder={`Officer ${index + 1}`}
          className="h-8 w-full border border-[#e4e4e7] rounded-md px-2.5 text-xs text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-1 focus:ring-[#061c2a]/20"
        />
      ))}
    </div>
  );
}

export function InterviewScheduleBoard({ config }: { config: InterviewScheduleRoundConfig }) {
  const {
    round,
    title,
    subtitle,
    scheduleDay,
    slots: daySlots,
    hoursLabel,
    applicantsPerRoom,
    hostingOfficersPerRoom,
    pipeline,
    enableAutoSort,
  } = config;

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [roomHosts, setRoomHosts] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [autoSortMessage, setAutoSortMessage] = useState("");
  const [autoSorting, setAutoSorting] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [draggingApplicantId, setDraggingApplicantId] = useState<string | null>(null);
  const [dropTargetRoom, setDropTargetRoom] = useState<InterviewRoom | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalScope, setEmailModalScope] = useState<EmailCampaignScope>("time-block");
  const [emailModalRoom, setEmailModalRoom] = useState<InterviewRoom | null>(null);
  const [scheduleEmailSends, setScheduleEmailSends] = useState<ScheduleEmailSendRecord[]>([]);
  const [availabilityModalApplicant, setAvailabilityModalApplicant] = useState<Applicant | null>(
    null,
  );

  const slotOptions = useMemo(
    () =>
      daySlots.map((time) => ({
        id: buildSlotId(scheduleDay, time),
        label: time,
      })),
    [daySlots, scheduleDay],
  );

  const emailCampaign = campaignFromRound(round);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    const [result, hosts, sendLog] = await Promise.all([
      fetchPipelineApplicants(pipeline, {
        search: debouncedSearch,
        limit: 500,
        offset: 0,
      }),
      fetchRoomHosts(),
      fetchScheduleEmailSendsClient(emailCampaign),
    ]);
    if (result.error) {
      setLoadError(result.error);
      setApplicants([]);
    } else {
      setApplicants((result.data ?? []).map((row) => rowToInterviewSchedule(row, round)));
    }
    if (hosts.data) setRoomHosts(hosts.data);
    if (!sendLog.error) setScheduleEmailSends(sendLog.records);
    setLoading(false);
  }, [debouncedSearch, emailCampaign, pipeline, round]);

  useEffect(() => {
    void load();
  }, [load]);

  const unscheduled = useMemo(
    () => applicants.filter((a) => !isAssignedOnScheduleDay(a.assignedSlot, scheduleDay)),
    [applicants, scheduleDay],
  );

  const activeSlot = activeSlotId ? getGroupInterviewSlot(activeSlotId) : undefined;

  function occupantsInRoom(slotId: string, room: InterviewRoom): Applicant[] {
    const slot = getGroupInterviewSlot(slotId);
    if (!slot) return [];
    const assignmentId = buildAssignmentId(slot.date, slot.time, room);
    return applicants.filter((a) => a.assignedSlot === assignmentId);
  }

  async function assignToRoom(applicantId: string, slotId: string, room: InterviewRoom) {
    const slot = getGroupInterviewSlot(slotId);
    if (!slot) return;
    const applicant = applicants.find((a) => a.id === applicantId);
    if (!applicant) return;
    if (!applicant.availableSlots.includes(slotId)) {
      setSaveError(`${applicant.firstName} is not available for that time block.`);
      return;
    }
    const assignmentId = buildAssignmentId(slot.date, slot.time, room);
    const inRoom = occupantsInRoom(slotId, room);
    if (inRoom.length >= applicantsPerRoom) {
      setSaveError(`${room} is full (${applicantsPerRoom} interviewees max).`);
      return;
    }
    if (applicant.assignedSlot === assignmentId) return;

    setSaveError("");
    const previous = applicants;
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicantId
          ? { ...a, assignedSlot: assignmentId, status: "scheduled" as const }
          : a,
      ),
    );

    const result = await patchApplicant(
      applicantId,
      interviewScheduleToPatch(round, { assignedSlot: assignmentId, status: "scheduled" }),
    );
    if (result.error || !result.data) {
      setApplicants(previous);
      setSaveError(result.error ?? "Failed to save assignment.");
      return;
    }
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicantId ? rowToInterviewSchedule(result.data!, round) : a,
      ),
    );
  }

  async function clearAssignment(applicantId: string) {
    setSaveError("");
    const previous = applicants;
    setApplicants((prev) =>
      prev.map((a) =>
        a.id === applicantId ? { ...a, assignedSlot: null, status: "pending" as const } : a,
      ),
    );
    const result = await patchApplicant(
      applicantId,
      interviewScheduleToPatch(round, { assignedSlot: null, status: "pending" }),
    );
    if (result.error || !result.data) {
      setApplicants(previous);
      setSaveError(result.error ?? "Failed to clear assignment.");
    } else {
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicantId ? rowToInterviewSchedule(result.data!, round) : a,
        ),
      );
    }
  }

  async function sortIntoRooms() {
    if (!enableAutoSort || autoSorting) return;
    setSaveError("");
    setAutoSortMessage("");
    const { assignments, unplacedIds } = computeAutoRoomAssignments(
      applicants,
      scheduleDay,
      daySlots,
      applicantsPerRoom,
    );
    if (assignments.length === 0) {
      setAutoSortMessage(
        unplacedIds.length > 0
          ? "No open room slots matched anyone’s availability. Assign manually or pick another time block."
          : "Everyone who can be placed already has a room on this day.",
      );
      return;
    }
    if (
      !window.confirm(
        `Assign ${assignments.length} applicant${assignments.length === 1 ? "" : "s"} into rooms based on their availability for ${scheduleDay}?`,
      )
    ) {
      return;
    }
    setAutoSorting(true);
    const previous = applicants;
    const byId = new Map(assignments.map((a) => [a.applicantId, a.assignmentId]));
    setApplicants((prev) =>
      prev.map((a) => {
        const assignmentId = byId.get(a.id);
        if (!assignmentId) return a;
        return { ...a, assignedSlot: assignmentId, status: "scheduled" as const };
      }),
    );
    let failed = 0;
    for (const { applicantId, assignmentId } of assignments) {
      const result = await patchApplicant(
        applicantId,
        interviewScheduleToPatch(round, { assignedSlot: assignmentId, status: "scheduled" }),
      );
      if (result.error || !result.data) failed += 1;
    }
    if (failed > 0) {
      setApplicants(previous);
      setSaveError(`Auto-sort failed for ${failed} applicant${failed === 1 ? "" : "s"}. Try again or assign manually.`);
    } else {
      const extra =
        unplacedIds.length > 0
          ? ` ${unplacedIds.length} could not be placed (no matching open slot).`
          : "";
      setAutoSortMessage(`Placed ${assignments.length} into rooms.${extra}`);
      await load();
    }
    setAutoSorting(false);
  }

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 border-b border-[#e4e4e7]">
        <h1 className="text-xl sm:text-2xl font-bold text-[#061c2a]">{title}</h1>
        <p className="text-sm text-[#6b7280] mt-1">{subtitle}</p>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden flex-col lg:flex-row">
        <aside className="w-full lg:w-[300px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#e4e4e7] bg-[#fafafa] overflow-y-auto px-4 py-4 lg:py-5 max-h-[min(42vh,320px)] lg:max-h-none">
          <h2 className="text-sm font-semibold text-[#111827] mb-1">
            Round {round} · {scheduleDay}
          </h2>
          <p className="text-xs text-[#6b7280] mb-4">{hoursLabel}</p>
          <div className="flex flex-col gap-2">
            {daySlots.map((time) => {
              const slotId = buildSlotId(scheduleDay, time);
              const assigned = applicants.filter((a) => {
                const p = parseAssignmentId(a.assignedSlot);
                return p?.slotId === slotId;
              }).length;
              const selected = activeSlotId === slotId;
              const showLunchAfter = time === "11:00AM - 12:00PM";
              return (
                <div key={slotId} className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSlotId(selected ? null : slotId)}
                    className={`text-left rounded-lg border px-3 py-2.5 transition-all ${
                      selected
                        ? "border-[#061c2a] bg-[#061c2a]/5"
                        : "border-[#e4e4e7] bg-white hover:border-[#a1a1aa]"
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#111827]">{time}</p>
                    <p className="text-xs text-[#6b7280] mt-0.5">
                      {assigned} interviewee{assigned === 1 ? "" : "s"} scheduled
                    </p>
                  </button>
                  {showLunchAfter && (
                    <div className="rounded-lg border border-dashed border-[#d4d4d8] bg-[#f4f4f5] px-3 py-2.5 text-xs text-[#6b7280]">
                      {LUNCH_BREAK_LABEL}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center gap-2 sm:gap-3 border-b border-[#f4f4f5]">
            <div className="relative flex-1 min-w-[140px] max-w-full sm:max-w-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search applicants…"
                className="h-9 w-full border border-[#d4d4d8] rounded-lg pl-3 pr-9 text-sm outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10"
              />
              <SearchIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a1a1aa]" />
            </div>
            {enableAutoSort && (
              <button
                type="button"
                disabled={loading || autoSorting || !!loadError}
                onClick={() => void sortIntoRooms()}
                className="h-9 flex-shrink-0 rounded-lg bg-[#061c2a] px-4 text-sm font-medium text-white hover:bg-[#0a2840] disabled:opacity-50"
              >
                {autoSorting ? "Sorting…" : "Sort into rooms"}
              </button>
            )}
            <button
              type="button"
              disabled={loading || !!loadError}
              onClick={() => {
                setEmailModalScope(activeSlotId ? "time-block" : "all-assigned");
                setEmailModalRoom(null);
                setEmailModalOpen(true);
              }}
              className="h-9 flex-shrink-0 rounded-lg border border-[#061c2a] px-4 text-sm font-medium text-[#061c2a] hover:bg-[#061c2a]/5 disabled:opacity-50"
            >
              Send email
            </button>
            {draggingApplicantId && activeSlotId && (
              <span className="text-xs text-[#061c2a] font-medium bg-[#061c2a]/10 px-3 py-1.5 rounded-full">
                Drop into a room (max {applicantsPerRoom} per room)
              </span>
            )}
          </div>

          {saveError && (
            <div className="mx-6 mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {saveError}
            </div>
          )}
          {autoSortMessage && !saveError && (
            <div className="mx-6 mt-3 rounded-lg border border-[#e4e4e7] bg-[#f0fdf4] px-4 py-2 text-sm text-[#166534]">
              {autoSortMessage}
            </div>
          )}

          {!loading && !loadError && (
            <section className="flex-shrink-0 border-b border-[#e4e4e7] bg-[#fafafa] px-4 sm:px-6 py-4">
              <h2 className="text-sm font-semibold text-[#111827] mb-1">
                Not scheduled yet
                <span className="ml-2 text-sm font-normal text-[#6b7280]">({unscheduled.length})</span>
              </h2>
              <p className="text-xs text-[#6b7280] mb-3">
                Click a bubble for available times. Drag into a room to schedule.
              </p>
              {unscheduled.length === 0 ? (
                <p className="text-sm text-[#a1a1aa] italic">Everyone here has a room assignment.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5 max-h-[140px] overflow-y-auto pr-1">
                  {unscheduled.map((a) => (
                    <UnscheduledBubble
                      key={a.id}
                      applicant={a}
                      scheduleDay={scheduleDay}
                      onOpenAvailability={() => setAvailabilityModalApplicant(a)}
                      dragging={draggingApplicantId === a.id}
                      onDragStart={(e) => {
                        e.dataTransfer.setData(APPLICANT_DRAG_TYPE, a.id);
                        e.dataTransfer.setData("text/plain", a.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingApplicantId(a.id);
                        setSaveError("");
                        setAvailabilityModalApplicant(null);
                      }}
                      onDragEnd={() => {
                        setDraggingApplicantId(null);
                        setDropTargetRoom(null);
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-6 sm:gap-8 min-h-0">
            {loading ? (
              <p className="text-sm text-[#6b7280]">Loading…</p>
            ) : loadError ? (
              <p className="text-sm text-red-600">{loadError}</p>
            ) : (
              <>
                {activeSlot && activeSlotId ? (
                  <section>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <h2 className="text-base font-semibold text-[#111827]">
                        {activeSlot.date} · {activeSlot.time}
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailModalScope("time-block");
                          setEmailModalRoom(null);
                          setEmailModalOpen(true);
                        }}
                        className="text-xs font-medium text-[#061c2a] underline hover:text-[#0d2f47]"
                      >
                        Email everyone in this time block
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {INTERVIEW_ROOMS.map((room) => {
                        const assignmentId = buildAssignmentId(
                          activeSlot.date,
                          activeSlot.time,
                          room,
                        );
                        const occupants = occupantsInRoom(activeSlotId, room);
                        const full = occupants.length >= applicantsPerRoom;
                        const isDropTarget = dropTargetRoom === room && !full;
                        return (
                          <div
                            key={room}
                            onDragOver={(e) => {
                              if (full || !isApplicantDragEvent(e)) return;
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                              setDropTargetRoom(room);
                            }}
                            onDragLeave={(e) => {
                              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                              setDropTargetRoom((prev) => (prev === room ? null : prev));
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDropTargetRoom(null);
                              const id = applicantIdFromDragEvent(e);
                              setDraggingApplicantId(null);
                              if (id && activeSlotId) void assignToRoom(id, activeSlotId, room);
                            }}
                            className={`rounded-xl border bg-white p-4 flex flex-col gap-3 min-h-[180px] transition-colors ${
                              isDropTarget
                                ? "border-[#061c2a] bg-[#061c2a]/5 ring-2 ring-[#061c2a]/15"
                                : full
                                  ? "border-[#e4e4e7] opacity-95"
                                  : dropTargetRoom !== null || draggingApplicantId
                                    ? "border-dashed border-[#a1a1aa]"
                                    : "border-[#e4e4e7]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-[#374151]">
                                {interviewRoomDisplayName(room)}
                              </p>
                              <div className="flex items-center gap-2">
                                {occupants.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEmailModalScope("room");
                                      setEmailModalRoom(room);
                                      setEmailModalOpen(true);
                                    }}
                                    className="text-[10px] font-medium text-[#061c2a] hover:underline"
                                  >
                                    Email room
                                  </button>
                                )}
                                <span className="text-[11px] text-[#6b7280] tabular-nums">
                                  {occupants.length}/{applicantsPerRoom}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[11px] font-medium text-[#6b7280] uppercase tracking-wide">
                                Hosting officers ({hostingOfficersPerRoom} slots)
                              </label>
                              <RoomHostFields
                                slotKey={assignmentId}
                                officerSlotCount={hostingOfficersPerRoom}
                                values={
                                  roomHosts[assignmentId] ??
                                  normalizeOfficerSlots([], hostingOfficersPerRoom)
                                }
                                onSaved={(names) =>
                                  setRoomHosts((prev) => {
                                    const next = { ...prev };
                                    if (names.some((n) => n.length > 0)) next[assignmentId] = names;
                                    else delete next[assignmentId];
                                    return next;
                                  })
                                }
                              />
                            </div>
                            <ul className="flex flex-col gap-2 flex-1">
                              {occupants.map((o) => (
                                <li
                                  key={o.id}
                                  className="flex items-start justify-between gap-2 rounded-lg bg-[#f9fafb] px-2.5 py-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <p className="text-sm font-medium text-[#111827] truncate">
                                        {o.firstName} {o.lastName}
                                      </p>
                                      {(() => {
                                        const sent = sendForCurrentAssignment(
                                          o.id,
                                          o.assignedSlot,
                                          scheduleEmailSends,
                                        );
                                        return sent ? (
                                          <ScheduleEmailSentBadge title={formatSendLabel(sent)} />
                                        ) : null;
                                      })()}
                                    </div>
                                    <p className="text-[11px] text-[#6b7280] truncate">{o.email}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => void clearAssignment(o.id)}
                                    className="text-[11px] text-[#6b7280] hover:text-red-600 flex-shrink-0"
                                  >
                                    Remove
                                  </button>
                                </li>
                              ))}
                            </ul>
                            {!full && (
                              <p className="text-center text-[11px] text-[#a1a1aa] py-1">
                                {draggingApplicantId ? "Release to assign here" : "Drop an applicant bubble here"}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : (
                  <p className="text-sm text-[#6b7280]">
                    Select a time block on the left ({hoursLabel}, lunch excluded).
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {availabilityModalApplicant ? (
        <ApplicantAvailabilityModal
          applicant={availabilityModalApplicant}
          scheduleDay={scheduleDay}
          activeSlotId={activeSlotId}
          onClose={() => setAvailabilityModalApplicant(null)}
          onSelectSlot={(slotId) => setActiveSlotId(slotId)}
        />
      ) : null}

      <BatchEmailCampaignModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        campaign={campaignFromRound(round)}
        scheduleDay={scheduleDay}
        defaultSlotId={activeSlotId}
        defaultRoom={emailModalRoom}
        slotOptions={slotOptions}
        initialScope={emailModalScope}
        emailSends={scheduleEmailSends}
        onSent={() => void load()}
      />
    </main>
  );
}
