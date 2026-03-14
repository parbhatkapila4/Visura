"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DotGlobeHero } from "@/components/ui/globe-hero";
import { Zap } from "lucide-react";

export function HeroSection() {
  return (
    <DotGlobeHero
      rotationSpeed={0.004}
      className="bg-black relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% 50%, #fff, transparent 70%)`,
        }}
      />

      <div className="relative z-10 text-center space-y-12 max-w-6xl mx-auto px-6 pt-6 md:pt-10 pb-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10"
        >
          <p
            className="text-center text-[11px] font-medium uppercase tracking-[0.32em] text-white/40"
            aria-label="Category"
          >
            Document intelligence
          </p>

          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.85] select-none font-sans"
            >
              <span className="block font-light text-white/70 mb-3 text-4xl md:text-6xl lg:text-7xl">
                Documents that
              </span>
              <span className="block relative">
                <span
                  className="bg-gradient-to-br from-white via-white to-white/80 bg-clip-text text-transparent font-black relative z-10"
                  style={{ fontFamily: "var(--font-display), ui-serif, Georgia, serif" }}
                >
                  Think
                </span>
                <span
                  className="absolute inset-0 bg-gradient-to-br from-white via-white to-white/80 bg-clip-text text-transparent font-black blur-2xl opacity-40 scale-105"
                  style={{ fontFamily: "var(--font-display), ui-serif, Georgia, serif" }}
                  aria-hidden
                >
                  Think
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
                  className="absolute -bottom-6 left-0 h-0.5 bg-white/40"
                />
              </span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-4xl mx-auto space-y-4"
          >
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed font-medium font-sans">
              Upload any document and get instant{" "}
              <span className="text-white font-semibold bg-white/10 px-2 py-1 rounded-md border border-white/20">
                summaries, search, and chat
              </span>{" "}
              powered by AI.
            </p>
            <p
              className="text-lg text-gray-300 leading-relaxed"
              style={{ textShadow: "0 0 24px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.5)" }}
            >
              Ask questions, extract insights, and export anywhere with
              enterprise-grade security and reliability.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4"
        >
          <Link href="/dashboard" prefetch={false}>
            <motion.span
              className="group relative inline-flex items-center gap-3 px-8 py-4 border-2 border-white/30 rounded-xl font-semibold text-lg hover:border-white/50 transition-all duration-500 backdrop-blur-xl bg-white/5 hover:bg-white/10 shadow-lg overflow-hidden cursor-pointer text-white"
              whileHover={{
                scale: 1.05,
                boxShadow:
                  "0 15px 30px rgba(0,0,0,0.2), 0 0 15px rgba(255,255,255,0.05)",
                y: -2,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Zap className="relative z-10 w-5 h-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
              <span className="relative z-10 tracking-wide">
                Dashboard
              </span>
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </DotGlobeHero>
  );
}
