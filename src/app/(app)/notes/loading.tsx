export default function NotesLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="h-8 w-32 bg-[#0D1F35] rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-[#0D1F35] rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
