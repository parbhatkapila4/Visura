"use client";
import { usePathname } from "next/navigation";
import { Component as FlickeringFooter } from "@/components/ui/flickering-footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname !== "/") {
    return null;
  }

  return <FlickeringFooter />;
}
