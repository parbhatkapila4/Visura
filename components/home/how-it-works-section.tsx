"use client";
import {
  Brain,
  FileAxis3D,
  FileText,
  Upload,
  Zap,
  Download,
} from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { WobbleCard } from "../ui/wobble-card";

type Step = {
  stepNumber: string;
  title: string;
  icon: ReactNode;
  description: string;
  benefits: string[];
};

const steps: Step[] = [
  {
    stepNumber: "Step One",
    title: "Upload",
    icon: <Upload size={32} strokeWidth={1.5} />,
    description:
      "Choose your PDF file and upload it to our secure platform for processing.",
    benefits: [
      "DRAG & DROP INTERFACE",
      "SUPPORTED FORMATS",
      "SECURE UPLOAD",
      "INSTANT PROCESSING",
    ],
  },
  {
    stepNumber: "Step Two",
    title: "Process",
    icon: <Brain size={32} strokeWidth={1.5} />,
    description:
      "Our advanced AI analyzes and breaks down your document content intelligently.",
    benefits: [
      "AI-POWERED ANALYSIS",
      "CONTENT EXTRACTION",
      "KEY INSIGHTS IDENTIFIED",
      "SMART SUMMARIZATION",
    ],
  },
  {
    stepNumber: "Step Three",
    title: "Download",
    icon: <Download size={32} strokeWidth={1.5} />,
    description:
      "Get your beautifully formatted summary and download it in your preferred format.",
    benefits: [
      "MULTIPLE FORMATS",
      "INSTANT DOWNLOAD",
      "SHARE EASILY",
      "SAVE TIME",
    ],
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.4,
        delayChildren: 0.2,
      },
    },
  };

  const stepVariants = {
    hidden: { 
      opacity: 0, 
      y: 100,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      rotate: -10,
    },
    visible: {
      opacity: 1,
      x: 0,
      rotate: 2,
    },
  };

  const card2Variants = {
    hidden: { 
      opacity: 0, 
      x: 50,
      rotate: 10,
    },
    visible: {
      opacity: 0.9,
      x: 0,
      rotate: -2,
    },
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      x: 50,
    },
    visible: {
      opacity: 1,
      x: 0,
    },
  };

  const benefitVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.4 + i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <section className="bg-black py-16 lg:py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="space-y-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="relative" 
              variants={stepVariants}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <WobbleCard
                containerClassName="   min-h-[500px]"
                className="p-8 lg:p-12"
              >
                <div className="text-center mb-8">
                  <motion.p 
                    className="text-orange-400 font-semibold text-sm uppercase tracking-wider mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                    transition={{ delay: 0.1 + index * 0.4 }}
                  >
                    {step.stepNumber}
                  </motion.p>
                  <motion.h3 
                    className="bg-gradient-to-r from-white to-danger bg-clip-text text-transparent font-bold text-3xl lg:text-6xl mb-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ delay: 0.2 + index * 0.4 }}
                  >
                    {step.title}
                  </motion.h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Left Side - Visual Cards */}
                  <div className="relative">
                    <div className="relative flex items-center justify-center">
                      {/* Main Card */}
                      <motion.div 
                        className="bg-green-600 rounded-2xl p-6 w-full max-w-sm shadow-lg relative z-10"
                        variants={cardVariants}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ 
                          rotate: 0,
                          scale: 1.05,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-white font-semibold text-sm">
                            VISURA.AI
                          </span>
                          <span className="text-white text-xs bg-green-500 px-2 py-1 rounded">
                            STEP {index + 1}
                          </span>
                        </div>
                        <div className="flex items-center justify-center h-20 bg-white/10 rounded-xl mb-4">
                          <motion.div 
                            className="text-white"
                            animate={{ 
                              rotate: [0, 5, -5, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.5
                            }}
                          >
                            {step.icon}
                          </motion.div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-white font-bold text-lg">
                            {step.title.toUpperCase()}
                          </h3>
                        </div>
                      </motion.div>

                      {/* Background Card */}
                      <motion.div 
                        className="absolute top-4 left-4 bg-gradient-to-br from-green-700 via-emerald-600 to-teal-500 rounded-2xl p-6 w-full max-w-sm shadow-lg opacity-90"
                        variants={card2Variants}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        whileHover={{ 
                          rotate: 0,
                          scale: 1.05,
                          transition: { duration: 0.3 }
                        }}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-white font-semibold text-sm">
                            VISURA.AI
                          </span>
                          <span className="text-white text-xs bg-emerald-500 px-2 py-1 rounded">
                            PRO
                          </span>
                        </div>
                        <div className="flex items-center justify-center h-20 bg-white/10 rounded-xl mb-4 relative">
                          <motion.div 
                            className="text-white"
                            animate={{ 
                              rotate: [0, -5, 5, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.5 + 0.5
                            }}
                          >
                            {step.icon}
                          </motion.div>
                          {/* Progress bars effect */}
                          <div className="absolute bottom-2 right-2 flex space-x-1">
                            {[4, 6, 3, 5].map((height, i) => (
                              <motion.div 
                                key={i}
                                className="w-1 bg-white/60 rounded"
                                style={{ height: `${height * 4}px` }}
                                animate={{ 
                                  scaleY: [1, 1.2, 1],
                                  opacity: [0.6, 1, 0.6]
                                }}
                                transition={{ 
                                  duration: 1.5,
                                  repeat: Infinity,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-center">
                          <h3 className="text-white font-bold text-lg">
                            {step.title.toUpperCase()}
                          </h3>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Right Side - Benefits and Description */}
                  <motion.div 
                    className="flex" 
                    variants={contentVariants}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  >
                    <div className="w-[0.5px] bg-white/20"></div>
                    <div className="space-y-6 ml-6">
                      <motion.p 
                        className="text-white text-lg leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ delay: 0.4 + index * 0.4 }}
                      >
                        {step.description}
                      </motion.p>

                      <div className="space-y-3">
                        {step.benefits.map((benefit, benefitIndex) => (
                          <motion.div 
                            key={benefitIndex} 
                            className="flex items-center"
                            custom={benefitIndex}
                            variants={benefitVariants}
                            initial="hidden"
                            animate={isInView ? "visible" : "hidden"}
                          >
                            <motion.span 
                              className="text-white/40 text-sm font-medium"
                              whileHover={{ 
                                color: "#04724D",
                                x: 5,
                                transition: { duration: 0.2 }
                              }}
                            >
                              {benefit}
                            </motion.span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </WobbleCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
