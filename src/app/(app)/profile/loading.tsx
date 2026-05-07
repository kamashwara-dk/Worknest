export default function ProfileLoading() {
  return (
    <div className="animate-pulse space-y-6 p-6 max-w-3xl mx-auto">
      <div className="h-8 w-32 bg-[#0D1F35] rounded-lg" />
      <div className="bg-[#0D1F35] rounded-xl p-6 flex items-center gap-6">
        <div className="h-24 w-24 bg-[#1e1e28] rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-6 w-48 bg-[#1e1e28] rounded" />
          <div className="h-4 w-32 bg-[#1e1e28] rounded" />
          <div className="h-4 w-40 bg-[#1e1e28] rounded" />
        </div>
        <div className="h-9 w-28 bg-[#1e1e28] rounded-lg" />
      </div>
      <div className="bg-[#0D1F35] rounded-xl p-6 space-y-5">
        <div className="h-5 w-36 bg-[#1e1e28] rounded" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-24 bg-[#1e1e28] rounded" />
            <div className="h-10 bg-[#1e1e28] rounded-lg" />
          </div>
        ))}
        <div className="h-10 w-28 bg-[#1e1e28] rounded-lg" />
      </div>
    </div>
  );
}
