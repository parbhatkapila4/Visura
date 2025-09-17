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
    <section className="bg-black py-12 " ref={ref}>
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
                transition: { duration: 0.3 }
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
                  className="w-full min-[400px]:w-auto bg-gradient-to-r from-[#04724D] to-[#059669] hover:from-[#059669] hover:to-[#04724D] hover:text-white text-white transition-all duration-300 hover:no-underline"
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
                    className="w-full min-[400px]:w-auto bg-gradient-to-r from-[#04724D] to-[#059669] hover:from-[#059669] hover:to-[#04724D] hover:text-white text-white transition-all duration-300 hover:no-underline"
                  >
                    <Link
                      href="/upload"
                      className="flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5
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
                    className="w-full min-[400px]:w-auto border-[#04724D] text-white hover:bg-[#04724D] hover:text-white transition-all duration-300"
                  >
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, -5, 5, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: 1
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
        </motion.div>
      </div>
    </section>
  );
}
