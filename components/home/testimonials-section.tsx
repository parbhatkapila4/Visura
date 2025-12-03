"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, GraduationCap, Scale, FileSearch, Users, TrendingUp, ArrowRight } from "lucide-react";

const useCases = [
  {
    id: 1,
    icon: Scale,
    title: "Legal Professionals",
    description: "Review contracts, case files, and legal documents in minutes instead of hours. Extract key clauses, identify risks, and get instant answers to complex legal questions.",
    benefits: [
      "Review contracts 10x faster",
      "Identify critical clauses instantly",
      "Ask questions about case law",
      "Extract key dates and deadlines"
    ],
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500/20",
  },
  {
    id: 2,
    icon: GraduationCap,
    title: "Researchers & Academics",
    description: "Process hundreds of research papers weekly. Extract findings, compare methodologies, and build knowledge faster than ever before.",
    benefits: [
      "Process 100+ papers weekly",
      "Compare research methodologies",
      "Extract key findings instantly",
      "Build comprehensive literature reviews"
    ],
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/20 to-pink-500/20",
    iconBg: "bg-purple-500/20",
  },
  {
    id: 3,
    icon: Briefcase,
    title: "Business Analysts",
    description: "Turn lengthy reports into actionable insights. Analyze market research, financial documents, and strategic plans in seconds.",
    benefits: [
      "Transform reports into insights",
      "Analyze market research instantly",
      "Extract financial key metrics",
      "Identify strategic opportunities"
    ],
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/20 to-red-500/20",
    iconBg: "bg-orange-500/20",
  },
  {
    id: 4,
    icon: FileSearch,
    title: "Content Creators",
    description: "Research topics, extract quotes, and understand complex subjects quickly. Perfect for writers, journalists, and content teams.",
    benefits: [
      "Research topics in minutes",
      "Extract perfect quotes",
      "Understand complex subjects",
      "Create content faster"
    ],
    gradient: "from-emerald-500 to-green-500",
    bgGradient: "from-emerald-500/20 to-green-500/20",
    iconBg: "bg-emerald-500/20",
  },
  {
    id: 5,
    icon: Users,
    title: "HR & Recruiting",
    description: "Process resumes, job descriptions, and employee documents efficiently. Extract qualifications, match candidates, and analyze policies.",
    benefits: [
      "Process resumes instantly",
      "Match candidate qualifications",
      "Analyze job descriptions",
      "Review employee policies quickly"
    ],
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/20 to-purple-500/20",
    iconBg: "bg-violet-500/20",
  },
  {
    id: 6,
    icon: TrendingUp,
    title: "Consultants & Advisors",
    description: "Analyze client documents, market reports, and industry research. Provide insights faster and deliver more value to clients.",
    benefits: [
      "Analyze client docs instantly",
      "Extract market insights",
      "Compare industry reports",
      "Deliver insights faster"
    ],
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-500/20 to-orange-500/20",
    iconBg: "bg-yellow-500/20",
  },
];

const UseCaseCard = ({ useCase, index }: { useCase: typeof useCases[0]; index: number }) => {
  const Icon = useCase.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      <div className={`relative h-full bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/20 hover:scale-[1.02]`}>
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${useCase.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        
        {/* Icon */}
        <div className="relative mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${useCase.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          <h3 className="text-2xl font-bold text-white mb-3">{useCase.title}</h3>
          <p className="text-white/70 leading-relaxed mb-6">{useCase.description}</p>

          {/* Benefits List */}
          <div className="space-y-3">
            {useCase.benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${useCase.gradient} flex-shrink-0`} />
                <span className="text-sm text-white/60">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hover Glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${useCase.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
      </div>
    </motion.div>
  );
};

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,0,255,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,107,0,0.1)_0%,transparent_50%)]" />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6"
          >
            <Users className="w-4 h-4 text-[#ff6b00]" />
            <span className="text-sm text-white/70">Built for Professionals</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Perfect for
            <br />
            <span className="bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#00ff88] bg-clip-text text-transparent">
              every professional.
            </span>
          </h2>

          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Whether you're reviewing contracts, researching papers, or analyzing reports—Visura adapts to your workflow and saves you hours every day.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <UseCaseCard key={useCase.id} useCase={useCase} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-white/30 mb-4">Trusted by professionals at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {['Microsoft', 'Google', 'IBM', 'Oracle', 'Infineon'].map((company) => (
              <div key={company} className="text-sm font-medium text-white/50">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
