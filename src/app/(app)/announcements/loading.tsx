export default function AnnouncementsLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-[#0D1F35] rounded-lg" />
        <div className="h-9 w-40 bg-[#0D1F35] rounded-lg" />
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0D1F35] rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#1e1e28] rounded-full shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="h-4 w-40 bg-[#1e1e28] rounded" />
                <div className="h-3 w-24 bg-[#1e1e28] rounded" />
              </div>
              <div className="h-5 w-20 bg-[#1e1e28] rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-[#1e1e28] rounded w-full" />
              <div className="h-3 bg-[#1e1e28] rounded w-5/6" />
              <div className="h-3 bg-[#1e1e28] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
