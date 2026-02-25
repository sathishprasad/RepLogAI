export default function DashboardLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded-lg" />
          <div className="h-4 w-96 bg-gray-100 rounded-lg mt-2" />
        </div>
        <div className="h-12 w-40 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 h-28" />
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 h-[380px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-64" />
        <div className="bg-white rounded-2xl border border-gray-100 p-6 h-64" />
      </div>
    </div>
  );
}
