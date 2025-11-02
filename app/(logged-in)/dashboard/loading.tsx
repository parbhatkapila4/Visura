export default function DashboardLoading() {
  return (
    <main className="relative isolate min-h-screen bg-black overflow-hidden">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mx-auto w-full max-w-screen-xl">
          {/* Header Skeleton */}
          <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-5 w-64 bg-gray-800/60 rounded-lg animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse" />
            </div>

            {/* Cards Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-900/70 border border-gray-700/60 rounded-2xl p-4 sm:p-6 space-y-4 animate-pulse"
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-800 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-800 rounded w-3/4" />
                      <div className="flex gap-2">
                        <div className="h-4 w-16 bg-gray-800 rounded-full" />
                        <div className="h-4 w-20 bg-gray-800 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-800/60 rounded w-full" />
                    <div className="h-4 bg-gray-800/60 rounded w-5/6" />
                    <div className="h-4 bg-gray-800/60 rounded w-4/6" />
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-gray-800 flex justify-between">
                    <div className="h-8 w-24 bg-gray-800 rounded-full" />
                    <div className="flex gap-2">
                      <div className="h-8 w-16 bg-gray-800 rounded-full" />
                      <div className="h-8 w-16 bg-orange-800/30 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

