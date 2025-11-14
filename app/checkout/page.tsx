"use client";

import CheckoutButton, {
  AMOUNT_BY_CURRENCY,
  SYMBOL,
  useResolvedCurrency,
} from "@/app/components/CheckoutButton";
import BgGradient from "@/components/common/bg-gradient";
import { ArrowLeft, Check, ShieldCheck, ScanSearch, Zap } from "lucide-react";
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
    <div className="relative h-screen overflow-hidden bg-[#070809] text-white">
      <BgGradient className="bg-gradient-to-br from-[#F97316]/70 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.18),_transparent_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-30%] h-[32rem] bg-[radial-gradient(circle_at_bottom,_rgba(253,186,116,0.18),_transparent_70%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#070809] via-[#070809]/95 to-transparent" />

      <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col gap-12 px-6 pb-20 pt-16">
        <div className="flex items-center justify-between text-sm text-white/60">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/55 md:inline-flex">
            Trusted by bootstrapped teams shipping faster
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-3xl border border-white/10 bg-[#101114]/95 p-10 shadow-[0_30px_80px_-40px_rgba(249,115,22,0.45)] backdrop-blur"
        >
          <div className="grid h-full gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#161719] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                  Visura pro
                </span>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Elevate every deliverable with operational clarity.
                </h1>
                <p className="max-w-xl text-base text-white/70">
                  Visura Pro layers advanced summarisation, contextual search, and collaborative review into a single polished workspace. Auto-detected currency keeps payments frictionless wherever you operate.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {sellingPoints.map(({ icon: Icon, title, copy }) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-[#161719] p-5"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316]/45 via-[#FACC15]/30 to-transparent text-white shadow-[0_12px_28px_rgba(249,115,22,0.28)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-1 text-xs text-white/70">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-[#F97316]/40 bg-gradient-to-br from-[#141517] via-[#0c0d0f] to-[#141517] p-8 shadow-[0_25px_70px_-40px_rgba(249,115,22,0.6)]">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#F97316]/85">
                    Pro plan
                  </p>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-bold text-white">
                      {loading ? "—" : `${symbol}${displayAmount}`}
                    </span>
                    <span className="pb-2 text-sm uppercase tracking-[0.35em] text-white/55">
                      / month
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/60">
                    Currency finalised automatically by your location.
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-white/82">
                  {planFeatures.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#F97316]/25 text-[#F97316]">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <CheckoutButton amount={displayAmount} />
                <p className="text-[11px] text-white/55">
                  14-day satisfaction guarantee. Cancel any time from billing settings or email support for bespoke enterprise options.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

