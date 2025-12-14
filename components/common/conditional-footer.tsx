"use client";
import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/analytics" ||
    pathname === "/workspaces" ||
    pathname === "/checkout" ||
    pathname === "/upload" ||
    pathname?.startsWith("/dashboard/") ||
    pathname?.startsWith("/analytics/") ||
    pathname?.startsWith("/workspaces/") ||
    pathname?.startsWith("/checkout/") ||
    pathname?.startsWith("/sign-in") ||
    pathname?.startsWith("/sign-up") ||
    pathname?.startsWith("/upload") ||
    pathname?.startsWith("/summaries") ||
    pathname?.startsWith("/chatbot")
  ) {
    return null;
  }

  return (
    <div className="relative z-10 bg-gradient-to-t from-black via-black/95 to-transparent">
      <Footer />
    </div>
  );
}
