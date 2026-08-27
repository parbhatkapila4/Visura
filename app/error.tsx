"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { RefreshCw, Home, LayoutDashboard, Mail } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/70 backdrop-blur-xl p-8 sm:p-10 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)]">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                <svg
                  className="w-9 h-9 text-red-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Something went wrong
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We hit an unexpected issue. Your data is safe — try refreshing or head back.
            </p>
          </div>

          {process.env.NODE_ENV === "development" && (
            <details className="mb-8 group">
              <summary className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-zinc-400 transition-colors flex items-center gap-1.5">
                <span className="group-open:rotate-90 transition-transform text-[10px]">
                  &#9654;
                </span>
                Error details
              </summary>
              <div className="mt-3 rounded-xl border border-white/[0.06] bg-black/40 p-4">
                <p className="text-xs text-red-400/90 font-mono break-words leading-relaxed">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-[11px] text-zinc-600 mt-2 font-mono">ID: {error.digest}</p>
                )}
              </div>
            </details>
          )}

          <div className="flex flex-col gap-2.5">
            <button
              onClick={reset}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Try again
            </button>

            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/[0.12] active:scale-[0.98]"
            >
              <Home className="w-4 h-4 text-zinc-400" />
              Home
            </Link>

            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-400 transition-all hover:text-white hover:bg-white/[0.04]"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-xs text-zinc-500">
              Still having trouble?{" "}
              <a
                href="mailto:parbhat@parbhat.dev"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <Mail className="w-3 h-3" />
                Contact support
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
