"use client";
import { Brain, Upload, Download } from "lucide-react";
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
      "Our advanced technology analyzes and breaks down your document content intelligently.",
    benefits: [
      "SMART ANALYSIS",
      "CONTENT EXTRACTION",
      "KEY INSIGHTS IDENTIFIED",
      "INTELLIGENT SUMMARIZATION",
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
    <section className="bg-black py-12 sm:py-16 lg:py-24" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="space-y-12 sm:space-y-16"
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
              <div className="relative min-h-[400px] sm:min-h-[500px] border-2 border-gray-800/50 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
                    animate={{
                      x: [0, 30, -30, 0],
                      y: [0, -30, 30, 0],
                      scale: [1, 1.1, 0.9, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full blur-3xl"
                    animate={{
                      x: [0, -30, 30, 0],
                      y: [0, 30, -30, 0],
                      scale: [1, 0.9, 1.1, 1],
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                  />

                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white/10 rounded-full"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${30 + (i % 3) * 20}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                        scale: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 3 + i * 0.5,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut",
                      }}
                    />
                  ))}

                  <motion.div
                    className="absolute top-1/4 left-1/4 w-32 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"
                    animate={{
                      scaleX: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: 1,
                    }}
                  />
                  <motion.div
                    className="absolute bottom-1/4 right-1/4 w-24 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
                    animate={{
                      scaleX: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: 2.5,
                    }}
                  />
                </div>

                <WobbleCard
                  containerClassName="h-full"
                  className="p-4 sm:p-6 lg:p-8 xl:p-12 relative z-10"
                >
                  <div className="text-center mb-6 sm:mb-8">
                    <motion.p
                      className="text-orange-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2"
                      initial={{ opacity: 0, y: -20 }}
                      animate={
                        isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
                      }
                      transition={{ delay: 0.1 + index * 0.4 }}
                    >
                      {step.stepNumber}
                    </motion.p>
                    <motion.h3
                      className="bg-gradient-to-r from-white to-danger bg-clip-text text-transparent font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-6xl mb-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={
                        isInView
                          ? { opacity: 1, scale: 1 }
                          : { opacity: 0, scale: 0.8 }
                      }
                      transition={{ delay: 0.2 + index * 0.4 }}
                    >
                      {step.title}
                    </motion.h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                    <div className="relative">
                      <div className="relative flex items-center justify-center">
                        <motion.div
                          className="absolute -left-4 top-2 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl p-6 w-64 shadow-2xl opacity-90 border-2 border-blue-400/30"
                          style={{
                            boxShadow:
                              "0 20px 40px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          }}
                          variants={card2Variants}
                          transition={{
                            duration: 0.6,
                            delay: 0.2,
                            ease: "easeOut",
                          }}
                          whileHover={{
                            rotate: -1,
                            scale: 1.02,
                            transition: { duration: 0.3 },
                          }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-white font-semibold text-sm">
                              VISURA.AI
                            </span>
                            <span className="text-white text-xs bg-blue-500/50 px-2 py-1 rounded">
                              WEEKLY
                            </span>
                          </div>
                          <div className="flex items-center justify-center h-20 bg-white/10 rounded-xl mb-4">
                            <motion.div
                              className="text-white"
                              animate={{
                                rotate: [0, -5, 5, 0],
                                scale: [1, 1.1, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.5 + 0.5,
                              }}
                            >
                              {step.icon}
                            </motion.div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-white font-bold text-lg">
                              {step.title.toUpperCase()}
                            </h3>
                            <div className="text-white/60 text-xs mt-2">
                              visura
                            </div>
                          </div>
                        </motion.div>

                        <motion.div
                          className="bg-black rounded-3xl p-6 w-64 shadow-2xl relative z-10 border-2 border-gray-700/50"
                          style={{
                            boxShadow:
                              "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                          }}
                          variants={cardVariants}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          whileHover={{
                            rotate: 1,
                            scale: 1.02,
                            transition: { duration: 0.3 },
                          }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-white font-semibold text-sm">
                              VISURA.AI
                            </span>
                            <span className="text-white text-xs bg-purple-500/50 px-2 py-1 rounded">
                              MONTHLY
                            </span>
                          </div>
                          <div className="flex items-center justify-center h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl mb-4 relative">
                            <motion.div
                              className="text-white"
                              animate={{
                                rotate: [0, 5, -5, 0],
                                scale: [1, 1.1, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: index * 0.5,
                              }}
                            >
                              {step.icon}
                            </motion.div>

                            <div className="absolute bottom-2 right-2 flex space-x-1">
                              {[4, 6, 3, 5, 7].map((height, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1 bg-gradient-to-t from-purple-400 to-cyan-400 rounded shadow-lg shadow-purple-500/50"
                                  style={{ height: `${height * 4}px` }}
                                  animate={{
                                    scaleY: [1, 1.3, 1],
                                    opacity: [0.7, 1, 0.7],
                                    boxShadow: [
                                      "0 0 5px rgba(168, 85, 247, 0.5)",
                                      "0 0 15px rgba(168, 85, 247, 0.8)",
                                      "0 0 5px rgba(168, 85, 247, 0.5)",
                                    ],
                                  }}
                                  transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-white font-bold text-lg">
                              {step.title.toUpperCase()}
                            </h3>
                            <div className="text-purple-400/60 text-xs mt-2">
                              visura
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    <motion.div
                      className="space-y-6"
                      variants={contentVariants}
                      transition={{
                        duration: 0.8,
                        delay: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      <motion.p
                        className="text-white/90 text-lg leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={
                          isInView
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 20 }
                        }
                        transition={{ delay: 0.4 + index * 0.4 }}
                      >
                        {step.description}
                      </motion.p>

                      <div className="space-y-4">
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
                              className="text-white/70 text-sm font-medium uppercase tracking-wider"
                              whileHover={{
                                color: "#8B5CF6",
                                x: 8,
                                transition: { duration: 0.2 },
                              }}
                            >
                              {benefit}
                            </motion.span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </WobbleCard>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
