"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MenuToggleIcon } from "@/components/menu-toggle-icon";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "/about" },
];

export function Header() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0f0f0f] border-b border-white/5">
      <nav className="flex h-16 w-full items-center justify-between px-6 md:px-8 max-w-6xl mx-auto">
        <Link
          href="/"
          className="text-white font-bold text-xl tracking-tight hover:text-white/90 transition-colors"
        >
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
            <Link
              href="/sign-in"
              className="rounded-md border border-zinc-500 bg-zinc-800/80 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700/80 hover:border-zinc-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-md text-white hover:bg-white/10"
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={open} className="size-6" duration={300} />
        </button>
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-[60] bg-[#0f0f0f] flex flex-col pt-20 px-6 pb-8 md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-base font-medium text-white hover:text-white/80"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3 mt-8">
          <Link
            href="/sign-in"
            onClick={() => setOpen(false)}
            className="rounded-md border border-zinc-500 bg-zinc-800/80 px-4 py-3 text-center text-sm font-medium text-white"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            onClick={() => setOpen(false)}
            className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-black"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
