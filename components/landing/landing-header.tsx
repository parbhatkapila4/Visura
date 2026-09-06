"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { BrandMark, PrimaryCta } from "./primitives";

const NAV_LINKS: Array<[label: string, href: string]> = [
  ["Features", "/features"],
  ["Pricing", "/pricing"],
  ["Docs", "/docs"],
  ["Changelog", "/changelog"],
];

export default function LandingHeader() {
  const [open, setOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuBtnRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;

      const sheet = sheetRef.current;
      const menuBtn = menuBtnRef.current;
      if (!sheet || !menuBtn) return;

      const focusables: HTMLElement[] = [
        menuBtn,
        ...Array.from(sheet.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")),
      ];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const index = active ? focusables.indexOf(active) : -1;

      if (e.shiftKey) {
        if (index <= 0) {
          e.preventDefault();
          last.focus();
        }
      } else if (index === -1 || index === focusables.length - 1) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className="relative h-16"
      style={{ backgroundColor: "var(--paper)", borderBottom: "1px solid var(--hairline)" }}
    >
      <a
        href="#vs-main"
        className="sr-only focus:not-sr-only vs-label"
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          background: "var(--paper)",
          padding: 8,
          border: "1px solid var(--hairline-strong)",
          zIndex: 60,
          color: "var(--ink)",
        }}
      >
        Skip to content
      </a>

      <div className="vs-container flex h-full items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-2.5"
            style={{ color: "var(--ink)", textDecoration: "none" }}
          >
            <BrandMark />
            <span
              style={{
                fontFamily: "var(--font-vs-sans), ui-sans-serif, system-ui, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "0.14em",
              }}
            >
              VISURA
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className="vs-small vs-quiet-link vs-t"
                style={{ fontWeight: 500 }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <SignedOut>
            <Link
              href="/sign-in"
              prefetch={false}
              className="vs-small vs-quiet-link vs-t"
              style={{ fontWeight: 500 }}
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              prefetch={false}
              className="vs-small vs-quiet-link vs-t"
              style={{ fontWeight: 500 }}
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
          <PrimaryCta />
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <SignedOut>
            <Link
              href="/sign-in"
              prefetch={false}
              className="vs-small vs-quiet-link vs-t"
              style={{ fontWeight: 500 }}
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <button
            ref={menuBtnRef}
            type="button"
            className="vs-label vs-t p-2"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--ink)",
              cursor: "pointer",
            }}
            aria-expanded={open}
            aria-controls="vs-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div
        id="vs-mobile-nav"
        ref={sheetRef}
        className="vs-sheet md:hidden"
        data-open={open ? "true" : "false"}
      >
        <div className="px-4 pt-2 pb-8">
          <nav aria-label="Mobile">
            {NAV_LINKS.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                prefetch={false}
                onClick={close}
                className="vs-small vs-quiet-link vs-t block py-3"
                style={{ fontWeight: 500, borderBottom: "1px solid var(--hairline)" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div onClick={close}>
            <PrimaryCta className="w-full mt-6" />
          </div>
        </div>
      </div>
    </header>
  );
}
