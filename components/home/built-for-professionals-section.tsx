"use client";

import { BlogPostCard } from "@/components/card-18";
import { motion } from "framer-motion";

const posts = [
  {
    tag: "Upload & summarize",
    date: "PDF, Word & more",
    title: "Any format, same result",
    description:
      "Drop in PDFs, Word docs, or other files. Visura extracts key points, sections, and action items so you can grasp long documents in minutes instead of hours.",
    clickable: false,
  },
  {
    tag: "Chat with your docs",
    date: "Ask in plain language",
    title: "Answers from your files",
    description:
      "Ask questions in natural language and get answers grounded in your documents. No more scrolling or Ctrl+F through hundreds of pages to find what you need.",
    clickable: false,
  },
  {
    tag: "Teams & workspaces",
    date: "Organize and share",
    title: "Built for how you work",
    description:
      "Organize documents by project or client. Share summaries and insights with your team, and export when you need to take work into other tools.",
    clickable: false,
  },
];

const featuredPost = {
  tag: "Product",
  date: "Document intelligence",
  title: "Summaries and chat for your documents",
  description:
    "Visura turns your PDFs and files into something you can use. Get AI-generated summaries in seconds, then search and chat with your documents to find answers without re-reading.",
  imageUrl:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
  clickable: false,
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

export default function BuiltForProfessionalsSection() {
  return (
    <section className="w-full py-20 md:py-24 bg-black" style={{ backgroundColor: "#000000" }}>
      <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-12">
        <motion.div
          className="text-center mb-20 md:mb-28"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display), ui-serif, Georgia, serif" }}
          >
            Built for professionals
          </h2>
          <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            How Visura helps you work smarter with documents, without the busywork.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 md:mb-14"
        >
          <BlogPostCard variant="featured" theme="dark" href="#" {...featuredPost} />
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {posts.map((post, index) => (
            <motion.div key={index} variants={itemVariants}>
              <BlogPostCard {...post} href="#" theme="dark" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
