export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-28 bg-gray-200 rounded-full" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
        <div className="h-6 w-32 bg-gray-200 rounded-lg" />
        <div className="space-y-4">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
