"use client";
import { FileText, Brain, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <>
      <section className="py-20 bg-black" ref={ref}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.h2 
              className="text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              See Visura in Action
            </motion.h2>
            <motion.p 
              className="text-xl text-neutral-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Watch how our AI transforms complex documents into clear, actionable insights in seconds
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <motion.div
              className="text-center md:text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.h3 
                className="text-3xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                From Document to Insights
              </motion.h3>
              <motion.p 
                className="text-lg text-neutral-300 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Upload any document and watch as our AI extracts key information, 
                generates summaries, and provides actionable insights in real-time.
              </motion.p>

              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {[
                  { icon: FileText, title: "Lightning Fast", description: "Documents analyzed and summarized in under 30 seconds", bgColor: "bg-slate-800" },
                  { icon: Brain, title: "AI-Powered Analysis", description: "Advanced algorithms extract key insights and patterns", bgColor: "bg-gray-800" },
                  { icon: Zap, title: "Multiple Formats", description: "Export summaries as PDF, Word, or share via link", bgColor: "bg-neutral-800" }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div 
                      key={index}
                      className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.6, delay: 0.8 + (index * 0.1), ease: [0.25, 0.46, 0.45, 0.94] }}
                      whileHover={{ 
                        x: 10,
                        transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                      }}
                    >
                      <motion.div 
                        className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
                        whileHover={{ 
                          scale: 1.1, 
                          rotate: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <Icon className="w-6 h-6 text-slate-300" />
                      </motion.div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                        <p className="text-neutral-300">{item.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Demo Video */}
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div 
                className="relative w-full max-w-lg"
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                }}
              >
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  >
                    <source src="/Visura%20AI-1762578271796.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

    </>
  );
}
