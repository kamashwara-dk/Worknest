export default function TeamLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-[#0D1F35] rounded-lg" />
        <div className="h-9 w-36 bg-[#0D1F35] rounded-lg" />
      </div>
      <div className="h-10 bg-[#0D1F35] rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#0D1F35] rounded-xl p-5 space-y-3 flex flex-col items-center text-center">
            <div className="h-16 w-16 bg-[#1e1e28] rounded-full" />
            <div className="h-4 w-28 bg-[#1e1e28] rounded" />
            <div className="h-3 w-20 bg-[#1e1e28] rounded" />
            <div className="h-5 w-16 bg-[#1e1e28] rounded-full" />
            <div className="flex gap-2">
              <div className="h-7 w-7 bg-[#1e1e28] rounded-lg" />
              <div className="h-7 w-7 bg-[#1e1e28] rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
