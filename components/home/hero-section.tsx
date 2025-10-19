"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WavyBackground } from "../ui/wavy-background";
import { VideoModal } from "@/components/ui/video-modal";
import { motion } from "framer-motion";
import { useState } from "react";

export default function HeroSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12"
      colors={["#625EC3", "#625EC3", "#625EC3", "#625EC3", "#625EC3"]}
    >
      <motion.section
        className="relative mx-auto flex flex-col z-10 items-center justify-center py-8 sm:py-12 md:py-16 lg:py-20 xl:pb-28 transition-all animate-in min-h-[80vh] sm:min-h-[85vh]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="relative p-[1px] overflow-hidden rounded-full bg-gradient-to-r from-[#625EC3] via-[#625EC3] to-[#625EC3] animate-gradient-x group hover:scale-105 transition-transform duration-200 mb-4 sm:mb-6"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Badge
            variant={"secondary"}
            className="relative px-4 sm:px-6 py-2 text-sm sm:text-base font-medium bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors duration-200 flex items-center border border-gray-600"
          >
            <motion.div
              variants={pulseVariants}
              animate="animate"
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 mr-2 text-[#625EC3]" />
            </motion.div>
            <p className="text-sm sm:text-base text-white">Smart Technology</p>
          </Badge>
        </motion.div>

        <motion.h1
          className="font-bold py-2 sm:py-4 md:py-6 text-center text-white px-2 sm:px-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="block sm:inline">Transform PDFs to </span>
          <motion.span
            className="relative inline-block"
            variants={floatingVariants}
            animate="animate"
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="relative z-10 px-1 sm:px-2">insights</span>
            <span
              className="absolute inset-0 bg-[#625EC3]/30 -rotate-2 rounded-lg transform -skew-y-1"
              aria-hidden="true"
            ></span>
          </motion.span>{" "}
          <span className="block sm:inline">in seconds</span>
        </motion.h1>

        <motion.h2
          className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-center px-3 sm:px-4 md:px-6 lg:px-0 text-gray-300 leading-relaxed max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl mx-auto"
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Get a sleek summary reel of your document instantly
        </motion.h2>

        <motion.div
          variants={itemVariants}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm sm:max-w-md mx-auto"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant={"link"}
              className="text-white mt-6 sm:mt-8 md:mt-10 lg:mt-16 text-sm sm:text-base md:text-lg lg:text-xl rounded-full px-6 sm:px-8 md:px-10 lg:px-12 py-3 sm:py-4 md:py-5 lg:py-6 no-underline hover:no-underline bg-gradient-to-r from-[#625EC3] to-[#020203] hover:from-[#000000] hover:to-[#625EC3] font-bold shadow-lg transition-all duration-300 w-full"
              onClick={() => setIsVideoModalOpen(true)}
            >
              <div className="flex gap-2 items-center justify-center w-full">
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>See Visura Works</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              </div>
            </Button>
          </motion.div>
        </motion.div>
      </motion.section>
      
      <VideoModal
        videoSrc="https://lcbcrithcxdbqynfmtxk.supabase.co/storage/v1/object/public/Videos/Visura-Demo-1758303349310.mp4"
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </WavyBackground>
  );
}
