"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Upload, FileText } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  const buttonVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <section className="bg-black py-12 pb-24" ref={ref}>
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div
            className="space-y-2"
            variants={itemVariants}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white"
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.3 },
              }}
            >
              Ready to unlock hours of productive reading time?
            </motion.h2>
            <motion.p
              className="mx-auto max-w-6xl text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-[20px]/relaxed"
              animate={{
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Convert lengthy documents into clear, actionable knowledge with
              our AI-powered synthesizer.
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-2 min-[400px]:flex-row justify-center"
            variants={buttonVariants}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <SignedOut>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant={"link"}
                  className="w-full min-[400px]:w-auto bg-gradient-to-r from-[#625EC3] to-[#000000] hover:from-[#000000] hover:to-[#625EC3] hover:text-white text-white transition-all duration-300 hover:no-underline"
                >
                  <Link
                    href="/#pricing"
                    className="flex items-center justify-center"
                  >
                    Get Started{" "}
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
            </SignedOut>

            <SignedIn>
              <motion.div
                className="flex flex-col gap-2 min-[400px]:flex-row"
                variants={containerVariants}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variants={buttonVariants}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Button
                    size="lg"
                    variant={"link"}
                    className="w-full min-[400px]:w-auto bg-gradient-to-r from-[#625EC3] to-[#000000] hover:from-[#000000] hover:to-[#625EC3] hover:text-white text-white transition-all duration-300 hover:no-underline"
                  >
                    <Link
                      href="/upload"
                      className="flex items-center justify-center"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                      </motion.div>
                      Upload PDF
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  variants={buttonVariants}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Button
                    size="lg"
                    variant={"outline"}
                    className="w-full min-[400px]:w-auto border-[#625EC3] text-white hover:bg-[#625EC3] hover:text-white transition-all duration-300"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, -5, 5, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 1,
                        }}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                      </motion.div>
                      View Summaries
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </SignedIn>
          </motion.div>

          <motion.div
            className="w-full max-w-6xl mx-auto mt-24 mb-8"
            variants={itemVariants}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-20 rounded-2xl"></div>

              <div className="absolute top-8 left-0 right-0 h-px bg-gray-600/30"></div>

              <div className="relative grid md:grid-cols-2 gap-12 p-12">
                <motion.div
                  className="text-center space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                  }
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#625EC3]/30">
                      <img
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
                        alt="Sarah M"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <blockquote className="text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed">
                    "Visura transformed our document workflow completely. What
                    used to take hours now takes minutes."
                  </blockquote>

                  <cite className="block text-sm font-medium uppercase tracking-wider text-gray-300">
                    Sarah M, TechCorp
                  </cite>
                </motion.div>

                <motion.div
                  className="text-center space-y-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
                  }
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/30">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                        alt="Michael R"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <blockquote className="text-xl md:text-2xl font-serif italic text-white/90 leading-relaxed">
                    "The AI summaries are incredibly accurate and save our team
                    countless hours every week."
                  </blockquote>

                  <cite className="block text-sm font-medium uppercase tracking-wider text-gray-300">
                    Michael R, DataFlow Inc
                  </cite>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
