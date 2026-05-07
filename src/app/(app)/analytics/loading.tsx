export default function AnalyticsLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-36 bg-[#0D1F35] rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0D1F35] rounded-xl p-5 space-y-3">
            <div className="h-3 w-24 bg-[#1e1e28] rounded" />
            <div className="h-8 w-20 bg-[#1e1e28] rounded-lg" />
            <div className="h-3 w-16 bg-[#1e1e28] rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-[#0D1F35] rounded-xl p-5 space-y-4">
            <div className="h-5 w-36 bg-[#1e1e28] rounded" />
            <div className="h-48 bg-[#1e1e28] rounded-lg" />
            <div className="flex justify-between">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-3 w-8 bg-[#1e1e28] rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
