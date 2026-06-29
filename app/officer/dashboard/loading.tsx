export default function OfficerDashboardLoading() {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="px-8 py-8 max-w-5xl flex flex-col gap-8 animate-pulse">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-40 bg-[#f4f4f5] rounded" />
          <div className="h-8 w-64 bg-[#f4f4f5] rounded" />
          <div className="h-4 w-96 bg-[#f4f4f5] rounded" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-32 bg-[#f4f4f5] rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-[#f4f4f5] rounded-xl" />
      </div>
    </main>
  );
}
