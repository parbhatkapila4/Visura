"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/menu-toggle-icon";
import { LogOut } from "lucide-react";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "#pricing" },
  { label: "Workspace", href: "/workspaces" },
];

const SCROLL_THRESHOLD = 80;
const SCROLL_SETTLE_MS = 200;

function useScrollCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const applyState = () => {
      settleTimerRef.current = null;
      const y = typeof window !== "undefined" ? window.scrollY : 0;
      setIsCollapsed(y > SCROLL_THRESHOLD);
    };

    const onScroll = () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(applyState, SCROLL_SETTLE_MS);
    };

    applyState();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  return isCollapsed;
}

export default function Header() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isCollapsed = useScrollCollapse();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    await signOut();
    setUserMenuOpen(false);
  };

  const firstName = user?.firstName ?? "";
  const userImageUrl = user?.imageUrl ?? "";

  const isChatbotPage = pathname?.includes("/chatbot");
  const isHomePage = pathname === "/";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (isChatbotPage || !isHomePage) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 ease-out border-b",
          isCollapsed
            ? "h-14 bg-black/80 backdrop-blur-md border-white/10"
            : "h-16 bg-transparent border-transparent"
        )}
      >
        <nav className="flex h-full w-full items-center justify-between px-6 md:px-8 max-w-7xl mx-auto transition-all duration-300">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 text-white font-bold tracking-tight hover:text-white/90 transition-all duration-300",
              isCollapsed ? "text-lg" : "text-xl"
            )}
          >
            <img
              src="/Visura-favicon-New.png"
              alt=""
              className={cn("shrink-0 object-contain", isCollapsed ? "size-6" : "size-8")}
              width={isCollapsed ? 24 : 32}
              height={isCollapsed ? 24 : 32}
            />
            Visura
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white hover:text-white/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3">
              {isSignedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 pl-1.5 pr-3 py-1.5 hover:bg-white/10 transition-colors"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    {userImageUrl ? (
                      <Image
                        src={userImageUrl}
                        alt={firstName ? `${firstName}'s profile` : "Profile"}
                        width={28}
                        height={28}
                        className="rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/30 text-white text-xs font-semibold">
                        {firstName ? firstName.charAt(0).toUpperCase() : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() ?? "U"}
                      </span>
                    )}
                    {firstName ? (
                      <span className="text-sm font-medium text-white truncate max-w-[100px]">{firstName}</span>
                    ) : (
                      <span className="text-sm font-medium text-white truncate max-w-[120px]">
                        {user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ?? "Account"}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl shadow-[0_16px_48px_-8px_rgba(0,0,0,0.7)] z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/[0.06]">
                          <p className="text-xs font-medium text-zinc-500 truncate">
                            {user?.emailAddresses?.[0]?.emailAddress ?? ""}
                          </p>
                        </div>
                        <div className="p-1.5">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] group-hover:bg-red-500/15 transition-colors duration-150">
                              <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors duration-150" />
                            </div>
                            Log out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    prefetch={false}
                    className="rounded-md border border-zinc-500 bg-zinc-800/80 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700/80 hover:border-zinc-400 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    prefetch={false}
                    className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <MenuToggleIcon
              open={mobileOpen}
              className="size-6"
              duration={300}
            />
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#0f0f0f] md:hidden"
          >
            <div className="flex flex-col h-full pt-20 px-6 pb-8">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "py-3 text-base font-medium text-white hover:text-white/80"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-3 mt-8">
                {isSignedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-4 py-3"
                    >
                      {userImageUrl ? (
                        <Image
                          src={userImageUrl}
                          alt={firstName ? `${firstName}'s profile` : "Profile"}
                          width={40}
                          height={40}
                          className="rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/30 text-white text-sm font-semibold">
                          {firstName ? firstName.charAt(0).toUpperCase() : user?.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() ?? "U"}
                        </span>
                      )}
                      <span className="text-sm font-medium text-white">
                        {firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Account"}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white"
                    >
                      <LogOut className="w-5 h-5 text-zinc-400 shrink-0" />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      prefetch={false}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md border border-zinc-500 bg-zinc-800/80 px-4 py-3 text-center text-sm font-medium text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/sign-up"
                      prefetch={false}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-black"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
