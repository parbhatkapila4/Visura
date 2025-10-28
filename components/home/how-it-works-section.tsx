"use client";
import { Brain, Upload, Download, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Upload Your Document",
    description: "Simply drag and drop your PDF, Word, or PowerPoint file into our secure platform. We support all major document formats with instant processing.",
    icon: Upload,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Drag & drop interface",
      "PDF, Word, PowerPoint support",
      "Secure cloud processing",
      "Instant file validation"
    ]
  },
  {
    number: "02",
    title: "AI Analysis & Processing",
    description: "Our advanced AI algorithms analyze your document, extract key information, identify patterns, and understand context to deliver meaningful insights and summaries.",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    features: [
      "Context-aware analysis",
      "Key insight extraction",
      "Pattern recognition",
      "Intelligent summarization"
    ]
  },
  {
    number: "03",
    title: "Get Your Summary",
    description: "Receive a comprehensive, executive-ready summary with key insights, actionable recommendations, and downloadable reports in your preferred format.",
    icon: Download,
    color: "from-green-500 to-emerald-500",
    features: [
      "Executive summaries",
      "PDF, Word, and text exports",
      "Shareable report links",
      "Actionable insights and recommendations"
    ]
  }
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform any document into clear, actionable insights in three simple steps. 
            Our AI analyzes, summarizes, and extracts key information so you can focus on what matters.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-b from-gray-600 to-transparent z-0" />
                )}

                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>
                  {/* Content */}
                  <div className={`${!isEven ? 'lg:col-start-2' : ''}`}>
                    <div className="relative">
                      {/* Step Number */}
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-bold text-xl mb-6">
                        {step.number}
                      </div>

                      <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                        {step.title}
                      </h3>

                      <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        {step.description}
                      </p>

                      {/* Features List */}
                      <div className="space-y-4">
                        {step.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                            transition={{ duration: 0.6, delay: (index * 0.2) + (featureIndex * 0.1) }}
                          >
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Visual */}
                  <div className={`${!isEven ? 'lg:col-start-1' : ''}`}>
                    <motion.div
                      className="relative group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Background Glow */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-20 rounded-3xl blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
                      
                      {/* Card */}
                      <div className="relative p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl group-hover:border-gray-600/50 transition-all duration-300">
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-xl flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="text-white font-semibold text-lg">Visura AI</h4>
                              <p className="text-gray-400 text-sm">Processing</p>
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
                            <span className="text-green-400 text-xs font-medium">ACTIVE</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8">
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Processing Document</span>
                            <span>85%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                              className={`h-2 bg-gradient-to-r ${step.color} rounded-full`}
                              initial={{ width: 0 }}
                              animate={isInView ? { width: "85%" } : { width: 0 }}
                              transition={{ duration: 2, delay: index * 0.5 }}
                            />
                          </div>
                        </div>

                        {/* Content Preview */}
                        <div className="space-y-4">
                          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                        </div>

                        {/* Status */}
                        <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>AI Analysis Complete</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full text-blue-400 font-medium">
            <ArrowRight className="w-5 h-5" />
            Ready to get started? Upload your first document for analysis
          </div>
        </motion.div>
      </div>
    </section>
  );
}
