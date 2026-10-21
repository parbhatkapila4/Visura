const sk = "skeleton-shimmer";
export default function UploadLoading() {
  return (
    <div
      className="relative z-10 w-full min-h-screen flex flex-col items-center bg-[#0a0a0a]"
      data-route-loading-ready="true"
    >
      <header className="sticky top-0 shrink-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1f1f1f] w-full">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 w-full">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className={`h-4 w-20 rounded ${sk}`} />
              <span className="text-[#333]">/</span>
              <div className={`h-4 w-14 rounded ${sk}`} />
            </div>
            <div className={`h-4 w-16 rounded ${sk}`} />
          </div>
        </div>
      </header>

      <div className="relative w-full flex-1 min-h-0 bg-[#0a0a0a] flex flex-col items-center">
        <div className="relative z-10 w-full px-4 py-12 pb-20 flex flex-col items-center">
          <div className="w-full max-w-xl mx-auto">
            <div className="mb-10">
              <div className="text-center max-w-2xl mx-auto">
                <div className={`h-10 sm:h-12 w-full max-w-md rounded-lg ${sk} mx-auto mb-3`} />
                <div className={`h-5 w-11/12 max-w-sm rounded ${sk} mx-auto mb-2`} />
                <div className={`h-5 w-2/3 max-w-xs rounded ${sk} mx-auto`} />
              </div>
            </div>

            <div className="w-full max-w-xl mx-auto">
              <div className="rounded-2xl border border-[#1f1f1f] bg-[#111] overflow-hidden">
                <div className="p-8 sm:p-12 text-center">
                  <div className={`w-14 h-14 mx-auto rounded-xl ${sk} mb-4`} />
                  <div className={`h-5 w-56 rounded ${sk} mx-auto mb-2`} />
                  <div className={`h-4 w-40 rounded ${sk} mx-auto`} />
                </div>
              </div>

              <div className={`h-12 w-full rounded-xl ${sk} mt-4`} />
              <div className={`h-4 w-48 rounded ${sk} mx-auto mt-3`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
