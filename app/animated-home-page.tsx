"use client";
import CTASection from "@/components/home/cta-section";
import DemoSection from "@/components/home/demo-section";
import HeroSection from "@/components/home/hero-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import PricingSection from "@/components/home/pricing-section";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "sonner";

interface AnimatedHomePageProps {
  showSuccessMessage?: boolean;
  showCancelMessage?: boolean;
}

export default function AnimatedHomePage({ 
  showSuccessMessage = false, 
  showCancelMessage = false 
}: AnimatedHomePageProps) {
  // Show success message if payment was successful
  useEffect(() => {
    if (showSuccessMessage) {
      toast.success("Payment Successful!", {
        description: "Welcome to Pro plan! You now have unlimited access to all features.",
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <motion.div 
      className="flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        variants={sectionVariants}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <HeroSection />
      </motion.div>
      <motion.div 
        variants={sectionVariants}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <DemoSection />
      </motion.div>
      <motion.div 
        variants={sectionVariants}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <HowItWorksSection />
      </motion.div>
      <motion.div 
        variants={sectionVariants}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <PricingSection />
      </motion.div>
      <motion.div 
        variants={sectionVariants}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <CTASection />
      </motion.div>
    </motion.div>
  );
}
