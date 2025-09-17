"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WavyBackground } from "../ui/wavy-background";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
    },
  };

  return (
    <WavyBackground 
      className="max-w-7xl mx-auto px-4 lg:px-12"
      colors={["#625EC3", "#625EC3", "#625EC3", "#625EC3", "#625EC3"]}
     
    >
      <motion.section 
        className="relative mx-auto flex flex-col z-10 items-center justify-center py-16 sm:py-20 lg:pb-28 transition-all animate-in"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="relative p-[1px] overflow-hidden rounded-full bg-gradient-to-r from-[#625EC3] via-[#625EC3] to-[#625EC3] animate-gradient-x group hover:scale-105 transition-transform duration-200"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Badge
            variant={"secondary"}
            className="relative px-6 py-2 text-base font-medium bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors duration-200 flex items-center border border-gray-600"
          >
            <motion.div
              variants={pulseVariants}
              animate="animate"
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-6 w-6 mr-2 text-[#625EC3]" />
            </motion.div>
            <p className="text-base text-white">Powered by AI</p>
          </Badge>
        </motion.div>
        
        <motion.h1 
          className="font-bold py-6 text-center text-white"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Transform PDFs to{" "}
          <motion.span 
            className="relative inline-block"
            variants={floatingVariants}
            animate="animate"
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="relative z-10 px-2 ">insights</span>
            <span
              className="absolute inset-0 bg-[#625EC3]/30 -rotate-2 rounded-lg transform -skew-y-1"
              aria-hidden="true"
            ></span>
          </motion.span>{" "}
          in seconds
        </motion.h1>
        
        <motion.h2 
          className="text-lg sm:text-xl lg:text-2xl text-center px-4 lg:px-0 lg:max-w-4xl text-gray-300"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Get a sleek summary reel of your document instantly
        </motion.h2>
        
        <motion.div 
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant={"link"}
              className="text-white mt-6 text-base sm:text-lg lg:text-xl rounded-full px-8 sm:px-10 lg:px-12 py-6 sm:py-7 lg:py-8 lg:mt-16 no-underline hover:no-underline bg-gradient-to-r from-[#625EC3] to-[#020203] hover:from-[#000000] hover:to-[#625EC3] font-bold shadow-lg transition-all duration-300"
            >
              <Link href="/#pricing" className="flex gap-2 items-center">
                <span>Try Visura</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight />
                </motion.div>
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>
    </WavyBackground>
  );
}
