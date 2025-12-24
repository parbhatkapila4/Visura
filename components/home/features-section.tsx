"use client";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Sparkles,
  MessageSquare,
  Shield,
  Zap,
  FileText,
  Brain,
  Lock,
  Download,
  Eye,
  Cpu,
} from "lucide-react";

const FeatureCard = ({ feature, index }: { feature: (typeof features)[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    setRotateY(mouseX / 10);
    setRotateX(-mouseY / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        className="relative h-full p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 backdrop-blur-xl overflow-hidden"
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${feature.glowColor}20, transparent 40%)`,
          }}
        />

        <motion.div
          className={`relative w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6`}
          style={{ transform: "translateZ(20px)" }}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon className={`w-8 h-8 ${feature.iconColor}`} />

          <motion.div
            className={`absolute inset-0 rounded-2xl ${feature.bgColor} blur-xl opacity-0 group-hover:opacity-50`}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <div style={{ transform: "translateZ(10px)" }}>
          <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
          <p className="text-white/50 leading-relaxed text-sm">{feature.description}</p>
        </div>

        <motion.div
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient}`}
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
};

const features = [
  {
    icon: Brain,
    title: "AI That Understands",
    description:
      "Not just reading - comprehending. Our AI grasps context, nuance, and meaning like a human expert.",
    glowColor: "#ff6b00",
    bgColor: "bg-orange-500/20",
    iconColor: "text-orange-400",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: MessageSquare,
    title: "Chat With Your Docs",
    description:
      "Ask anything. Get instant, accurate answers drawn directly from your document content.",
    glowColor: "#ff00ff",
    bgColor: "bg-fuchsia-500/20",
    iconColor: "text-fuchsia-400",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "30 Second Magic",
    description: "Upload to insights in under 30 seconds. No waiting. No queues. Just pure speed.",
    glowColor: "#ffff00",
    bgColor: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Fort Knox Security",
    description:
      "256-bit encryption. SOC 2 certified. GDPR compliant. Your data never leaves our secure vault.",
    glowColor: "#00ff88",
    bgColor: "bg-emerald-500/20",
    iconColor: "text-emerald-400",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: FileText,
    title: "Any Format, Any Size",
    description: "PDF, Word, PowerPoint, and more. Up to 50MB. We handle whatever you throw at us.",
    glowColor: "#0088ff",
    bgColor: "bg-blue-500/20",
    iconColor: "text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Download,
    title: "Export Everywhere",
    description:
      "Download as PDF, Word, or Markdown. Share via link. Integrate with your tools via API.",
    glowColor: "#8800ff",
    bgColor: "bg-violet-500/20",
    iconColor: "text-violet-400",
    gradient: "from-violet-500 to-purple-500",
  },
];

const AnimatedNumber = ({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = value * easeOutQuart;

        setDisplayValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value, hasAnimated, decimals]);

  return (
    <span ref={ref}>
      {decimals > 0 ? displayValue.toFixed(decimals) : displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden bg-black scroll-optimized">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6"
          >
            <Cpu className="w-4 h-4 text-[#ff6b00]" />
            <span className="text-sm text-white/70">Engineered for Excellence</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
            Features that
            <br />
            <span className="bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#00ff88] bg-clip-text text-transparent">
              blow minds.
            </span>
          </h2>

          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Every feature obsessively crafted. Every detail intentional. This is document
            intelligence reimagined.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: 5000, suffix: "+", label: "Documents Processed", decimals: 0 },
            { value: 99, suffix: "%", label: "Accuracy Rate", decimals: 0 },
            { value: 100, suffix: "+", label: "Happy Users", decimals: 0 },
            { value: 4.9, suffix: "/5", label: "User Rating", decimals: 1 },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
              </div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
