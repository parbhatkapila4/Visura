"use client";
import { Luggage } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const backgroundVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      rotate: -10,
    },
    visible: {
      opacity: 0.3,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const iconVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0,
      rotate: -180,
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: [0.68, -0.55, 0.265, 1.55],
      },
    },
  };

  return (
    <section className="relative" ref={ref}>
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12" >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
          variants={backgroundVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-gradient-to-br from-[#04724D] via-[#059669] to-[#10b981] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </motion.div>
        
        <motion.div 
          className="flex flex-col items-center text-center space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div 
            className="inline-flex items-center justify-center rounded-2xl bg-gray-800/80 p-2 backdrop-blur-xs border border-gray-600/50 mb-4 shadow-sm"
            variants={iconVariants}
            whileHover={{ 
              scale: 1.1,
              rotate: 5,
              transition: { duration: 0.2 }
            }}
          >
            <Luggage className="w-6 h-6 text-[#04724D]" />
          </motion.div>
          
          <motion.div 
            className="text-center mb-16"
            variants={itemVariants}
          >
            <h3 className="font-bold text-3xl max-w-2xl mx-auto px-4 sm:px-6 text-white">
              Watch how Visura distills {""}
              <motion.span 
                className="bg-gradient-to-r from-[#04724D] to-[#059669] bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                this Next.js course PDF
              </motion.span>{" "}
              into an easy-to-grasp brief!
            </h3>
          </motion.div>
          
          <motion.div 
            className="flex justify-center items-center px-2 sm:px-4 lg:px-6"
            variants={itemVariants}
          >
            {/* {Summary Viewer} */}
            <motion.div
              className="w-full max-w-4xl h-64 bg-gray-800/50 rounded-2xl border border-gray-600/50 backdrop-blur-sm flex items-center justify-center"
              whileHover={{ 
                scale: 1.02,
                borderColor: "#04724D",
                transition: { duration: 0.3 }
              }}
            >
              <motion.div
                className="text-gray-400 text-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Demo content coming soon...
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
