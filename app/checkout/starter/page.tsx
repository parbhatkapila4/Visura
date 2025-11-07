"use client";

import CheckoutButton from "@/app/components/CheckoutButton";
import { ArrowLeft, Layers, Shield, Timer } from "lucide-react";
import BgGradient from "@/components/common/bg-gradient";
import Link from "next/link";

const USD_TO_INR = 88;

export default function StarterCheckoutPage() {
  const highlights = [
    {
      icon: Layers,
      title: "Essential feature set",
      description: "Everything you need to summarise and share up to 50 docs each month.",
    },
    {
      icon: Timer,
      title: "Optimised turnaround",
      description: "Get polished summaries in under two minutes—perfect for solo workflows.",
    },
    {
      icon: Shield,
      title: "Trusted security",
      description: "Clerk auth, encrypted storage, and compliant audit trails included.",
    },
  ];

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-black text-white">
      <BgGradient className="bg-gradient-to-br from-[#38bdf8] via-[#7C3AED] to-transparent opacity-35" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-y-16 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_right,_rgba(56,189,248,0.28),_transparent_65%)] blur-3xl sm:block" />

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
                <span className="inline-flex h-2 w-2 rounded-full bg-sky-400" />
                Starter plan · solo & small teams
              </p>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Launch your document AI workflow in minutes.
                </h1>
                <p className="max-w-2xl text-lg text-white/70">
                  Perfect for individuals discovering Visura, the Starter tier delivers powerful
                  summaries, clean exports, and AI insights without the enterprise overhead.
                  Pay once, get immediate access, and upgrade whenever you&apos;re ready.
                </p>
              </div>
            </div>

            <dl className="grid gap-6 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-sky-400/50 hover:bg-sky-400/10"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400/40 to-[#7C3AED]/40 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <dt className="text-base font-medium text-white">{title}</dt>
                  <dd className="mt-2 text-sm text-white/70">{description}</dd>
                </div>
              ))}
            </dl>
          </section>

          <aside className="rounded-4xl border border-sky-400/30 bg-white/[0.04] p-8 shadow-[0_0_60px_rgba(56,189,248,0.2)] backdrop-blur-xl">
            <div className="mb-8 space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Starter Access</p>
              <h2 className="text-4xl font-semibold text-white">$10</h2>
              <p className="text-sm text-white/60">
                Secure Razorpay checkout · Approx. ₹{10 * USD_TO_INR}
              </p>
            </div>

            <ul className="mb-10 space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                Up to 50 documents analysed each month
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                Core AI summaries with smart highlight extraction
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                PDF & Word uploads plus shareable exports
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                Email support & standard processing speeds
              </li>
            </ul>

            <CheckoutButton amountInUSD={10} receiptId="rcpt_starter_demo_001" />

            <p className="mt-6 text-xs text-white/50">
              By continuing, you agree to the Terms of Service and understand that all
              payments are processed securely via Razorpay. Upgrading to Professional is
              seamless—your summaries and chat history stay intact.
            </p>
          </aside>
        </div>

        <div className="flex flex-col gap-6 rounded-4xl border border-white/10 bg-gradient-to-r from-sky-500/20 via-transparent to-[#7C3AED]/10 p-10 backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">Need more power?</p>
            <h3 className="mt-3 text-2xl font-semibold">Upgrade to Visura Professional anytime</h3>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Unlock unlimited documents, collaboration spaces, and priority support with
              the Professional tier. We pro-rate your payment so you never pay twice.
            </p>
          </div>
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:border-[#7C3AED]/60 hover:bg-[#7C3AED]/20"
          >
            Explore Professional
          </Link>
        </div>
      </div>
    </div>
  );
}

