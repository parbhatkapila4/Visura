"use client";

import CheckoutButton, {
  AMOUNT_BY_CURRENCY,
  SYMBOL,
  useResolvedCurrency,
} from "@/app/components/CheckoutButton";
import BgGradient from "@/components/common/bg-gradient";
import { ArrowLeft, Check, ShieldCheck, ScanSearch, Zap, Sparkles, Crown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const sellingPoints = [
  {
    icon: ScanSearch,
    title: "Smarter briefs",
    copy: "AI-crafted summaries tuned for legal, research, and product teams.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    copy: "SOC2-ready controls with encrypted storage and audit trails.",
  },
  {
    icon: Zap,
    title: "Rapid execution",
    copy: "Upload to actionable insight in under 45 seconds—every time.",
  },
];

const planFeatures = [
  "Unlimited AI summaries & reusable templates",
  "Cross-document search with highlight exports",
  "5 collaborator seats with comment histories",
  "Priority human support & onboarding",
];

export default function Page() {
  const { currency, loading } = useResolvedCurrency();
  const displayAmount = AMOUNT_BY_CURRENCY[currency] ?? 20;
  const symbol = SYMBOL[currency] ?? "$";

  return (
    <div className="relative min-h-screen bg-[#070809] text-white overflow-hidden">
      <BgGradient className="bg-gradient-to-br from-[#F97316]/70 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(249,115,22,0.25),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(253,186,116,0.2),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#070809] via-[#070809]/80 to-transparent" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative flex h-full w-full flex-col gap-8 px-6 lg:px-12 xl:px-20 pb-20 pt-6 md:pt-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 font-medium text-white/90 transition-all duration-300 hover:border-[#F97316]/40 hover:bg-[#F97316]/10 hover:text-white hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] w-fit"
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
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#F97316] backdrop-blur-sm">
                <Crown className="h-3 w-3" />
                Visura Professional
              </span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-br from-white via-white to-white/80 bg-clip-text text-transparent"
              >
                Elevate every deliverable with operational clarity.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-white/70 leading-relaxed max-w-2xl"
              >
                Visura Pro layers advanced summarisation, contextual search, and collaborative
                review into a single polished workspace. Auto-detected currency keeps payments
                frictionless wherever you operate.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid gap-4 sm:grid-cols-3"
            >
              {sellingPoints.map(({ icon: Icon, title, copy }, index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group relative rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f0f0f] via-[#0a0a0a] to-[#0f0f0f] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#F97316]/40 hover:shadow-[0_8px_32px_rgba(249,115,22,0.2)]"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#F97316]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316]/30 via-[#FACC15]/20 to-transparent text-[#F97316] shadow-[0_8px_24px_rgba(249,115,22,0.3)] group-hover:shadow-[0_12px_32px_rgba(249,115,22,0.4)] transition-shadow duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                    <p className="text-xs text-white/60 leading-relaxed">{copy}</p>
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
              <div className="absolute -inset-1 bg-gradient-to-r from-[#F97316] via-[#FACC15] to-[#F97316] rounded-3xl opacity-20 blur-xl animate-pulse" />

              <div className="relative flex flex-col rounded-3xl border border-[#F97316]/40 bg-gradient-to-br from-[#0f0f0f] via-[#0a0a0a] to-[#0f0f0f] p-8 shadow-[0_25px_70px_-40px_rgba(249,115,22,0.6)] backdrop-blur-sm">
                <div className="text-center mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F97316]/80 mb-2">
                    Professional Plan
                  </p>

                  <div className="flex items-end justify-center gap-2 mb-2">
                    <span className="text-6xl font-bold text-white">
                      {loading ? "—" : `${symbol}${displayAmount}`}
                    </span>
                    <span className="pb-2 text-sm uppercase tracking-[0.35em] text-white/55">
                      / month
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-white/50">
                    Currency finalised automatically by your location.
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {planFeatures.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F97316]/20 border border-[#F97316]/30">
                        <Check className="h-3 w-3 text-[#F97316]" />
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
                  <div className="relative">
                    <CheckoutButton amount={displayAmount} />
                  </div>

                  <p className="text-[11px] text-center text-white/50 leading-relaxed">
                    14-day satisfaction guarantee. Cancel any time from billing settings or email
                    support for bespoke enterprise options.
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
          className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-r from-[#F97316]/10 via-transparent to-[#FACC15]/10 p-8 md:p-10 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-white/55">
                Looking for something simpler?
              </p>
              <h3 className="text-2xl md:text-3xl font-semibold text-white">
                Check out our Starter plan for smaller teams
              </h3>
              <p className="max-w-xl text-sm text-white/60 leading-relaxed">
                Perfect for solo operators and early-stage teams. Start small and upgrade seamlessly
                when you're ready to scale.
              </p>
            </div>
            <Link
              href="/checkout/starter"
              className="group inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-[#38bdf8]/60 hover:bg-[#38bdf8]/20 hover:shadow-[0_8px_24px_rgba(56,189,248,0.3)] hover:scale-105"
            >
              Explore Starter
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
