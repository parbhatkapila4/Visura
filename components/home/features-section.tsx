"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { 
  FileText, 
  Hash, 
  Star, 
  Settings,
  Clock,
  Activity
} from "lucide-react";

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: FileText,
      title: "Smart Summarization",
      description: "AI-powered document summarization and analysis",
      features: [
        "Executive summary generation",
        "Key points extraction",
        "Context-aware analysis",
        "Multi-language support"
      ],
      iconColor: "bg-blue-500"
    },
    {
      icon: Hash,
      title: "Document Processing",
      description: "Advanced document analysis capabilities",
      features: [
        "PDF text extraction",
        "Image and table recognition",
        "Document structure analysis",
        "Content categorization"
      ],
      iconColor: "bg-green-500"
    },
    {
      icon: Star,
      title: "Export & Share",
      description: "Flexible output options for your summaries",
      features: [
        "Multiple export formats",
        "Shareable links",
        "Team collaboration",
        "Download options"
      ],
      iconColor: "bg-purple-500"
    },
    {
      icon: Settings,
      title: "API Integration",
      description: "Developer-friendly integration options",
      features: [
        "RESTful API endpoints",
        "Webhook notifications",
        "SDK libraries",
        "Custom integrations"
      ],
      iconColor: "bg-orange-500"
    }
  ];

  return (
    <section className="py-20 bg-black" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Powerful Document Analysis
          </h2>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Left Column - Features */}
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    className="group"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 ${feature.iconColor} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {feature.title}
                        </h3>
                        
                        <p className="text-sm text-neutral-300 mb-3 w-full leading-relaxed">
                          {feature.description}
                        </p>
                        
                        <ul className="space-y-1">
                          {feature.features.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-sm text-neutral-300 flex items-center">
                              <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full mr-2 flex-shrink-0"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Status Card */}
          <motion.div
            className="lg:sticky lg:top-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-gray-900 rounded-2xl shadow-lg border border-gray-700 p-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-white mb-4">
                  85%
                </div>
                <div className="text-lg font-bold text-orange-500 mb-6">
                  PROCESSING
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
