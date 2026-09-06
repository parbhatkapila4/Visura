import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ChunkState } from "./lineage-data";
import "./landing.css";

export const fmt = new Intl.NumberFormat("en-US");

export function BrandMark({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="10" r="3.25" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}

export function MonoChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("vs-chip vs-mono", className)} style={{ color: "var(--ink-2)" }}>
      {children}
    </span>
  );
}

export function ConfidenceMeter({ value }: { value: number }) {
  const filled = Math.round(value * 5);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-flex gap-[3px]" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cn("vs-tick", i < filled && "vs-tick--filled")} />
        ))}
      </span>
      <span className="vs-mono" style={{ color: "var(--ink)" }}>
        {value.toFixed(2)}
      </span>
    </span>
  );
}

export function CellStrip({
  states,
  size = 16,
  gap = 3,
  surface = "paper",
  label,
  className,
}: {
  states: ChunkState[];
  size?: number;
  gap?: number;
  surface?: "paper" | "ink";
  label: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        surface === "paper" ? "vs-cellset-paper" : "vs-cellset-ink",
        "flex flex-wrap",
        className
      )}
      style={{ gap }}
    >
      {states.map((s, i) => (
        <span
          key={i}
          className={cn("vs-cell", `vs-cell--${s}`)}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

export { PrimaryCta } from "./primary-cta";

export function SecondaryBtn({
  href,
  children,
  className,
  tone = "paper",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "cream";
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "vs-btn vs-btn-label vs-t",
        tone === "cream" ? "vs-btn-cream" : "vs-btn-secondary",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} prefetch={false} className={cn("vs-link vs-t", className)}>
      {children}
    </Link>
  );
}
