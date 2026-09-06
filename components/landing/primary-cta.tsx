"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function PrimaryCta({
  label = "Upload a document",
  className,
  variant = "ink",
  size = "md",
}: {
  label?: string;
  className?: string;
  variant?: "ink" | "accent";
  size?: "md" | "lg";
}) {
  const { isSignedIn } = useAuth();
  return (
    <Link
      href={isSignedIn ? "/upload" : "/sign-up"}
      prefetch={false}
      className={cn(
        "vs-btn vs-btn-label vs-t",
        variant === "accent" ? "vs-btn-accent" : "vs-btn-primary",
        size === "lg" && "vs-btn-lg",
        className
      )}
    >
      {label}
    </Link>
  );
}
