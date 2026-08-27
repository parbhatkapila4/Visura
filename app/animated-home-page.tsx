"use client";
import CombinedFeaturedSection from "@/components/combined-featured-section";
import DemoSection from "@/components/home/demo-section";
import BuiltForProfessionalsSection from "@/components/home/built-for-professionals-section";
import PricingSection from "@/components/home/pricing-section";
import CTAWithVerticalMarquee from "@/components/ui/cta-with-text-marquee";
import { Component as FlickeringFooter } from "@/components/ui/flickering-footer";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion, useScroll } from "framer-motion";

interface AnimatedHomePageProps {
  showSuccessMessage?: boolean;
  showCancelMessage?: boolean;
}

export default function AnimatedHomePage({
  showSuccessMessage = false,
  showCancelMessage = false,
}: AnimatedHomePageProps) {
  const { scrollYProgress } = useScroll();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.setAttribute("data-visura-home-ready", "true");
    return () => el.removeAttribute("data-visura-home-ready");
  }, []);

  useEffect(() => {
    if (showSuccessMessage) {
      toast.success("Payment Successful!", {
        description: "Welcome to Pro! You now have unlimited access to all features.",
        duration: 5000,
      });
    }
    if (showCancelMessage) {
      toast.error("Payment Cancelled", {
        description: "Your payment was cancelled. You can try again anytime.",
        duration: 4000,
      });
    }
  }, [showSuccessMessage, showCancelMessage]);

  return (
    <div
      ref={rootRef}
      className="relative bg-black min-h-screen"
      style={{ backgroundColor: "#000000" }}
    >
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-white/20 origin-left z-[100]"
        style={{ scaleX: scrollYProgress }}
      />
      <main
        className="relative bg-black flex flex-col gap-y-32 md:gap-y-40 lg:gap-y-48"
        style={{
          backgroundColor: "#000000",
          transform: "translateZ(0)",
          willChange: "scroll-position",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        <CombinedFeaturedSection />
        <DemoSection />
        <BuiltForProfessionalsSection />
        <PricingSection />
        <CTAWithVerticalMarquee />
        <FlickeringFooter />
      </main>
    </div>
  );
}
