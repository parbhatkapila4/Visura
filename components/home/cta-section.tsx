"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Upload, FileText, Sparkles, Zap, Shield, Brain } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-gray-900 py-20 pb-32 relative overflow-hidden" ref={ref}>
      {/* Clean Background */}
      <div className="absolute inset-0 bg-gray-900 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-block mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
                <span className="px-6 py-3 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-400 text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Trusted by professionals worldwide
                </span>
          </motion.div>
          
          <motion.h2
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Transform Documents
            <br />
            <span className="text-orange-400">
              Into Insights
            </span>
          </motion.h2>
          
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Stop wasting hours reading lengthy documents. Our smart technology extracts the key insights 
            you need in seconds, not hours.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <SignedOut>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-lg shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300"
                >
                  <Link href="/#pricing" className="flex items-center gap-2">
                    Get Started Free
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
            </SignedOut>

            <SignedIn>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="px-8 py-4 bg-gradient-to-r from-[#625EC3] to-[#A3C4C3] hover:from-[#A3C4C3] hover:to-[#625EC3] text-white font-bold text-lg rounded-full shadow-2xl shadow-[#625EC3]/30 hover:shadow-[#625EC3]/50 transition-all duration-300"
                  >
                    <Link href="/upload" className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload PDF
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-4 border-2 border-[#625EC3] text-white hover:bg-[#625EC3] hover:text-white font-bold text-lg rounded-full transition-all duration-300"
                  >
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      View Summaries
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </SignedIn>
          </motion.div>
        </motion.div>

        {/* Feature Showcase */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            {
              icon: Zap,
              title: "Lightning Fast",
              description: "Process any document in seconds with our advanced AI technology",
              color: "from-yellow-500/20 to-orange-500/20",
              iconColor: "text-yellow-400",
              borderColor: "border-yellow-500/30"
            },
            {
              icon: Brain,
              title: "Smart Analysis",
              description: "Advanced algorithms understand context and extract key insights",
              color: "from-blue-500/20 to-cyan-500/20",
              iconColor: "text-blue-400",
              borderColor: "border-blue-500/30"
            },
            {
              icon: Shield,
              title: "Secure & Private",
              description: "Enterprise-grade security protects your documents and data",
              color: "from-green-500/20 to-emerald-500/20",
              iconColor: "text-green-400",
              borderColor: "border-green-500/30"
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className={`relative p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl hover:border-[#625EC3]/50 transition-all duration-300 overflow-hidden ${feature.borderColor}`}>
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 mb-6 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#625EC3] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
