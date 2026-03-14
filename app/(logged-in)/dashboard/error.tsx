"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCw, LayoutDashboard } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm text-center"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/70 backdrop-blur-xl p-8 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)]">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                <LayoutDashboard className="w-7 h-7 text-red-400" />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
            Dashboard unavailable
          </h2>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            We couldn&apos;t load your dashboard. This is usually temporary — try refreshing.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-6 rounded-xl border border-white/[0.06] bg-black/40 p-3 text-left">
              <p className="text-xs text-red-400/90 font-mono break-words">{error.message}</p>
            </div>
          )}

          <button
            onClick={reset}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Refresh Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
