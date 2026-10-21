const sk = "skeleton-shimmer";

export default function ChatbotIndexLoading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 text-slate-100"
      data-route-loading-ready="true"
    >
      <header className="h-14 flex-shrink-0 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-sm flex items-center px-4">
        <div className={`h-5 w-16 rounded ${sk}`} />
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-2xl mx-auto">
          <div className={`h-4 w-72 max-w-full rounded ${sk} mb-6`} />

          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-slate-800/80"
              >
                <div className={`w-9 h-9 rounded-lg ${sk} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className={`h-4 w-3/5 rounded ${sk} mb-2`} />
                  <div className={`h-3 w-24 rounded ${sk}`} />
                </div>
                <div className={`w-4 h-4 rounded ${sk} shrink-0`} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
