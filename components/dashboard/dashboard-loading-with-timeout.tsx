"use client";

const sk = "skeleton-shimmer";

function DashboardLoadingSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0a]">
      <div className="flex shrink-0">
        <div className="w-16 min-h-screen bg-black border-r border-[#1f1f1f] flex flex-col items-center gap-2 p-4">
          <div className={`size-8 rounded-lg ${sk} mb-2`} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`size-10 rounded-lg ${sk}`} />
          ))}
          <div className="flex-1" />
          <div className={`size-10 rounded-lg ${sk}`} />
          <div className={`size-8 rounded-full ${sk}`} />
        </div>
        <div className="w-80 min-h-screen bg-black border-r border-[#1f1f1f] p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className={`size-8 rounded ${sk}`} />
            <div className={`h-4 w-20 rounded ${sk}`} />
          </div>
          <div className={`h-4 w-24 rounded ${sk}`} />
          <div className={`h-10 w-full rounded-lg ${sk}`} />
          <div className="space-y-2">
            <div className={`h-3 w-16 rounded ${sk}`} />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-10 w-full rounded-lg ${sk}`} />
            ))}
          </div>
          <div className="flex-1" />
          <div className="pt-2 border-t border-[#1f1f1f] flex items-center gap-2">
            <div className={`size-8 rounded-full ${sk}`} />
            <div className={`h-4 w-24 rounded ${sk}`} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 overflow-auto">
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 w-full">
          <div className="mb-8">
            <div className={`h-8 w-56 rounded ${sk} mb-2`} />
            <div className={`h-4 w-72 rounded ${sk}`} />
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-5 overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-9 h-9 rounded-lg ${sk}`} />
                    <div className={`h-4 w-12 rounded ${sk}`} />
                  </div>
                  <div className={`h-3 w-20 rounded ${sk} mb-1`} />
                  <div className={`h-8 w-14 rounded ${sk} mb-4`} />
                  <div className={`h-1.5 w-full rounded-full ${sk}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1 p-0.5 rounded-lg bg-[#111] border border-[#1f1f1f]">
              <div className={`h-9 w-24 rounded-md ${sk}`} />
              <div className={`h-9 w-20 rounded-md ${sk}`} />
            </div>
            <div className="flex gap-1 p-0.5 rounded-lg bg-[#111] border border-[#1f1f1f]">
              <div className={`h-9 w-9 rounded-md ${sk}`} />
              <div className={`h-9 w-9 rounded-md ${sk}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-[#111111] rounded-xl border border-[#1f1f1f] p-4 overflow-hidden"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${sk}`} />
                    <div className={`h-3 w-16 rounded ${sk}`} />
                  </div>
                </div>
                <div className={`h-4 w-[85%] rounded ${sk} mb-2`} />
                <div className={`h-3 w-full rounded ${sk} mb-1`} />
                <div className={`h-3 w-[90%] rounded ${sk} mb-3`} />
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <div className={`h-5 w-16 rounded ${sk}`} />
                  <div className={`h-5 w-14 rounded ${sk}`} />
                  <div className={`h-5 w-20 rounded ${sk}`} />
                </div>
                <div className="pt-3 border-t border-[#1f1f1f] flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className={`h-8 w-14 rounded-md ${sk}`} />
                    <div className={`h-8 w-12 rounded-md ${sk}`} />
                  </div>
                  <div className={`w-4 h-4 rounded ${sk}`} />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLoadingWithTimeout() {
  return <DashboardLoadingSkeleton />;
}
