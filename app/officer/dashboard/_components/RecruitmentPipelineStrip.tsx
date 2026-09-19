const STEPS = [
  { key: "applications", label: "Applications", href: "/officer/dashboard/applications" },
  { key: "coffee-chats", label: "Coffee chats", href: "/officer/dashboard/coffee-chats" },
  { key: "schedule-r1", label: "Schedule R1", href: "/officer/dashboard/interview-schedule" },
  { key: "round-1", label: "Round 1", href: "/officer/dashboard/round-1" },
  { key: "schedule-r2", label: "Schedule R2", href: "/officer/dashboard/interview-schedule" },
  { key: "round-2", label: "Round 2", href: "/officer/dashboard/round-2" },
  { key: "bbq", label: "BBQ Social", href: "/officer/dashboard/bbq-social" },
] as const;

export type PipelineStepKey = (typeof STEPS)[number]["key"];

export function RecruitmentPipelineStrip({ current }: { current: PipelineStepKey }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <nav
      aria-label="Recruitment pipeline"
      className="rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-4 py-3 overflow-x-auto"
    >
      <ol className="flex items-center gap-1 min-w-max text-xs">
        {STEPS.map((step, index) => {
          const isCurrent = step.key === current;
          const isPast = currentIndex >= 0 && index < currentIndex;
          return (
            <li key={step.key} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-[#d4d4d8] px-0.5" aria-hidden="true">
                  →
                </span>
              )}
              <a
                href={step.href}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                  isCurrent
                    ? "bg-[#061c2a] text-white"
                    : isPast
                      ? "text-[#061c2a] hover:bg-[#061c2a]/10"
                      : "text-[#6b7280] hover:text-[#374151] hover:bg-white"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {step.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
