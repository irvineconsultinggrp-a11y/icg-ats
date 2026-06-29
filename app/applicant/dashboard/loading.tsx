export default function ApplicantDashboardLoading() {
  return (
    <main className="flex-1 px-8 py-8 overflow-y-auto">
      <div className="max-w-[1104px] flex flex-col gap-6 animate-pulse">
        <div className="flex gap-3">
          <div className="h-12 w-24 bg-[#f4f4f5] rounded" />
          <div className="h-12 flex-1 bg-[#f4f4f5] rounded" />
        </div>
        <div className="h-7 w-48 bg-[#f4f4f5] rounded" />
        <div className="grid grid-cols-4 gap-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-64 bg-[#f4f4f5] rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
