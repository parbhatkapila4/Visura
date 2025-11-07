"use client";

import CheckoutButton from "@/app/components/CheckoutButton";
import { ArrowLeft, ShieldCheck, Sparkles, Zap } from "lucide-react";
import BgGradient from "@/components/common/bg-gradient";
import Link from "next/link";

export default function Page() {
  const highlights = [
    {
      icon: Sparkles,
      title: "AI-powered insights",
      description:
        "Sharper summaries tailored to the way your team consumes information.",
    },
    {
      icon: Zap,
      title: "Lightning-fast delivery",
      description:
        "Upload documents and receive structured outputs in under 60 seconds.",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise-grade security",
      description: "SOC2-ready architecture with role-based access and audit logs.",
    },
  ];

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <BgGradient className="bg-gradient-to-br from-[#F97316] via-[#7C3AED] to-transparent opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-12 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_right,_rgba(249,115,22,0.28),_transparent_60%)] blur-3xl sm:block" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-20 md:px-12">
        <div className="flex items-center justify-between text-sm text-white/60">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-[1.3fr_1fr]">
          <section className="space-y-10">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-white/70 backdrop-blur">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                Instant access after payment
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  One checkout away from effortless document intelligence.
                </h1>
                <p className="max-w-2xl text-lg text-white/70">
                  Visura Pro unlocks collaborative workspaces, advanced summarizers,
                  contextual search, and 200+ file automations designed for legal, research,
                  and product teams. Pay once, start transforming every document.
                </p>
              </div>
            </div>

            <dl className="grid gap-6 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-[#F97316]/50 hover:bg-[#F97316]/10"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316]/50 to-[#7C3AED]/40 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <dt className="text-base font-medium text-white">{title}</dt>
                  <dd className="mt-2 text-sm text-white/70">{description}</dd>
                </div>
              ))}
            </dl>
          </section>

          <aside className="rounded-4xl border border-[#F97316]/30 bg-white/[0.04] p-8 shadow-[0_0_60px_rgba(147,51,234,0.2)] backdrop-blur-xl">
            <div className="mb-8 space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-[#F97316]/80">Pro Access</p>
              <h2 className="text-4xl font-semibold text-white">$20</h2>
              <p className="text-sm text-white/60">
                Secure Razorpay checkout · Approx. ₹{20 * 83}
              </p>
            </div>

            <ul className="mb-10 space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#F97316]" />
                Unlimited AI summaries & smart highlights
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#F97316]" />
                Export-ready briefs, compliance reports, and citations
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#F97316]" />
                Collaboration seats for up to 5 team members
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#F97316]" />
                Priority human support + onboarding workshop
              </li>
            </ul>

            <CheckoutButton amountInUSD={20} receiptId="rcpt_demo_001" />

            <p className="mt-6 text-xs text-white/50">
              By continuing, you agree to the Terms of Service and understand that all
              payments are processed securely via Razorpay. You can request a refund within
              the first 14 days if Visura Pro isn&apos;t the right fit for your team.
            </p>
          </aside>
        </div>

        <div className="flex flex-col gap-6 rounded-4xl border border-white/10 bg-gradient-to-r from-[#7C3AED]/20 via-transparent to-[#F97316]/10 p-10 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Need a custom plan?</p>
            <h3 className="mt-3 text-2xl font-semibold">Scale Visura across your org</h3>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Talk to our solutions engineers about compliance, private deployments, or
              onboarding large document archives. We respond in under 24 hours.
            </p>
          </div>
          <a
            href="mailto:hello@visura.app"
            className="inline-flex items-center justify-center rounded-2xl border border-[#F97316]/50 bg-[#F97316]/15 px-6 py-3 text-sm font-medium text-white transition hover:border-[#F97316] hover:bg-[#F97316]/25"
          >
            Contact sales
          </a>
        </div>
      </div>
    </div>
  );
}

