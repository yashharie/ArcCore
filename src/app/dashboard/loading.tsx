export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-14 bg-white border-b border-gray-200" />
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 w-56 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-40 bg-gray-100 rounded mb-10" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-gray-200 rounded-2xl" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
