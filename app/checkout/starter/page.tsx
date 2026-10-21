"use client";

import CheckoutButton, { SYMBOL, useResolvedCurrency } from "@/app/components/CheckoutButton";
import BgGradient from "@/components/common/bg-gradient";
import { ArrowLeft, Layers, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const starterHighlights = [
  {
    icon: Layers,
    title: "Every feature",
    description: "The same summaries and chat as Pro, for up to 10 documents.",
  },
];

const STARTER_AMOUNT_BY_CURRENCY: Record<string, number> = {
  INR: 880,
  USD: 10,
  EUR: 9,
};

const starterFeatures = [
  "Keep up to 10 documents; each new version counts as one",
  "AI summary and chat for every document",
  "PDF, DOCX, PPTX, XLSX, XLS, TXT and MD files up to 32 MB",
  "2 summary downloads, as PDF",
];

export default function StarterCheckoutPage() {
  const { currency, loading } = useResolvedCurrency();
  const displayAmount: number | undefined = STARTER_AMOUNT_BY_CURRENCY[currency];
  const priced = displayAmount !== undefined;
  const symbol = SYMBOL[currency] ?? "$";

  return (
    <div className="relative min-h-screen bg-[#050810] text-white overflow-hidden">
      <BgGradient className="bg-gradient-to-br from-[#38bdf8]/60 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(56,189,248,0.25),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(59,130,246,0.2),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050810] via-[#050810]/80 to-transparent" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative flex h-full w-full flex-col gap-8 px-6 lg:px-12 xl:px-20 pb-20 pt-6 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-white/90 transition-all duration-300 hover:border-[#38bdf8]/40 hover:bg-[#38bdf8]/10 hover:text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] w-fit"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to home
          </Link>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#38bdf8] backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                Visura Starter
              </span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-br from-white via-white to-white/80 bg-clip-text text-transparent"
              >
                Keep up to 10 documents.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-white/70 leading-relaxed max-w-2xl"
              >
                That is up from 5 on the free plan. Each new version of a document counts as one.
                Every other feature is the same on every plan. You pay once, and nothing renews.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid gap-4 sm:max-w-md"
            >
              {starterHighlights.map(({ icon: Icon, title, description }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1720] via-[#0a0f16] to-[#0f1720] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#38bdf8]/40 hover:shadow-[0_8px_32px_rgba(56,189,248,0.2)]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#38bdf8]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#38bdf8]/30 via-[#22d3ee]/20 to-transparent text-[#38bdf8] shadow-[0_8px_24px_rgba(56,189,248,0.3)] group-hover:shadow-[0_12px_32px_rgba(56,189,248,0.4)] transition-shadow duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:sticky lg:top-8 h-fit"
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#38bdf8] via-[#22d3ee] to-[#38bdf8] rounded-3xl opacity-20 blur-xl animate-pulse" />

              <div className="relative flex flex-col rounded-3xl border border-[#38bdf8]/40 bg-gradient-to-br from-[#0f1720] via-[#0a0f16] to-[#0f1720] p-8 shadow-[0_25px_70px_-40px_rgba(56,189,248,0.6)] backdrop-blur-sm">
                <div className="text-center mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#38bdf8]/80 mb-2">
                    Starter plan
                  </p>

                  {priced && (
                    <div className="flex items-end justify-center gap-2 mb-2">
                      <span className="text-6xl font-bold text-white">
                        {loading ? "—" : `${symbol}${displayAmount}`}
                      </span>
                      <span className="pb-2 text-sm uppercase tracking-[0.35em] text-white/55">
                        one-time
                      </span>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-white/50">
                    {priced
                      ? "One-time payment. Currency is set from your location."
                      : `Checkout can't take payment in ${currency}. Email parbhat@parbhat.dev.`}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {starterFeatures.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/30">
                        <Check className="h-3 w-3 text-[#38bdf8]" />
                      </div>
                      <span className="text-sm text-white/80 leading-relaxed">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="space-y-3"
                >
                  <CheckoutButton
                    plan="starter"
                    className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-[#38bdf8]/40 bg-gradient-to-r from-[#38bdf8]/10 via-[#22d3ee]/10 to-[#38bdf8]/10 px-6 py-4 text-sm font-semibold text-[#38bdf8] shadow-[0_8px_32px_rgba(56,189,248,0.3)] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="text-[11px] text-center text-white/50 leading-relaxed">
                    Paid through Razorpay. Nothing renews, so there is nothing to cancel. You can
                    buy Pro later; your documents stay where they are.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-[#38bdf8]/10 via-transparent to-[#22d3ee]/10 p-8 md:p-10 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-white/55">Need more room?</p>
              <h3 className="text-2xl md:text-3xl font-semibold text-white">
                Pro keeps up to 1,000 documents
              </h3>
              <p className="max-w-xl text-sm text-white/60 leading-relaxed">
                Same features as Starter. Buy Pro at its full price and your plan changes once the
                payment is confirmed; your documents stay where they are.
              </p>
            </div>
            <Link
              href="/checkout"
              className="group inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-[#F97316]/60 hover:bg-[#F97316]/20 hover:shadow-[0_8px_24px_rgba(249,115,22,0.3)] hover:scale-105"
            >
              Explore Pro
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
