"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, Brain, BarChart3, ScanSearch, ArrowRight, CheckCircle } from "lucide-react";

export default function LiveAnalysisSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      title: "Smart Summarization",
      description: "AI-powered document summarization that extracts key insights and main points",
      features: [
        "Executive summary generation",
        "Key points extraction",
        "Context-aware analysis",
        "Multi-language support",
      ],
      icon: FileText,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      accentColor: "orange",
    },
    {
      title: "Document Processing",
      description: "Advanced document analysis with intelligent content understanding",
      features: [
        "PDF text extraction and analysis",
        "Image and table recognition",
        "Document structure analysis",
        "Content categorization",
      ],
      icon: Brain,
      gradient: "from-orange-600 to-amber-500",
      bgGradient: "from-orange-50 to-amber-50",
      accentColor: "orange",
    },
    {
      title: "Smart Analytics",
      description: "Advanced insights and analytics to track your document processing performance",
      features: [
        "Processing time analytics",
        "Document type insights",
        "Usage statistics",
        "Performance metrics",
        "Export analytics data",
        "Visual dashboards",
        "Historical trends",
      ],
      icon: BarChart3,
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-50 to-amber-50",
      accentColor: "orange",
      twoColumn: true,
    },
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))] -z-10" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-red-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ScanSearch className="w-4 h-4" />
            Powered by Advanced AI
          </motion.div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-orange-400 to-red-400 bg-clip-text text-transparent mb-6 leading-tight">
            AI Document Analysis
          </h2>

          <motion.p
            className="text-xl text-neutral-300 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Transform complex documents into actionable insights with our cutting-edge AI
            technology. Experience the future of document intelligence.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.2 }}
        >
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{
                  y: -12,
                  transition: {
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  },
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <motion.div
                  className={`relative bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 h-full overflow-hidden group-hover:border-${card.accentColor}-400/50 transition-all duration-500`}
                  whileHover={{
                    boxShadow: "0 32px 64px -12px rgba(0, 0, 0, 0.3)",
                    borderColor: `rgb(var(--${card.accentColor}-400))`,
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                    <div
                      className={`w-full h-full bg-gradient-to-br ${card.gradient} rounded-full blur-2xl`}
                    />
                  </div>

                  <motion.div
                    className="relative mb-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{
                      delay: index * 0.2 + 0.3,
                      duration: 0.6,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                  >
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                        transition: { duration: 0.3 },
                      }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    <motion.div
                      className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${card.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  <div className="relative space-y-4 text-center md:text-left">
                    <motion.h3
                      className={`text-2xl font-bold text-white group-hover:text-${card.accentColor}-400 transition-colors duration-300`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{
                        delay: index * 0.2 + 0.4,
                        duration: 0.6,
                      }}
                    >
                      {card.title}
                    </motion.h3>

                    <motion.div
                      className="text-neutral-300 text-base leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{
                        delay: index * 0.2 + 0.5,
                        duration: 0.6,
                      }}
                    >
                      {card.description}
                    </motion.div>

                    <motion.div
                      className={`space-y-3 ${
                        card.twoColumn ? "grid grid-cols-2 gap-x-4 gap-y-3" : ""
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{
                        delay: index * 0.2 + 0.6,
                        duration: 0.6,
                        staggerChildren: 0.1,
                      }}
                    >
                      {card.features.map((item, itemIndex) => (
                        <motion.div
                          key={itemIndex}
                          className="flex items-start justify-start gap-3 group/item"
                          initial={{ opacity: 0, x: -10 }}
                          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                          transition={{
                            delay: index * 0.2 + 0.7 + itemIndex * 0.05,
                            duration: 0.4,
                          }}
                          whileHover={{
                            x: 4,
                            transition: { duration: 0.2 },
                          }}
                        >
                          <motion.div
                            className={`w-2 h-2 bg-gradient-to-r ${card.gradient} rounded-full flex-shrink-0 mt-1.5`}
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.2 }}
                          />
                          <span className="text-neutral-300 text-sm leading-relaxed group-hover/item:text-white transition-colors duration-200">
                            {item}
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
