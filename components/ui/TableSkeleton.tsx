export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="border border-[#e4e4e7] rounded-xl overflow-hidden animate-pulse">
      <div className="bg-[#f9fafb] border-b border-[#e4e4e7] h-11" />
      <div className="divide-y divide-[#f4f4f5]">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-full bg-[#f4f4f5] flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-40 bg-[#f4f4f5] rounded" />
              <div className="h-3 w-56 bg-[#f4f4f5] rounded" />
            </div>
            <div className="h-4 w-16 bg-[#f4f4f5] rounded hidden sm:block" />
            <div className="h-6 w-20 bg-[#f4f4f5] rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
