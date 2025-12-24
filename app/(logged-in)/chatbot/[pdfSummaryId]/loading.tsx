export default function ChatbotLoading() {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#0a0a0a]">
      <header className="h-14 flex-shrink-0 border-b border-[#1a1a1a] bg-[#0a0a0a]/80 backdrop-blur-xl z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="h-4 w-16 bg-[#1a1a1a] rounded animate-pulse" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-40 bg-[#1a1a1a] rounded-lg animate-pulse" />
            <div className="h-6 w-20 bg-emerald-500/10 rounded-full animate-pulse" />
          </div>
          <div className="w-16" />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 flex-shrink-0 border-r border-[#1a1a1a] bg-[#0c0c0c]">
          <div className="p-4 flex items-center justify-between">
            <div className="h-4 w-24 bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-8 w-16 bg-[#1a1a1a] rounded-lg animate-pulse" />
          </div>
          <div className="px-2 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-3 py-3 rounded-lg bg-white/[0.02] animate-pulse">
                <div className="h-4 w-4/5 bg-[#1a1a1a] rounded mb-2" />
                <div className="h-3 w-1/3 bg-[#1a1a1a] rounded" />
              </div>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 w-72 p-3 border-t border-[#1a1a1a]">
            <div className="px-3 py-3 rounded-lg bg-white/[0.02]">
              <div className="h-2 w-16 bg-[#1a1a1a] rounded mb-2 animate-pulse" />
              <div className="h-3 w-3/4 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mx-auto mb-6 animate-pulse" />

              <div className="h-10 w-80 bg-[#1a1a1a] rounded-lg mx-auto mb-3 animate-pulse" />
              <div className="h-6 w-64 bg-[#1a1a1a] rounded mx-auto mb-12 animate-pulse" />

              <div className="h-14 bg-[#111] border border-[#2a2a2a] rounded-xl mb-8 animate-pulse" />

              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.02] border border-[#1f1f1f] animate-pulse"
                  >
                    <div className="w-5 h-5 bg-[#1a1a1a] rounded mb-2" />
                    <div className="h-4 w-24 bg-[#1a1a1a] rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
