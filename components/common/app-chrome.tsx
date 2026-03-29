"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/common/header";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/sign-in" ||
    pathname?.startsWith("/sign-in/") ||
    pathname === "/sign-up" ||
    pathname?.startsWith("/sign-up/");

  if (isAuthRoute) {
    return (
      <div
        className="relative min-h-dvh w-full bg-[#2C2638] text-white"
        style={{ backgroundColor: "#2C2638" }}
      >
        {children}
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-black">
      <Header />
      <main
        className="relative z-0 w-full flex-1 bg-black overflow-visible"
        style={{ backgroundColor: "#000000" }}
      >
        {children}
      </main>
    </div>
  );
}
