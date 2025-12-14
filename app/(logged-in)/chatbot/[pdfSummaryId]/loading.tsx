export default function ChatbotLoading() {
  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-800 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="h-7 w-24 bg-orange-600/30 rounded-lg animate-pulse" />
          <div className="h-8 w-64 bg-gray-800 rounded-lg animate-pulse" />
          <div className="w-24" />
        </div>
      </div>

      <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-[1600px] mx-auto h-full flex gap-6">
          <div className="w-80 hidden lg:block">
            <div className="h-full bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-3 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-gray-800 rounded" />
                <div className="h-9 w-9 bg-orange-600/30 rounded-xl" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-gray-800/50 rounded-xl space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-700/60 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <div className="h-full bg-gray-900 border border-gray-800 rounded-3xl flex flex-col animate-pulse">
              <div className="p-5 border-b border-gray-800">
                <div className="h-6 w-40 bg-gray-800 rounded" />
              </div>

              <div className="flex-1 p-6 space-y-5">
                <div className="flex gap-3">
                  <div className="w-9 h-9 bg-gray-800 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-800/60 rounded w-5/6" />
                    <div className="h-4 bg-gray-800/60 rounded w-4/6" />
                    <div className="h-4 bg-gray-800/60 rounded w-3/6" />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <div className="w-2/3 space-y-2">
                    <div className="h-4 bg-orange-800/30 rounded w-full ml-auto" />
                    <div className="h-4 bg-orange-800/30 rounded w-3/4 ml-auto" />
                  </div>
                  <div className="w-9 h-9 bg-orange-600/30 rounded-xl" />
                </div>
              </div>

              <div className="p-5 border-t border-gray-800">
                <div className="flex gap-3">
                  <div className="flex-1 h-12 bg-gray-800/60 rounded-xl" />
                  <div className="h-12 w-12 bg-orange-600/30 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
