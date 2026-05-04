export default function DocumentsLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-[#0D1F35] rounded-lg" />
        <div className="h-9 w-32 bg-[#0D1F35] rounded-lg" />
      </div>
      <div className="h-10 bg-[#0D1F35] rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#0D1F35] rounded-xl p-4 space-y-3">
            <div className="h-32 bg-[#1e1e28] rounded-lg" />
            <div className="h-4 w-3/4 bg-[#1e1e28] rounded" />
            <div className="h-3 w-1/2 bg-[#1e1e28] rounded" />
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-[#1e1e28] rounded-full" />
              <div className="h-3 w-20 bg-[#1e1e28] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
