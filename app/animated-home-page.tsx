"use client";
import CTASection from "@/components/home/cta-section";
import DemoSection from "@/components/home/demo-section";
import HeroSection from "@/components/home/hero-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import PricingSection from "@/components/home/pricing-section";
import { motion } from "framer-motion";

export default function AnimatedHomePage() {
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
