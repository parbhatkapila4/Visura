"use client";
import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Only show footer on home page (/)
  // Restrict from showing on /dashboard and /analytics
  if (pathname === "/") {
    return (
      <div className="relative z-10 bg-gradient-to-t from-black via-black/95 to-transparent">
        <Footer />
      </div>
    );
  }

  return null;
}


