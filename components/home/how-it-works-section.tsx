"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Upload, Sparkles, FileText, MessageSquare, ArrowRight, Check } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Document",
    description: "Drag and drop any PDF, Word doc, or PowerPoint. Our system handles files up to 50MB with ease.",
    features: ["PDF, DOCX, PPTX support", "Drag & drop or click to upload", "Secure encrypted transfer"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Analyzes Content",
    description: "Our advanced AI reads, understands context, and identifies the most important information.",
    features: ["Neural network processing", "Context understanding", "Key point extraction"],
    color: "from-orange-500 to-amber-500",
  },
  {
    number: "03",
    icon: FileText,
    title: "Get Your Summary",
    description: "Receive a beautifully formatted summary with key insights, bullet points, and action items.",
    features: ["Structured summaries", "Key takeaways highlighted", "Export in any format"],
    color: "from-emerald-500 to-green-500",
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "Chat & Ask Questions",
    description: "Have follow-up questions? Chat with your document to get instant, accurate answers.",
    features: ["Natural conversation", "Instant responses", "Deep document understanding"],
    color: "from-purple-500 to-pink-500",
  },
];

const StepCard = ({ step, index, isActive, onClick }: { 
  step: typeof steps[0]; 
  index: number; 
  isActive: boolean;
  onClick: () => void;
}) => {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      onClick={onClick}
      className={`relative cursor-pointer group ${isActive ? 'z-10' : 'z-0'}`}
    >
      {/* Connection line to next step */}
      {index < steps.length - 1 && (
        <div className="hidden lg:block absolute top-1/2 left-full w-full h-[2px] -translate-y-1/2 z-0">
          <motion.div
            className={`h-full bg-gradient-to-r ${step.color} rounded-full`}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 + 0.3 }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      )}

      <motion.div
        className={`relative p-6 rounded-2xl border transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20 shadow-2xl' 
            : 'bg-gray-900/50 border-white/5 hover:border-white/10'
        }`}
        whileHover={{ scale: 1.02 }}
        animate={isActive ? { scale: 1.05 } : { scale: 1 }}
      >
        {/* Step number */}
        <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-sm`}>
          {step.number}
        </div>

        {/* Icon */}
        <motion.div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${step.color} bg-opacity-20 flex items-center justify-center mb-4`}
          animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
        <p className="text-white/60 text-sm mb-4">{step.description}</p>

        {/* Features */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={isActive ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="pt-4 border-t border-white/10 space-y-2">
            {step.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                <Check className="w-4 h-4 text-emerald-400" />
                {feature}
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Visual demo showing the process
const ProcessDemo = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative mt-20"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-blue-500/10 blur-3xl" />
      
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl border border-white/10 p-8 overflow-hidden">
        {/* Top light bar */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500"
          animate={{ 
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 100%" }}
        />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1: Upload */}
          <div className="text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/20 flex items-center justify-center"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Upload className="w-8 h-8 text-blue-400" />
            </motion.div>
            <div className="text-sm font-semibold text-white mb-1">Upload</div>
            <div className="text-xs text-white/50">Drop your file</div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-6 h-6 text-white/30" />
            </motion.div>
          </div>

          {/* Step 2: Process */}
          <div className="text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-500/20 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-orange-400" />
            </motion.div>
            <div className="text-sm font-semibold text-white mb-1">Process</div>
            <div className="text-xs text-white/50">AI magic happens</div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center">
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              <ArrowRight className="w-6 h-6 text-white/30" />
            </motion.div>
          </div>

          {/* Step 3: Result */}
          <div className="text-center md:col-start-4">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/20 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileText className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <div className="text-sm font-semibold text-white mb-1">Result</div>
            <div className="text-xs text-white/50">Get insights</div>
          </div>
        </div>

        {/* Processing bar */}
        <div className="mt-8 bg-white/5 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-orange-500 to-emerald-500 rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: "50%" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section ref={ref} id="demo" className="relative py-32 bg-black overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-white/80">Simple 4-Step Process</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            How
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              {" "}Visura{" "}
            </span>
            Works
          </h2>
          
          <p className="max-w-2xl mx-auto text-lg text-white/60">
            From upload to insights in under 30 seconds. Here's how our AI transforms your documents.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {steps.map((step, index) => (
            <StepCard 
              key={index} 
              step={step} 
              index={index} 
              isActive={activeStep === index}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>

        {/* Process Demo */}
        <ProcessDemo />
      </div>
    </section>
  );
}
