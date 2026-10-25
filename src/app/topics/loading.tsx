export default function TopicsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-14 bg-white border-b border-gray-200" />
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
        <div className="flex justify-between mb-8">
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded-lg mb-2" />
            <div className="h-4 w-52 bg-gray-100 rounded" />
          </div>
          <div className="h-9 w-28 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
