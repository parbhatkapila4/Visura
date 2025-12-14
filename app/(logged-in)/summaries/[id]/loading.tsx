export default function SummaryLoading() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <div className="container mx-auto flex flex-col gap-4">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
          <div className="flex flex-col">
            <div className="mb-8 space-y-4 animate-pulse">
              <div className="h-10 bg-gray-800 rounded-lg w-3/4" />
              <div className="flex gap-4">
                <div className="h-5 w-24 bg-gray-800/60 rounded" />
                <div className="h-5 w-32 bg-gray-800/60 rounded" />
              </div>
            </div>

            <div className="relative mt-8 space-y-6 animate-pulse">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-3">
                <div className="h-6 bg-gray-800 rounded w-1/3" />
                <div className="h-4 bg-gray-800/60 rounded w-full" />
                <div className="h-4 bg-gray-800/60 rounded w-5/6" />
                <div className="h-4 bg-gray-800/60 rounded w-4/6" />
              </div>

              <div className="space-y-3">
                <div className="h-6 bg-gray-800 rounded w-1/4" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
                    <div className="h-4 bg-gray-800/60 rounded flex-1" />
                  </div>
                ))}
              </div>

              {[1, 2, 3].map((section) => (
                <div key={section} className="space-y-3">
                  <div className="h-6 bg-gray-800 rounded w-2/5" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-800/60 rounded w-full" />
                    <div className="h-4 bg-gray-800/60 rounded w-11/12" />
                    <div className="h-4 bg-gray-800/60 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
