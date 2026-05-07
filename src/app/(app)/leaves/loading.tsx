export default function LeavesLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-8 w-40 bg-[#0D1F35] rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-[#0D1F35] rounded-xl p-5 space-y-3">
            <div className="h-4 w-24 bg-[#1e1e28] rounded" />
            <div className="h-10 w-16 bg-[#1e1e28] rounded-lg" />
            <div className="h-3 w-32 bg-[#1e1e28] rounded" />
          </div>
        ))}
      </div>
      <div className="bg-[#0D1F35] rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-[#1e1e28]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-[#1e1e28] rounded" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-[#1e1e28]">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="h-4 bg-[#1e1e28] rounded" style={{ width: j === 4 ? "60%" : "80%" }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
