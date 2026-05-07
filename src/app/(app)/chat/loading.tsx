export default function ChatLoading() {
  return (
    <div className="animate-pulse flex h-full">
      <div className="w-64 border-r border-[#0D1F35] p-4 space-y-4 shrink-0">
        <div className="h-8 w-32 bg-[#0D1F35] rounded-lg" />
        <div className="h-9 bg-[#0D1F35] rounded-lg" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-4 w-4 bg-[#0D1F35] rounded" />
            <div className="h-4 bg-[#0D1F35] rounded flex-1" style={{ width: `${50 + i * 8}%` }} />
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col p-6 space-y-4">
        <div className="h-8 w-48 bg-[#0D1F35] rounded-lg" />
        <div className="flex-1 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex gap-3 ${i % 2 === 1 ? "flex-row-reverse" : ""}`}>
              <div className="h-8 w-8 bg-[#0D1F35] rounded-full shrink-0" />
              <div className="space-y-1 max-w-xs">
                <div className="h-3 w-20 bg-[#0D1F35] rounded" />
                <div className="h-10 bg-[#0D1F35] rounded-xl" style={{ width: `${120 + i * 20}px` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="h-12 bg-[#0D1F35] rounded-xl" />
      </div>
    </div>
  );
}
