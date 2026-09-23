"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPipelineApplicants,
  patchApplicant,
  rowToBbqAttendee,
} from "@/lib/applicants/stages";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { BatchEmailCampaignModal } from "@/components/email/BatchEmailCampaignModal";
import {
  fetchScheduleEmailSendsClient,
  type ScheduleEmailSendRecord,
} from "@/lib/email/schedule-email-sends";

type Attendee = ReturnType<typeof rowToBbqAttendee>;

export default function BbqSocialPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [scheduleEmailSends, setScheduleEmailSends] = useState<ScheduleEmailSendRecord[]>([]);
  const debouncedSearch = useDebouncedValue(search);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await fetchPipelineApplicants("bbq-social", { search: debouncedSearch, limit: 100 });
    if (result.error) {
      setError(result.error);
      setAttendees([]);
    } else {
      setAttendees((result.data ?? []).map(rowToBbqAttendee));
    }
    const sends = await fetchScheduleEmailSendsClient("bbq");
    if (!sends.error) setScheduleEmailSends(sends.records);
    setLoading(false);
  }, [debouncedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    if (!confirm("Remove this applicant from the BBQ Social?")) return;
    const previous = attendees;
    setAttendees((prev) => prev.filter((a) => a.id !== id));
    const res = await patchApplicant(id, { social_status: "pending" });
    if (res.error) {
      setAttendees(previous);
      setError(res.error);
    }
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-8 py-8 flex flex-col gap-6 max-w-4xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-[#6b7280] font-medium">Fall 2026 Recruitment</p>
            <h1 className="text-2xl font-bold text-[#061c2a] mt-0.5">BBQ Social</h1>
            <p className="text-sm text-[#6b7280] mt-1">
              Everyone accepted to the BBQ social night — a no-technicals event. Accept applicants from Round 2.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={loading || attendees.length === 0}
              onClick={() => setEmailModalOpen(true)}
              className="h-10 px-4 rounded-lg bg-[#061c2a] text-white text-sm font-medium hover:bg-[#0d2f47] disabled:opacity-50"
            >
              Send email
            </button>
            <div className="rounded-lg border border-[#e4e4e7] px-5 py-2 text-center">
              <p className="text-2xl font-bold text-[#061c2a]">{attendees.length}</p>
              <p className="text-[11px] uppercase tracking-wide text-[#a1a1aa]">Invited</p>
            </div>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search attendees…"
          className="h-9 w-64 border border-[#d4d4d8] rounded-lg px-4 text-sm text-[#111827] placeholder-[#a1a1aa] outline-none focus:border-[#061c2a] focus:ring-2 focus:ring-[#061c2a]/10 transition"
        />

        {loading ? (
          <TableSkeleton />
        ) : attendees.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d4d4d8] py-16 text-center text-sm text-[#a1a1aa]">
            No one has been accepted to the BBQ social yet. Accept applicants from Round 2.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {attendees.map((a) => (
              <div key={a.id} className="group rounded-xl border border-[#e4e4e7] bg-white p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#061c2a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {a.firstName[0]}{a.lastName[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111827] truncate">{a.firstName} {a.lastName}</p>
                  <p className="text-xs text-[#6b7280] truncate">{a.major}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void remove(a.id)}
                  className="opacity-0 group-hover:opacity-100 text-xs text-[#a1a1aa] hover:text-red-600 transition-all flex-shrink-0"
                  title="Remove from BBQ"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BatchEmailCampaignModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        campaign="bbq"
        emailSends={scheduleEmailSends}
        onSent={() => void load()}
      />
    </main>
  );
}
