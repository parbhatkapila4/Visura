"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Play, Clock, Square, Home, Settings, FileText, Bot, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="min-h-screen relative overflow-hidden" ref={ref}>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Content */}
        <div className="text-center space-y-12 pt-16">
          {/* Main Headline */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.h1 
              className="text-5xl sm:text-6xl md:text-8xl font-bold text-center break-words hyphens-auto max-w-full bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 leading-tight overflow-y-hidden max-h-[calc(100vh-8rem)] mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Transform Documents
              <br />
              <motion.span 
                className="text-orange-500 drop-shadow-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Into Insights
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-base sm:text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="font-bold text-white">VISURA</span> is an AI-powered document analysis platform that transforms 
              complex PDFs, reports, and documents into clear, actionable insights in seconds. 
              Perfect for professionals, researchers, and businesses who need to extract value from documents quickly.
            </motion.p>
          </motion.div>

          {/* CTA Button */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <SignedOut>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Button
                  size="lg"
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/sign-up">Get Started Free</Link>
                </Button>
              </motion.div>
            </SignedOut>
            <SignedIn>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Button
                  size="lg"
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href="/upload">Upload Document</Link>
                </Button>
              </motion.div>
            </SignedIn>
          </motion.div>

          {/* Product Mockup */}
          <motion.div 
            className="relative mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="w-full max-w-4xl mx-auto">
              <motion.div 
                className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
                whileHover={{ 
                  scale: 1.02, 
                  y: -5,
                  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  {/* Left - Document Input */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-orange-500" />
                      <span className="font-semibold text-gray-900">Upload Document</span>
                    </div>
                    <motion.div 
                      className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200 hover:border-orange-300 transition-colors duration-300"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 animate-bounce" />
                        <p>Drop your PDF here</p>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Center - AI Processing */}
                  <motion.div 
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, delay: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <motion.div 
                      className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Bot className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          animate={{ width: ["0%", "75%", "100%", "75%"] }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        ></motion.div>
                      </div>
                      <motion.p 
                        className="text-sm text-gray-600"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        AI Processing...
                      </motion.p>
                    </div>
                  </motion.div>

                  {/* Right - Results */}
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                    transition={{ duration: 0.8, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Zap className="w-6 h-6 text-green-500" />
                      </motion.div>
                      <span className="font-semibold text-gray-900">Get Insights</span>
                    </div>
                    <motion.div 
                      className="bg-green-50 rounded-lg p-4 border border-green-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="space-y-2">
                        <motion.div 
                          className="h-2 bg-green-200 rounded w-full"
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 1, delay: 1.2 }}
                        ></motion.div>
                        <motion.div 
                          className="h-2 bg-green-200 rounded w-3/4"
                          initial={{ width: 0 }}
                          animate={{ width: "75%" }}
                          transition={{ duration: 1, delay: 1.3 }}
                        ></motion.div>
                        <motion.div 
                          className="h-2 bg-green-200 rounded w-1/2"
                          initial={{ width: 0 }}
                          animate={{ width: "50%" }}
                          transition={{ duration: 1, delay: 1.4 }}
                        ></motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Feature Section - Clean Icons */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="text-center">
            {/* Clock Icon */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">AI-Powered Analysis</h3>
            <p className="text-sm text-neutral-300 leading-tight">
              Advanced AI algorithms extract<br />
              key insights, summarize content,<br />
              and identify important patterns
            </p>
          </div>

          <div className="text-center">
            {/* Apps Grid Icon */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M17 6h2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multiple Formats</h3>
            <p className="text-sm text-neutral-300 leading-tight">
              Support for PDF, Word, PowerPoint,<br />
              and more document types with<br />
              seamless processing
            </p>
          </div>

          <div className="text-center">
            {/* Smart Home Icon */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 6l2-2 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 6l2-2 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 8v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                <path d="M10 10h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                <path d="M10 12h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Secure & Private</h3>
            <p className="text-sm text-neutral-300 leading-tight">
              Enterprise-grade security with<br />
              encrypted processing and<br />
              data privacy protection
            </p>
          </div>

          <div className="text-center">
            {/* Star/Asterisk Icon */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Export & Share</h3>
            <p className="text-sm text-neutral-300 leading-tight">
              Download summaries in multiple<br />
              formats, share with teams,<br />
              and integrate with your workflow
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
