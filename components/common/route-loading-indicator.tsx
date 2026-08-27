"use client";

import { useState, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  VISURA_LOGOUT_LOADER_START,
  clearLogoutLoaderPending,
  isLogoutLoaderPending,
} from "@/lib/logout-loader-events";

const ROUTE_LOADING_READY_SELECTOR = "[data-route-loading-ready='true']";
const HOME_LOGOUT_READY_SELECTOR = "[data-visura-home-ready='true']";

function AnimatedLoaderLabel({ text }: { text: string }) {
  const chars = text.split("");
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[min(90vw,320px)]">
      {chars.map((char, i) => (
        <motion.span
          key={`${i}-${char}`}
          className="text-[13px] font-medium tracking-[0.08em] text-white/70"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.06,
          }}
        >
          {char === " " ? "\u00a0" : char}
        </motion.span>
      ))}
    </div>
  );
}

function LoaderOverlay({ message, gradientId }: { message: string; gradientId: string }) {
  return (
    <motion.div
      key="overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}
      aria-live="polite"
      aria-busy="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col items-center gap-5"
      >
        <div className="relative flex items-center justify-center w-12 h-12">
          <motion.svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="2.5"
              fill="none"
            />
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              stroke={`url(#${gradientId})`}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="125.6"
              strokeDashoffset="94.2"
            />
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
              </linearGradient>
            </defs>
          </motion.svg>
        </div>
        <AnimatedLoaderLabel text={message} />
      </motion.div>
    </motion.div>
  );
}

export default function RouteLoadingIndicator() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const [logoutOverlay, setLogoutOverlay] = useState(false);
  const [mounted, setMounted] = useState(false);
  const gradientId = useId().replace(/:/g, "");

  useEffect(() => {
    setMounted(true);
    if (isLogoutLoaderPending()) setLogoutOverlay(true);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const onLogoutStart = () => setLogoutOverlay(true);
    window.addEventListener(VISURA_LOGOUT_LOADER_START, onLogoutStart);
    return () => window.removeEventListener(VISURA_LOGOUT_LOADER_START, onLogoutStart);
  }, []);

  useEffect(() => {
    if (!logoutOverlay || !isLoaded || pathname !== "/" || !isSignedIn) return;
    const t = window.setTimeout(() => {
      clearLogoutLoaderPending();
      setLogoutOverlay(false);
    }, 5000);
    return () => window.clearTimeout(t);
  }, [logoutOverlay, pathname, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!logoutOverlay) return;
    if (pathname !== "/") return;
    if (!isLoaded) return;
    if (isSignedIn) return;

    const tryHide = () => {
      if (document.querySelector(HOME_LOGOUT_READY_SELECTOR)) {
        clearLogoutLoaderPending();
        setLogoutOverlay(false);
      }
    };

    tryHide();
    const observer = new MutationObserver(tryHide);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-visura-home-ready"],
    });
    const interval = window.setInterval(tryHide, 120);
    const maxWait = window.setTimeout(() => {
      clearLogoutLoaderPending();
      setLogoutOverlay(false);
    }, 20000);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      window.clearTimeout(maxWait);
    };
  }, [logoutOverlay, pathname, isLoaded, isSignedIn]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor || !anchor.href) return;
      try {
        const url = new URL(anchor.href);
        const isSameOrigin = url.origin === window.location.origin;
        const isSamePath = url.pathname === pathname;
        const isNewTab = anchor.target === "_blank" || e.ctrlKey || e.metaKey;
        if (isSameOrigin && !isNewTab && !isSamePath) {
          setIsNavigating(true);
        }
      } catch {}
    };

    const handlePopState = () => {
      setIsNavigating(true);
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isNavigating) return;
    const timeout = setTimeout(() => setIsNavigating(false), 8000);
    return () => clearTimeout(timeout);
  }, [isNavigating]);

  const showOverlay = isNavigating || logoutOverlay;

  useEffect(() => {
    if (!showOverlay || typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [showOverlay]);

  useEffect(() => {
    if (!isNavigating || typeof document === "undefined") return;

    const hideLoaderIfRouteSkeletonReady = () => {
      if (document.querySelector(ROUTE_LOADING_READY_SELECTOR)) {
        setIsNavigating(false);
      }
    };

    hideLoaderIfRouteSkeletonReady();

    const observer = new MutationObserver(() => {
      hideLoaderIfRouteSkeletonReady();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-route-loading-ready"],
    });

    return () => observer.disconnect();
  }, [isNavigating]);

  if (!mounted || typeof document === "undefined") return null;

  const loader = (
    <AnimatePresence mode="wait">
      {logoutOverlay && (
        <LoaderOverlay key="logout-loader" message="Logging out..." gradientId={gradientId} />
      )}
      {!logoutOverlay && isNavigating && (
        <LoaderOverlay key="route-loader" message="Loading" gradientId={gradientId} />
      )}
    </AnimatePresence>
  );

  return createPortal(loader, document.body);
}
