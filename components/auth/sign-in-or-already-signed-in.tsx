"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

const AUTH_LOAD_TIMEOUT_MS = 12_000;
const REDIRECT_DELAY_MS = 1200;
const LOOP_DETECT_WINDOW_MS = 8000;
const SHOW_STUCK_AFTER_MS = 4000;
const SIGNIN_LOOP_KEY = "visura_signin_redirect_ts";

export function SignInOrAlreadySignedIn() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const searchParams = useSearchParams();
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [showStuckHint, setShowStuckHint] = useState(false);
  const [loopDetected, setLoopDetected] = useState(false);
  const [clearing, setClearing] = useState(false);
  const redirectScheduled = useRef(false);
  const strippedRedirect = useRef(false);

  const redirectUrl = searchParams.get("redirect_url");
  useEffect(() => {
    if (typeof window === "undefined" || !redirectUrl || strippedRedirect.current) return;
    strippedRedirect.current = true;
    window.location.replace("/sign-in");
  }, [redirectUrl]);

  useEffect(() => {
    const t = setTimeout(() => setLoadTimedOut(true), AUTH_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!redirectUrl) return;
    const t = setTimeout(() => setShowStuckHint(true), SHOW_STUCK_AFTER_MS);
    return () => clearTimeout(t);
  }, [redirectUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const now = Date.now();
    const last = sessionStorage.getItem(SIGNIN_LOOP_KEY);
    if (redirectUrl && last) {
      const t = parseInt(last, 10);
      if (now - t < LOOP_DETECT_WINDOW_MS) setLoopDetected(true);
    }
    if (redirectUrl) sessionStorage.setItem(SIGNIN_LOOP_KEY, String(now));
  }, [redirectUrl]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || redirectScheduled.current) return;
    if (typeof window !== "undefined") sessionStorage.removeItem(SIGNIN_LOOP_KEY);
    redirectScheduled.current = true;
    const timeout = setTimeout(() => {
      window.location.replace("/dashboard");
    }, REDIRECT_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn]);

  const handleClearSessionAndRetry = async () => {
    setClearing(true);
    try {
      if (typeof window !== "undefined") sessionStorage.removeItem(SIGNIN_LOOP_KEY);
      await signOut({ redirectUrl: window.location.origin + "/sign-in" });
      window.location.href = "/sign-in";
    } catch {
      window.location.href = "/sign-in";
    } finally {
      setClearing(false);
    }
  };

  if (loopDetected) {
    return (
      <div className="w-full max-w-md mx-auto rounded-2xl border border-red-500/30 bg-red-950/20 p-6 text-center">
        <p className="text-base font-semibold text-red-200 mb-2">Redirect loop detected</p>
        <p className="text-sm text-red-200/80 mb-4">
          Your session may be invalid (e.g. system clock wrong). Clear the session and sign in again.
        </p>
        <button
          type="button"
          onClick={handleClearSessionAndRetry}
          disabled={clearing}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm disabled:opacity-60"
        >
          {clearing ? "Clearing…" : "Clear session and sign in again"}
        </button>
        <p className="mt-4 text-xs text-red-200/60">
          You’ll be taken to sign-in with a clean session. Fix your system clock if the issue continues.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="mt-4 text-sm text-white/60">Loading…</p>
        {(showStuckHint || loadTimedOut) && (
          <div className="mt-4 max-w-sm text-center space-y-2">
            <p className="text-xs text-white/50">
              Stuck? This can happen if your system clock is wrong or you hit a redirect loop.
            </p>
            <p className="text-xs text-white/40">
              <button
                type="button"
                onClick={handleClearSessionAndRetry}
                className="underline hover:text-white/70"
              >
                Clear session and sign in again
              </button>
              {" · "}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="underline hover:text-white/70"
              >
                Refresh
              </button>
              {" · Or fix your system clock."}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <p className="mt-4 text-sm text-white/60">Redirecting…</p>
      </div>
    );
  }

  return (
    <SignIn
      appearance={clerkAppearance}
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      fallbackRedirectUrl="/dashboard"
      forceRedirectUrl="/dashboard"
    />
  );
}
