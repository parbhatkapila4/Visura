"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { ArrowRight } from "lucide-react";

const FORM_CHECK_DELAY_MS = 2500;

function FallbackCard() {
  return (
    <div className="w-full rounded-2xl bg-[#2C2638]/90 border border-white/10 p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white mb-2">Sign in</h1>
      <p className="text-white/70 text-sm mb-6">
        The sign-in form couldn’t load. This can happen due to a connection or browser issue.
      </p>
      <div className="flex flex-col gap-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-medium text-sm transition-colors"
        >
          Back to website
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/sign-in-help"
          className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-[#a855f7]/20 hover:bg-[#a855f7]/30 border border-[#a855f7]/40 text-[#c4b5fd] font-medium text-sm transition-colors"
        >
          See sign-in help
        </Link>
      </div>
    </div>
  );
}

export function SignInWithFallback() {
  const [showFallback, setShowFallback] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!containerRef.current) return;
      const hasClerkForm =
        containerRef.current.querySelector("[data-clerk-component='sign-in']") ??
        containerRef.current.querySelector("form") ??
        containerRef.current.querySelector('input[type="email"]');
      if (hasClerkForm) {
        setShowFallback(false);
      }
    }, FORM_CHECK_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {showFallback && (
        <div className="w-full">
          <FallbackCard />
        </div>
      )}
      <div
        ref={containerRef}
        className={`w-full flex flex-col items-center ${showFallback ? "absolute inset-0 opacity-0 pointer-events-none overflow-hidden" : ""}`}
        aria-hidden={showFallback}
      >
        <SignIn appearance={clerkAppearance} routing="path" path="/sign-in" signUpUrl="/sign-up" />
        <p className="mt-6 text-center text-sm text-white/60">
          Having trouble?{" "}
          <Link href="/sign-in-help" className="text-[#a855f7] underline hover:no-underline">
            See sign-in help
          </Link>
        </p>
      </div>
    </>
  );
}
