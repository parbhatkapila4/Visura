"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { RefreshCw, Upload, ArrowLeft } from "lucide-react";

export default function UploadError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Upload Error:", error);
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
                <Upload className="w-7 h-7 text-red-400" />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Upload failed</h2>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            Something went wrong with the upload. The file might be too large or in an unsupported format.
          </p>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mb-6 rounded-xl border border-white/[0.06] bg-black/40 p-3 text-left">
              <p className="text-xs text-red-400/90 font-mono break-words">{error.message}</p>
            </div>
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
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.06] hover:border-white/[0.12] active:scale-[0.98]"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-400" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
