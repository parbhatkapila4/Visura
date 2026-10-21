const sk = "skeleton-shimmer";
export default function WorkspacesLoading() {
  return (
    <div
      className="bg-[#030303] flex min-h-screen w-full overflow-hidden md:fixed md:inset-0 md:h-screen md:w-screen md:z-50"
      data-route-loading-ready="true"
    >
      <aside className="w-72 flex-shrink-0 border-r border-white/[0.06] bg-[#0a0a0a] overflow-hidden hidden md:block">
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className={`w-10 h-10 rounded-xl ${sk}`} />
            <div className={`h-5 w-28 rounded ${sk}`} />
          </div>

          <div className={`h-10 w-full rounded-lg ${sk} mb-4`} />

          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-12 w-full rounded-lg ${sk}`} />
            ))}
          </div>

          <div className="flex-1" />
          <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
            <div className={`size-8 rounded-full ${sk}`} />
            <div className={`h-4 w-24 rounded ${sk}`} />
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-16 border-b border-white/[0.06] flex items-center justify-between px-6">
          <div className={`h-5 w-40 rounded ${sk}`} />
          <div className="flex items-center gap-2">
            <div className={`h-9 w-24 rounded-lg ${sk}`} />
            <div className={`size-9 rounded-lg ${sk}`} />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg ${sk}`} />
                  <div className={`h-5 w-14 rounded-full ${sk}`} />
                </div>
                <div className={`h-4 w-2/3 rounded ${sk} mb-2`} />
                <div className={`h-3 w-full rounded ${sk} mb-1`} />
                <div className={`h-3 w-4/5 rounded ${sk} mb-4`} />
                <div className="flex items-center gap-2">
                  <div className={`size-6 rounded-full ${sk}`} />
                  <div className={`size-6 rounded-full ${sk}`} />
                  <div className={`h-3 w-16 rounded ${sk} ml-1`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
