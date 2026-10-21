"use client";
import Link from "next/link";
import { ArrowLeft, User, CreditCard } from "lucide-react";

export default function SupportPage() {
  const supportCategories = [
    {
      icon: <User className="w-8 h-8 text-primary" />,
      title: "My account",
      description:
        "While signed in, open the avatar menu at the top of the home page and choose Manage account to edit your profile and security settings.",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary" />,
      title: "Billing",
      description:
        "Paid plans are a single Razorpay payment. Nothing renews, so there is nothing to cancel.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-4">
        <div className="w-full">
          <div className="flex justify-between items-start mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Support</h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl">
            How accounts and billing work, and where to write when something breaks.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-16 relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Something not working?</h2>
          <p className="text-base sm:text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Email{" "}
            <a
              href="mailto:parbhat@parbhat.dev"
              className="font-semibold text-primary hover:opacity-90 transition-opacity"
            >
              parbhat@parbhat.dev
            </a>{" "}
            with the page you were on and what you expected to happen.
          </p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supportCategories.map((category, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-zinc-900/80 p-6 hover:bg-zinc-900 transition-colors"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{category.title}</h3>
                <p className="text-sm text-zinc-400">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
