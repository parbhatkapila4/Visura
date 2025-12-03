"use client";
import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Don't show the old footer on homepage (we have a new custom footer there)
  // Also don't show on chatbot pages
  if (pathname === "/" || pathname?.includes('/chatbot')) {
    return null;
  }

  return (
    <div className="relative z-10 bg-gradient-to-t from-black via-black/95 to-transparent">
      <Footer />
    </div>
  );
}


