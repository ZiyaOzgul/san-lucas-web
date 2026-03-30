export default function MenuLoading() {
  return (
    <div className="min-h-screen max-w-lg mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="bg-card px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="h-5 w-28 bg-border rounded-pill" />
        <div className="h-7 w-20 bg-border rounded-pill" />
      </div>

      {/* Hero skeleton */}
      <div className="px-4 pt-6 pb-2 space-y-2">
        <div className="h-6 w-48 bg-border rounded" />
        <div className="h-4 w-64 bg-border rounded" />
      </div>

      {/* Search skeleton */}
      <div className="px-4 mt-4">
        <div className="h-11 bg-border rounded-pill" />
      </div>

      {/* Pills skeleton */}
      <div className="flex gap-2 px-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-16 bg-border rounded-pill flex-shrink-0" />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="flex flex-col gap-3 px-4 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-card h-28 shadow-sm" />
        ))}
      </div>
    </div>
  );
}
