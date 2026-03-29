import { SidebarWithContent } from "@/components/sidebar-component";

const sk = "skeleton-shimmer";

export default function SummaryLoading() {
  const navRowWidths = ["92%", "86%", "78%", "96%", "82%"] as const;
  const sectionLineWidths = ["88%", "76%", "94%", "83%"] as const;

  return (
    <SidebarWithContent>
      <div
        className="bg-[#0a0a0a] min-h-[calc(100vh-56px)] pb-12 overflow-x-hidden w-full"
        data-route-loading-ready="true"
      >
        <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1f1f1f]">
          <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-hidden">
            <div className="flex items-center justify-between h-14 gap-2">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <div className={`h-4 w-10 sm:w-12 rounded ${sk} flex-shrink-0`} />
                <span className="text-[#333] hidden sm:inline">/</span>
                <div className={`h-4 flex-1 max-w-[min(100%,24rem)] rounded ${sk} min-w-0`} />
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <div className={`size-8 rounded-lg ${sk}`} />
                <div className={`size-8 rounded-lg ${sk}`} />
                <div className={`h-8 w-16 sm:w-20 rounded-lg ${sk}`} />
              </div>
            </div>
          </div>
        </header>

        <div className="w-full px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          <div className="flex gap-4 sm:gap-8 py-6 sm:py-8">
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20 space-y-6">
                <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i}>
                        <div className={`h-2 w-12 rounded mb-2 ${sk}`} />
                        <div className={`h-5 w-8 rounded ${sk}`} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                  <div className={`h-3 w-20 rounded mb-4 ${sk}`} />
                  <div className="space-y-2">
                    {navRowWidths.map((w, i) => (
                      <div
                        key={`${i}-${w}`}
                        className={`h-8 rounded-lg ${sk}`}
                        style={{ width: w }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-1 min-w-0 w-full">
              <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-[#1f1f1f]">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded ${sk}`} />
                  <div className={`h-3 w-20 rounded ${sk}`} />
                  <span className="text-[#333]">•</span>
                  <div className={`h-3 w-24 rounded ${sk}`} />
                </div>

                <div className={`h-9 sm:h-10 md:h-11 w-full max-w-4xl rounded-lg mb-3 sm:mb-4 ${sk}`} />
                <div className={`h-5 sm:h-6 w-full max-w-2xl rounded mb-4 sm:mb-6 ${sk}`} />

                <div className="space-y-2">
                  <div className={`h-2 w-24 rounded ${sk}`} />
                  <div className="flex flex-wrap gap-2">
                    <div className={`h-7 w-32 rounded-full border border-[#1f1f1f] bg-[#111] ${sk}`} />
                    <div className={`h-7 w-40 rounded-full border border-[#1f1f1f] bg-[#111] ${sk}`} />
                    <div className={`h-7 w-28 rounded-full border border-[#1f1f1f] bg-[#111] ${sk}`} />
                  </div>
                </div>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {[1, 2, 3].map((section) => (
                  <section key={section}>
                    <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#252525] bg-[#1a1a1a] ${sk}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className={`h-2 w-16 rounded mb-2 ${sk}`} />
                        <div className={`h-6 sm:h-7 w-full max-w-md rounded ${sk}`} />
                      </div>
                    </div>

                    <div className="pl-0 sm:pl-11 space-y-2 sm:space-y-3">
                      {sectionLineWidths.map((w, idx) => (
                        <div
                          key={`${section}-${idx}-${w}`}
                          className="py-2 border-l-2 border-[#1f1f1f] pl-3 sm:pl-4"
                        >
                          <div className={`h-4 rounded ${sk}`} style={{ width: w }} />
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
                    className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]"
                  >
                    <div className={`w-8 h-8 rounded-lg mb-3 ${sk}`} />
                    <div className={`h-4 w-16 rounded mb-1 ${sk}`} />
                    <div className={`h-3 w-20 rounded ${sk}`} />
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </SidebarWithContent>
  );
}
