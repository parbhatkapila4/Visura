"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function DemoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative" ref={ref}>
      <div className="py-8 sm:py-12 lg:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative overflow-hidden pb-4 mb-8 sm:mb-12">
            <div
              className="flex gap-3 sm:gap-4 animate-scroll"
              style={{ transform: "translateZ(0)" }}
            >
              {[
                {
                  name: "PDF Documents",
                  image:
                    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-blue-800",
                },
                {
                  name: "Office Building",
                  image:
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-gray-700",
                },
                {
                  name: "Business Meeting",
                  image:
                    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-green-800",
                },
                {
                  name: "Research Papers",
                  image:
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-amber-800",
                },
                {
                  name: "Corporate Office",
                  image:
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-slate-800",
                },
                {
                  name: "Legal Documents",
                  image:
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-indigo-800",
                },
                {
                  name: "Academic Papers",
                  image:
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-emerald-800",
                },
                {
                  name: "Financial Reports",
                  image:
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-teal-800",
                },
                {
                  name: "Medical Records",
                  image:
                    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-red-800",
                },
                {
                  name: "Technical Manuals",
                  image:
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-purple-800",
                },
                {
                  name: "Executive Summary",
                  image:
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-orange-800",
                },
                {
                  name: "Business Analysis",
                  image:
                    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-cyan-800",
                },

                {
                  name: "PDF Documents",
                  image:
                    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-blue-800",
                },
                {
                  name: "Office Building",
                  image:
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-gray-700",
                },
                {
                  name: "Business Meeting",
                  image:
                    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-green-800",
                },
                {
                  name: "Research Papers",
                  image:
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-amber-800",
                },
                {
                  name: "Corporate Office",
                  image:
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-slate-800",
                },
                {
                  name: "Legal Documents",
                  image:
                    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-indigo-800",
                },
                {
                  name: "Academic Papers",
                  image:
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-emerald-800",
                },
                {
                  name: "Financial Reports",
                  image:
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-teal-800",
                },
                {
                  name: "Medical Records",
                  image:
                    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-red-800",
                },
                {
                  name: "Technical Manuals",
                  image:
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-purple-800",
                },
                {
                  name: "Executive Summary",
                  image:
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-orange-800",
                },
                {
                  name: "Business Analysis",
                  image:
                    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=300&h=300&fit=crop&crop=center&auto=format&q=80",
                  bg: "bg-cyan-800",
                },
              ].map((item, index) => (
                <motion.div
                  key={`${item.name}-${index}`}
                  className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-gray-600/50 overflow-hidden backdrop-blur-sm relative"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-white text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold leading-relaxed px-4">
            We've built smart technology that cuts through the noise - delivering fast,
            focused summaries so you can skip the overwhelm, find what matters,
            and act on insights that truly{" "}
            <span className="text-[#625EC3] italic font-semibold">
              move the needle
            </span>
            .
          </div>
        </motion.div>
      </div>
    </section>
  );
}
