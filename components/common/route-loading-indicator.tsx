"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function RouteLoadingIndicator() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

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
      } catch {
      }
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

  if (!mounted || typeof document === "undefined") return null;

  const loader = (
    <AnimatePresence mode="wait">
      {isNavigating && (
        <motion.div
          key="route-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <div
            className="fixed z-[10000] -translate-x-1/2 -translate-y-1/2"
            style={{ left: "50vw", top: "50dvh" }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative h-16 w-16">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/10"
                  style={{ borderTopColor: "transparent" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary/80"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_var(--primary)]"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-white/90 tracking-wide">Loading</span>
                <span className="text-xs text-white/50">Please wait...</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(loader, document.body);
}
