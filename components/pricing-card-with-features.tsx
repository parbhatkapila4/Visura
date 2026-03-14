"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FaCheck } from "react-icons/fa6";
import { ArrowRight } from "lucide-react";

export interface PricingCardFeature {
  label: string;
  info: string;
}

export interface PricingCardWithFeaturesProps {
  title: string;
  subtitle: string;
  features: PricingCardFeature[];
  price: string;
  priceLabel?: string;
  buttonText: string;
  buttonHref: string;
  primary?: boolean;
  dark?: boolean;
  className?: string;
}

export function PricingCardWithFeatures({
  title,
  subtitle,
  features,
  price,
  priceLabel = "Starting from",
  buttonText,
  buttonHref,
  primary = true,
  dark = false,
  className,
}: PricingCardWithFeaturesProps): React.ReactElement {
  const isDark = dark;

  return (
    <Card
      className={cn(
        "w-full max-w-[420px] rounded-2xl border p-6 md:p-8 flex flex-col gap-6 flex-1 min-h-0 relative overflow-hidden",
        "transition-all duration-300 ease-out",
        isDark
          ? "border-white/[0.08] text-gray-200 bg-gradient-to-b from-zinc-900 to-zinc-900/95 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset,0_4px_24px_-4px_rgba(0,0,0,0.5),0_12px_48px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset,0_8px_32px_-8px_rgba(0,0,0,0.5),0_20px_56px_-16px_rgba(0,0,0,0.45)] hover:-translate-y-1"
          : "border-border bg-card text-card-foreground shadow-sm hover:shadow-md hover:-translate-y-0.5",
        primary && isDark &&
        "border-blue-500/20 shadow-[0_0_0_1px_rgba(59,130,246,0.15)_inset,0_0_0_1px_rgba(255,255,255,0.06)_inset,0_4px_24px_-4px_rgba(0,0,0,0.5),0_12px_48px_-12px_rgba(0,0,0,0.4)] hover:shadow-[0_0_0_1px_rgba(59,130,246,0.2)_inset,0_0_0_1px_rgba(255,255,255,0.08)_inset,0_8px_32px_-8px_rgba(0,0,0,0.5),0_20px_56px_-16px_rgba(0,0,0,0.45),0_0_24px_-8px_rgba(59,130,246,0.12)] hover:-translate-y-1",
        className
      )}
    >
      {primary && isDark && (
        <div
          className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/40 via-blue-400/30 to-transparent pointer-events-none"
          aria-hidden
        />
      )}

      <div className="shrink-0 space-y-1.5 relative">
        <h2
          className={cn(
            "text-2xl font-semibold tracking-tight",
            isDark ? "text-white" : ""
          )}
          style={isDark ? { fontFamily: "var(--font-display), ui-serif, Georgia, serif" } : undefined}
        >
          {title}
        </h2>
        <p className={cn("text-sm leading-relaxed", isDark ? "text-gray-400" : "text-muted-foreground")}>
          {subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-3 flex-1 min-h-0">
        <div className="shrink-0 flex flex-col gap-2">
          <span className={cn("text-[11px] font-medium uppercase tracking-[0.2em]", isDark ? "text-gray-500" : "text-muted-foreground")}>
            What&apos;s included
          </span>
          <div className={cn("h-px w-8", isDark ? "bg-white/10" : "bg-border")} />
        </div>
        <CardContent
          className={cn(
            "rounded-xl border px-5 py-5 md:px-6 md:py-6 flex flex-col flex-1 min-h-[300px] relative",
            isDark
              ? "border-white/[0.06] bg-black/50 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_2px_8px_rgba(0,0,0,0.2)]"
              : "border-border bg-background"
          )}
          style={isDark ? { backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "16px 16px" } : undefined}
        >
          {features.map((f, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div className="flex flex-col">
                  <div
                    className={cn(
                      "flex items-center gap-3 cursor-pointer select-none transition-colors group py-2.5 -mx-1 px-1 rounded-lg",
                      isDark ? "text-gray-300 hover:text-white hover:bg-white/[0.03]" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors",
                        isDark
                          ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      <FaCheck className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-sm leading-snug">{f.label}</span>
                  </div>
                  {i < features.length - 1 && (
                    <div className={cn("h-px shrink-0", isDark ? "bg-white/[0.05]" : "bg-border")} />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className={cn(
                  "max-w-[260px] text-sm rounded-lg px-3 py-2 shadow-lg border",
                  isDark ? "bg-zinc-800 border-gray-600 text-gray-100" : "bg-popover text-popover-foreground border-border"
                )}
              >
                {f.info}
              </TooltipContent>
            </Tooltip>
          ))}
        </CardContent>
      </div>

      <div className="shrink-0 flex flex-col">
        <div className={cn("h-px w-full mb-6", isDark ? "bg-white/[0.06]" : "bg-border")} />
        <div className={cn("rounded-xl p-4 -mx-1", isDark && "bg-white/[0.02]")}>
          <div className="flex items-end justify-between gap-6">
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-gray-500" : "text-muted-foreground")}>
                {priceLabel}
              </span>
              <span className={cn("text-3xl font-semibold tracking-tight tabular-nums", isDark ? "text-white" : "")}>
                {price}
              </span>
            </div>

            <Link
              href={buttonHref}
              className={cn(
                "flex items-center justify-center gap-2 min-w-[140px] h-12 px-6 rounded-xl text-base font-semibold text-white shrink-0 relative",
                "bg-gradient-to-b from-blue-500 to-blue-600 text-white",
                "border border-blue-400/30",
                "shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_2px_8px_rgba(59,130,246,0.25),0_4px_16px_-4px_rgba(59,130,246,0.2)]",
                "hover:brightness-110 transition-all duration-200"
              )}
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function Box(): React.ReactElement {
  return (
    <TooltipProvider>
      <PricingCardWithFeatures
        title="Full GPT App Development"
        subtitle="Tailor solution for your case"
        features={[
          { label: "Complete App development", info: "End-to-end GPT app delivery." },
          { label: "Custom UI/UX Interfaces for ChatGPT", info: "Optimized conversational design." },
          { label: "Backend API integration", info: "Seamless OpenAI + third-party API integration." },
          { label: "OAuth authentication setup trough OpenAI", info: "Implements secure OAuth sign-in." },
          { label: "Production deployment", info: "Deployment on Vercel or preferred host." },
          { label: "Updates every 48h", info: "Frequent feature & patch releases." },
          { label: "30-90 days post-launch support", info: "Ongoing stability & support." },
          { label: "Handling submission process with OpenAI", info: "App review & approval assistance." },
        ]}
        price="$3499"
        buttonText="Book a call"
        buttonHref="#"
        dark
      />
    </TooltipProvider>
  );
}
