export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-14 bg-white border-b border-gray-200" />
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
        <div className="text-center mb-8">
          <div className="h-8 w-44 bg-gray-200 rounded-lg mx-auto mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded mx-auto" />
        </div>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 border-b border-gray-50" />
          ))}
        </div>
      </div>
    </div>
  );
}
