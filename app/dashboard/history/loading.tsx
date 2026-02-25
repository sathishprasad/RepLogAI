export default function HistoryLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 rounded-full" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
        <div className="h-11 w-28 bg-gray-100 rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 px-6 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100" />
              <div>
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-32 bg-gray-100 rounded mt-1.5" />
              </div>
            </div>
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
