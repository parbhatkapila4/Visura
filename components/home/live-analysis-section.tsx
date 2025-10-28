"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Clock, 
  ShoppingBag, 
  Code
} from "lucide-react";

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
        "Multi-language support"
      ],
      iconType: "no-entry"
    },
    {
      title: "Document Processing",
      description: "Advanced document analysis with intelligent content understanding",
      features: [
        "PDF text extraction and analysis",
        "Image and table recognition",
        "Document structure analysis",
        "Content categorization"
      ],
      iconType: "open-sign"
    },
    {
      title: ">_ API Integration",
      description: "Developer-friendly API for seamless integration with your existing workflow",
      features: [
        "RESTful API endpoints",
        "Webhook notifications",
        "SDK for popular languages",
        "Custom integration support",
        "Batch processing capabilities",
        "Real-time status updates",
        "Comprehensive documentation"
      ],
      iconType: "command-prompt",
      twoColumn: true
    }
  ];

  return (
    <section className="py-20 bg-gray-100" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Large Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl font-bold text-gray-900 mb-6">
            AI Document Analysis
          </h2>
        </motion.div>

        {/* Cards Grid - Buttery Smooth */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {cards.map((card, index) => {
            const renderIcon = () => {
              switch (card.iconType) {
                case "no-entry":
                  return (
                    <motion.div 
                      className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </motion.div>
                  );
                case "open-sign":
                  return (
                    <motion.div 
                      className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, y: -2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </motion.div>
                  );
                case "command-prompt":
                  return (
                    <motion.div 
                      className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <span className="text-white text-xl font-mono">{'>'}_</span>
                    </motion.div>
                  );
                default:
                  return null;
              }
            };

            return (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={isInView ? { 
                  opacity: 1, 
                  y: 0, 
                  scale: 1 
                } : { 
                  opacity: 0, 
                  y: 50, 
                  scale: 0.9 
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: index * 0.1,
                  duration: 0.6
                }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25 
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg p-8 h-full cursor-pointer"
                  whileHover={{ 
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    transition: { duration: 0.3 }
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="flex items-start gap-6 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ 
                      delay: index * 0.1 + 0.2,
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                  >
                    {renderIcon()}
                    
                    <div className="flex-1 min-w-0">
                      <motion.h3 
                        className="text-2xl font-bold text-black mb-3"
                        whileHover={{ color: "#f97316" }}
                        transition={{ duration: 0.2 }}
                      >
                        {card.title}
                      </motion.h3>
                      
                      <motion.p 
                        className="text-black text-base mb-6 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ 
                          delay: index * 0.1 + 0.4,
                          duration: 0.5
                        }}
                      >
                        {card.description}
                      </motion.p>
                    </div>
                  </motion.div>
                  
                  <motion.ul 
                    className={`space-y-2 ${card.twoColumn ? 'grid grid-cols-2 gap-x-6' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ 
                      delay: index * 0.1 + 0.6,
                      duration: 0.5,
                      staggerChildren: 0.1
                    }}
                  >
                    {card.features.map((item, itemIndex) => (
                      <motion.li 
                        key={itemIndex} 
                        className="text-black text-sm flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                        transition={{ 
                          delay: index * 0.1 + 0.8 + itemIndex * 0.05,
                          duration: 0.3
                        }}
                        whileHover={{ 
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <span className="text-gray-500 mr-2 flex-shrink-0 mt-0.5 text-sm">
                          {card.iconType === "command-prompt" ? ">" : "•"}
                        </span>
                        <span className="leading-relaxed">{item}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
