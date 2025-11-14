"use client";

import CheckoutButton, {
  SYMBOL,
  useResolvedCurrency,
} from "@/app/components/CheckoutButton";
import BgGradient from "@/components/common/bg-gradient";
import { ArrowLeft, Layers, ShieldCheck, Timer } from "lucide-react";
import Link from "next/link";

const starterHighlights = [
  {
    icon: Layers,
    title: "Core feature set",
    description: "Summaries, highlights, and exports for up to 50 documents a month.",
  },
  {
    icon: Timer,
    title: "Quick turnaround",
    description: "90-second processing designed for solo operators and lean teams.",
  },
  {
    icon: ShieldCheck,
    title: "Security included",
    description: "Clerk auth, encrypted storage, and dependable audit history out of the box.",
  },
];

const STARTER_AMOUNT_BY_CURRENCY: Record<string, number> = {
  INR: 880,
  USD: 10,
  EUR: 9,
};

const starterFeatures = [
  "Up to 50 documents analysed monthly",
  "AI summaries with smart highlight extraction",
  "PDF & DOCX uploads plus shareable exports",
  "Email support and standard processing speeds",
];

export default function StarterCheckoutPage() {
  const { currency, loading } = useResolvedCurrency();
  const displayAmount = STARTER_AMOUNT_BY_CURRENCY[currency] ?? 10;
  const symbol = SYMBOL[currency] ?? "$";

  return (
    <div className="relative min-h-screen bg-[#050810] text-white">
      <BgGradient className="bg-gradient-to-br from-[#38bdf8]/60 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.18),_transparent_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[-30%] h-[32rem] bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.2),_transparent_75%)]" />
      <div className="pointer-events-none sticky top-0 z-10 h-16 bg-gradient-to-b from-[#050810] via-[#050810]/95 to-transparent" />

      <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col gap-8 px-6 pb-20 pt-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-white transition hover:border-white/30 hover:bg-white/10 w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        {/* Pricing Card with Badge Above */}
        <div className="flex flex-col gap-4 w-full">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/55 w-fit ml-auto">
              Perfect for bootstrapped first hires
            </span>
            
            <div className="flex flex-col justify-between rounded-2xl border border-[#38bdf8]/40 bg-gradient-to-br from-[#101521] via-[#09111e] to-[#101521] p-8 shadow-[0_25px_70px_-40px_rgba(56,189,248,0.55)] w-full">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#38bdf8]/80">
                  Starter plan
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
                {starterFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#38bdf8]/25 text-[#38bdf8]">
                      •
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 mt-6">
              <CheckoutButton amount={10} overrides={STARTER_AMOUNT_BY_CURRENCY} />
              <p className="text-[11px] text-white/55">
                14-day satisfaction guarantee. Upgrade to Professional whenever you need more power—your data stays in place.
              </p>
            </div>
            </div>
          </div>

        {/* Description Content Below */}
        <div className="rounded-3xl border border-white/10 bg-[#0c1018]/95 p-10 shadow-[0_28px_70px_-40px_rgba(59,130,246,0.5)] backdrop-blur">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
                Visura starter
              </span>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Launch your document workflow in under an hour.
              </h1>
              <p className="max-w-xl text-base text-white/70">
                Starter keeps founders and early hires organised with instant summaries, searchable insights,
                and export-ready briefs. Scale without spreadsheets—or the enterprise price tag.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {starterHighlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/10 bg-[#111722] p-5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#38bdf8]/45 via-[#22d3ee]/30 to-transparent text-white shadow-[0_12px_28px_rgba(56,189,248,0.3)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-xs text-white/70">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-r from-[#38bdf8]/25 via-transparent to-[#22d3ee]/20 p-10 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/55">Need advanced workflows?</p>
            <h3 className="mt-3 text-2xl font-semibold">Hop into Visura Professional when you&apos;re ready</h3>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Unlock unlimited documents, collaboration spaces, API access, and priority onboarding. Upgrades are instant—no migration required.
            </p>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:border-[#F97316]/60 hover:bg-[#F97316]/25"
          >
            Explore Professional
          </Link>
        </div>
      </div>
    </div>
  );
}

