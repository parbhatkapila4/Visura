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
      transition: { staggerChildren: 0.3 },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
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
            >
              <div className="relative min-h-[400px] sm:min-h-[500px] border-2 border-gray-800/50 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-3xl" />

                <WobbleCard
                  containerClassName="h-full"
                  className="p-4 sm:p-6 lg:p-8 xl:p-12 relative z-10"
                >
                  <div className="text-center mb-6 sm:mb-8">
                    <p className="text-orange-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-2">
                      {step.stepNumber}
                    </p>
                    <h3 className="bg-gradient-to-r from-white to-danger bg-clip-text text-transparent font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-6xl mb-4">
                      {step.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
                    <div className="relative">
                      <div className="flex items-center justify-center">
                        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 rounded-3xl p-6 w-64 shadow-2xl border-2 border-blue-400/30">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-white font-semibold text-sm">
                              VISURA.AI
                            </span>
                            <span className="text-white text-xs bg-blue-500/50 px-2 py-1 rounded">
                              WEEKLY
                            </span>
                          </div>
                          <div className="flex items-center justify-center h-20 bg-white/10 rounded-xl mb-4">
                            <div className="text-white">
                              {step.icon}
                            </div>
                          </div>
                          <div className="text-center">
                            <h3 className="text-white font-bold text-lg">
                              {step.title.toUpperCase()}
                            </h3>
                            <div className="text-white/60 text-xs mt-2">
                              visura
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <p className="text-white/90 text-lg leading-relaxed">
                        {step.description}
                      </p>

                      <div className="space-y-4">
                        {step.benefits.map((benefit, benefitIndex) => (
                          <div
                            key={benefitIndex}
                            className="flex items-center"
                          >
                            <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
                              {benefit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
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
