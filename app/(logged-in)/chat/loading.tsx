import { SidebarWithContent } from "@/components/sidebar-component";

const sk = "skeleton-shimmer";
export default function ChatLoading() {
  return (
    <SidebarWithContent>
      <div className="min-h-screen w-full flex flex-col" data-route-loading-ready="true">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 w-full">
          <div className={`h-8 w-56 rounded ${sk} mb-2`} />
          <div className={`h-4 w-80 max-w-full rounded ${sk} mb-8`} />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#111] border border-[#1f1f1f]"
              >
                <div className={`w-10 h-10 rounded-lg ${sk} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className={`h-4 w-3/4 rounded ${sk} mb-2`} />
                  <div className={`h-3 w-20 rounded ${sk}`} />
                </div>
                <div className={`w-4 h-4 rounded ${sk} shrink-0`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarWithContent>
  );
}
