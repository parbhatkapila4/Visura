"use client";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles, FileText, Zap, Shield, Clock, Check } from "lucide-react";
import Link from "next/link";

export default function CtaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 10]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b00] via-[#ff00ff] to-[#ff6b00] bg-[length:400%_400%] animate-gradient" />
      
      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.3)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(0,0,0,0.3)_0%,transparent_50%)]" />
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-lg flex items-center justify-center"
        style={{ y, rotate }}
      >
        <FileText className="w-10 h-10 text-white/80" />
      </motion.div>
      
      <motion.div
        className="absolute top-1/4 right-20 w-16 h-16 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center"
        style={{ y: useTransform(scrollYProgress, [0, 1], [-50, 50]) }}
      >
        <Zap className="w-8 h-8 text-white/80" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-20 left-1/4 w-14 h-14 rounded-xl bg-white/10 backdrop-blur-lg flex items-center justify-center"
        style={{ y: useTransform(scrollYProgress, [0, 1], [50, -50]) }}
      >
        <Shield className="w-7 h-7 text-white/80" />
      </motion.div>

      <motion.div
        className="absolute bottom-1/4 right-1/4 w-12 h-12 rounded-lg bg-white/10 backdrop-blur-lg flex items-center justify-center"
        style={{ y: useTransform(scrollYProgress, [0, 1], [-30, 30]), rotate: useTransform(scrollYProgress, [0, 1], [0, -10]) }}
      >
        <Clock className="w-6 h-6 text-white/80" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-lg mb-8"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,255,255,0.2)',
                '0 0 40px rgba(255,255,255,0.3)',
                '0 0 20px rgba(255,255,255,0.2)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Join 100+ happy users</span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            Ready to transform
            <br />
            how you work?
          </h2>

          {/* Subtitle */}
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join professionals who&apos;ve already revolutionized their document workflow. 
            Start free, no credit card required.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/sign-up">
              <motion.button
                className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg flex items-center gap-2 shadow-2xl"
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
                whileTap={{ scale: 0.95 }}
              >
                Get started free
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </motion.button>
            </Link>
            
            <Link href="#demo">
              <motion.button
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-lg text-white font-medium text-lg border border-white/20"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                whileTap={{ scale: 0.95 }}
              >
                Watch demo
              </motion.button>
            </Link>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
            {[
              "Free forever plan",
              "No credit card",
              "Setup in 30 seconds",
            ].map((point, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-sm">{point}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 -mb-px">
        <svg viewBox="0 0 1440 120" fill="none" className="w-full" preserveAspectRatio="none">
          <path
            d="M0 120V60C240 20 480 0 720 0C960 0 1200 20 1440 60V120H0Z"
            fill="black"
          />
        </svg>
      </div>
    </section>
  );
}
