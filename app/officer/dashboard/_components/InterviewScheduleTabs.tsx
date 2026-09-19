"use client";

import { useState } from "react";
import {
  ROUND_1_INTERVIEW_SCHEDULE,
  ROUND_2_INTERVIEW_SCHEDULE,
} from "@/lib/interview-schedule/schedule-config";
import { RecruitmentPipelineStrip } from "./RecruitmentPipelineStrip";
import { InterviewScheduleBoard } from "./InterviewScheduleBoard";

type TabKey = "round-1" | "round-2";

export function InterviewScheduleTabs() {
  const [tab, setTab] = useState<TabKey>("round-1");

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="px-8 pt-6 pb-3">
        <RecruitmentPipelineStrip current={tab === "round-1" ? "schedule-r1" : "schedule-r2"} />
      </div>
      <div className="px-8 pb-0 flex gap-2 border-b border-[#e4e4e7] bg-white">
        <button
          type="button"
          onClick={() => setTab("round-1")}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border border-b-0 transition-colors ${
            tab === "round-1"
              ? "border-[#e4e4e7] bg-[#fafafa] text-[#061c2a]"
              : "border-transparent text-[#6b7280] hover:text-[#111827]"
          }`}
        >
          Round 1 · Oct 3
        </button>
        <button
          type="button"
          onClick={() => setTab("round-2")}
          className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg border border-b-0 transition-colors ${
            tab === "round-2"
              ? "border-[#e4e4e7] bg-[#fafafa] text-[#061c2a]"
              : "border-transparent text-[#6b7280] hover:text-[#111827]"
          }`}
        >
          Round 2 · Oct 4
        </button>
      </div>
      {tab === "round-1" ? (
        <InterviewScheduleBoard key="r1" config={ROUND_1_INTERVIEW_SCHEDULE} />
      ) : (
        <InterviewScheduleBoard key="r2" config={ROUND_2_INTERVIEW_SCHEDULE} />
      )}
    </div>
  );
}
