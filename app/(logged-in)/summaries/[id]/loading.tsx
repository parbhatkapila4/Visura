export default function SummaryLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className="h-4 w-12 bg-[#1a1a1a] rounded animate-pulse" />
              <span className="text-[#333]">/</span>
              <div className="h-4 w-40 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-[#1a1a1a] rounded-lg animate-pulse" />
              <div className="w-20 h-8 bg-[#1a1a1a] rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex gap-8 py-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-2 w-12 bg-[#1a1a1a] rounded mb-2" />
                      <div className="h-5 w-8 bg-[#1a1a1a] rounded" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                <div className="h-3 w-20 bg-[#1a1a1a] rounded mb-4 animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-8 bg-[#1a1a1a] rounded-lg animate-pulse"
                      style={{ width: `${70 + Math.random() * 30}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0 max-w-3xl">
            <div className="mb-8 pb-8 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2 mb-4 animate-pulse">
                <div className="h-4 w-4 bg-[#1a1a1a] rounded" />
                <div className="h-3 w-20 bg-[#1a1a1a] rounded" />
                <span className="text-[#333]">•</span>
                <div className="h-3 w-24 bg-[#1a1a1a] rounded" />
              </div>

              <div className="h-10 w-3/4 bg-[#1a1a1a] rounded-lg mb-4 animate-pulse" />
              <div className="h-6 w-1/2 bg-[#1a1a1a] rounded mb-6 animate-pulse" />

              <div className="space-y-2 animate-pulse">
                <div className="h-2 w-24 bg-[#1a1a1a] rounded" />
                <div className="flex gap-2">
                  <div className="h-7 w-32 bg-[#111] border border-[#1f1f1f] rounded-full" />
                  <div className="h-7 w-40 bg-[#111] border border-[#1f1f1f] rounded-full" />
                  <div className="h-7 w-28 bg-[#111] border border-[#1f1f1f] rounded-full" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {[1, 2, 3].map((section) => (
                <section key={section} className="animate-pulse">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#252525]" />
                    <div>
                      <div className="h-2 w-16 bg-[#1a1a1a] rounded mb-2" />
                      <div className="h-6 w-48 bg-[#1a1a1a] rounded" />
                    </div>
                  </div>

                  <div className="pl-11 space-y-3">
                    {[1, 2, 3, 4].map((point) => (
                      <div key={point} className="py-2 border-l-2 border-[#1f1f1f] pl-4">
                        <div
                          className="h-4 bg-[#1a1a1a] rounded"
                          style={{ width: `${60 + Math.random() * 40}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </main>

          <aside className="hidden xl:block w-48 flex-shrink-0">
            <div className="sticky top-20 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] animate-pulse"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] mb-3" />
                  <div className="h-4 w-16 bg-[#1a1a1a] rounded mb-1" />
                  <div className="h-3 w-20 bg-[#1a1a1a] rounded" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
