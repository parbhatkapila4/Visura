export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className="h-4 w-16 bg-[#1a1a1a] rounded animate-pulse" />
              <span className="text-[#333]">/</span>
              <div className="h-4 w-20 bg-[#1a1a1a] rounded animate-pulse" />
            </div>

            <div className="hidden md:block">
              <div className="h-9 w-60 bg-[#111] border border-[#1f1f1f] rounded-lg animate-pulse" />
            </div>

            <div className="h-9 w-20 bg-[#1a1a1a] rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8">
          <div className="h-7 w-48 bg-[#1a1a1a] rounded mb-2 animate-pulse" />
          <div className="h-4 w-64 bg-[#1a1a1a] rounded animate-pulse" />
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-lg bg-[#1a1a1a] border border-[#252525]" />
                  <div className="h-4 w-12 bg-[#1a1a1a] rounded" />
                </div>
                <div className="h-3 w-24 bg-[#1a1a1a] rounded mb-1" />
                <div className="h-8 w-16 bg-[#1a1a1a] rounded mb-4" />
                <div className="h-1.5 w-full bg-[#1a1a1a] rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="h-9 w-48 bg-[#111] border border-[#1f1f1f] rounded-lg animate-pulse" />
          <div className="h-9 w-20 bg-[#111] border border-[#1f1f1f] rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5 space-y-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#252525]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-[#1a1a1a] rounded" />
                  <div className="flex gap-2">
                    <div className="h-3 w-16 bg-[#1a1a1a] rounded-full" />
                    <div className="h-3 w-20 bg-[#1a1a1a] rounded-full" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-3 w-full bg-[#1a1a1a] rounded" />
                <div className="h-3 w-5/6 bg-[#1a1a1a] rounded" />
                <div className="h-3 w-4/6 bg-[#1a1a1a] rounded" />
              </div>

              <div className="pt-3 border-t border-[#1f1f1f] flex justify-between items-center">
                <div className="h-6 w-20 bg-[#1a1a1a] rounded-full" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-[#1a1a1a] rounded-lg" />
                  <div className="h-8 w-16 bg-[#1a1a1a] rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </main>
  );
}
