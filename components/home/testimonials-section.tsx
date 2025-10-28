"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      company: "TechFlow (Series A)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      content: "Visura saved us 20+ hours per week during our fundraising. Instead of reading 50-page investor decks, I get key insights in 30 seconds. We closed our Series A 3 weeks faster because I could focus on what actually matters.",
      rating: 5,
      metric: "20+ hrs/week saved",
      stage: "Series A"
    },
    {
      name: "Sarah Rodriguez",
      role: "Co-Founder",
      company: "DataVault (Seed)",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      content: "As a technical founder, I was drowning in legal contracts and compliance docs. Visura extracts the critical terms I need to know. It's like having a legal analyst on speed dial.",
      rating: 5,
      metric: "90% faster contract review",
      stage: "Seed Stage"
    },
    {
      name: "Marcus Johnson",
      role: "Founder",
      company: "GrowthLab (Pre-Seed)",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      content: "I was spending 15+ hours weekly reading market research and competitor analysis. Now I get actionable insights in minutes. This tool pays for itself in the first week.",
      rating: 5,
      metric: "15+ hrs/week saved",
      stage: "Pre-Seed"
    },
    {
      name: "Dr. Emily Watson",
      role: "Founder & CTO",
      company: "MedTech Innovations (Series B)",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      content: "Regulatory documents are incredibly complex. Visura breaks down FDA guidelines and compliance requirements into digestible insights. It's been a game-changer for our regulatory strategy.",
      rating: 5,
      metric: "80% faster compliance review",
      stage: "Series B"
    },
    {
      name: "David Park",
      role: "Founder & CEO",
      company: "FinTech Solutions (Series A)",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      content: "Due diligence documents used to take me days to process. With Visura, I can review 50+ page financial reports in minutes and make informed decisions faster than ever.",
      rating: 5,
      metric: "Days → Minutes",
      stage: "Series A"
    },
    {
      name: "Lisa Chen",
      role: "Co-Founder",
      company: "EcoTech (Seed)",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
      content: "Research papers and technical documentation were slowing us down. Visura extracts the key findings and implications so I can focus on building instead of reading.",
      rating: 5,
      metric: "10x faster research",
      stage: "Seed Stage"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Founders Who Moved Faster
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See how startup founders are saving 15+ hours per week and making 
            better decisions with instant document insights.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <div className="relative h-full p-8 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl group-hover:border-blue-500/30 transition-all duration-300">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-20">
                  <Quote className="w-8 h-8 text-blue-400" />
                </div>

                {/* Stage Badge */}
                <div className="absolute top-6 left-6">
                  <div className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
                    <span className="text-blue-400 text-xs font-medium">{testimonial.stage}</span>
                  </div>
                </div>

                {/* Metric Highlight */}
                <div className="mt-8 mb-6">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{testimonial.metric}</div>
                  <div className="text-sm text-gray-400">Time Saved</div>
                </div>

                {/* Content */}
                <p className="text-gray-300 leading-relaxed mb-8 text-base">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30"
                  />
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">
                      {testimonial.role}
                    </div>
                    <div className="text-blue-400 text-sm font-medium">
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Founder-Focused Stats */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            { number: "15+ hrs", label: "Average Time Saved", description: "Per founder per week" },
            { number: "$2,400", label: "Monthly Value", description: "Average founder savings" },
            { number: "2,500+", label: "Startups", description: "Trust us daily" },
            { number: "30s", label: "Processing Time", description: "From hours to seconds" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6 bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl group-hover:border-blue-500/30 transition-all duration-300">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-white font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-400 text-sm">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
