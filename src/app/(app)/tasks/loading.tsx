export default function TasksLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-48 bg-[#0D1F35] rounded-lg" />
        <div className="h-9 w-32 bg-[#0D1F35] rounded-lg" />
        <div className="h-9 w-32 bg-[#0D1F35] rounded-lg" />
        <div className="ml-auto h-9 w-28 bg-[#0D1F35] rounded-lg" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex-1 min-w-0 space-y-3">
            <div className="h-8 bg-[#0D1F35] rounded-lg" />
            {[...Array(3)].map((_, j) => (
              <div key={j} className="bg-[#0D1F35] rounded-xl p-4 space-y-2">
                <div className="h-4 w-3/4 bg-[#1e1e28] rounded" />
                <div className="h-3 w-1/2 bg-[#1e1e28] rounded" />
                <div className="flex gap-2 pt-1">
                  <div className="h-5 w-16 bg-[#1e1e28] rounded-full" />
                  <div className="h-5 w-12 bg-[#1e1e28] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
