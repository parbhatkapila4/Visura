"use client";

import { FileText, Upload, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmptySummaryState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative text-center py-16 sm:py-24 px-4">
        <motion.div
          className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32 mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-dashed border-white/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          <motion.div
            className="absolute inset-3 sm:inset-4 rounded-full border-2 border-dashed border-orange-500/30"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

          <div className="absolute inset-6 sm:inset-8 rounded-full bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 flex items-center justify-center backdrop-blur-xl">
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400" />
            </motion.div>
          </div>

          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-orange-400" />
          </motion.div>
          <motion.div
            className="absolute -bottom-1 -left-1"
            animate={{ scale: [1, 0.8, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white">No summaries yet</h3>
          <p className="text-white/50 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Upload your first PDF to unlock AI-powered insights, summaries, and intelligent chat
            with your documents
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link href="/upload">
            <motion.button
              className="relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />

              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />

              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              <Upload className="relative z-10 w-5 h-5" />
              <span className="relative z-10">Upload Your First PDF</span>
              <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/40 text-xs sm:text-sm"
        >
          {["AI Summaries", "Document Chat", "Key Insights", "Export & Share"].map(
            (feature, index) => (
              <motion.div
                key={feature}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-pink-400" />
                <span>{feature}</span>
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
