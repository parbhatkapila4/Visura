"use client";
import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show footer on home page (FooterSection is already there)
  // Don't show on /dashboard, /analytics, /workspaces, /checkout, /sign-in, and /sign-up pages
  // Only show on other pages
  if (
    pathname === "/" || 
    pathname === "/dashboard" || 
    pathname === "/analytics" || 
    pathname === "/workspaces" ||
    pathname === "/checkout" ||
    pathname?.startsWith("/dashboard/") || 
    pathname?.startsWith("/analytics/") ||
    pathname?.startsWith("/workspaces/") ||
    pathname?.startsWith("/checkout/") ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up")
  ) {
    return null;
  }

  return (
    <div className="relative z-10 bg-gradient-to-t from-black via-black/95 to-transparent">
      <Footer />
    </div>
  );
}


