export default function ResultsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-14 bg-white border-b border-gray-200" />
      <div className="max-w-3xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-7 w-36 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-44 bg-gray-100 rounded mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
