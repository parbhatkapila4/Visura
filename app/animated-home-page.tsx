"use client";
import HeroSection from "@/components/home/hero-section";
import FeaturesSection from "@/components/home/features-section";
import DemoSection from "@/components/home/demo-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import PricingSection from "@/components/home/pricing-section";
import CTASection from "@/components/home/cta-section";
import FooterSection from "@/components/home/footer-section";
import { useEffect } from "react";
import { toast } from "sonner";

interface AnimatedHomePageProps {
  showSuccessMessage?: boolean;
  showCancelMessage?: boolean;
}

export default function AnimatedHomePage({
  showSuccessMessage = false,
  showCancelMessage = false,
}: AnimatedHomePageProps) {
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
    <main
      className="relative"
      style={{
        transform: "translateZ(0)",
        willChange: "scroll-position",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <FooterSection />
    </main>
  );
}
