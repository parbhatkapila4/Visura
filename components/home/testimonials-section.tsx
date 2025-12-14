"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Briefcase,
  GraduationCap,
  Scale,
  FileSearch,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const MicrosoftLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 23 23" className={className}>
    <path fill="#F25022" d="M0 0h11v11H0z" />
    <path fill="#7FBA00" d="M12 0h11v11H12z" />
    <path fill="#00A4EF" d="M0 12h11v11H0z" />
    <path fill="#FFB900" d="M12 12h11v11H12z" />
  </svg>
);

const GoogleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const IBMLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="white">
    <path d="M0 0v24h24V0H0zm1 1h22v22H1V1zm2 2v18h18V3H3zm2 2h14v14H5V5zm2 2v10h10V7H7zm1 1h8v8H8V8zm1 1v6h6V9H9zm1 1h4v4h-4v-4z" />
  </svg>
);

const OracleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="white">
    <path d="M16.412 4.412h-8.82a7.588 7.588 0 0 0 0 15.176h8.82a7.588 7.588 0 0 0 0-15.176zm-8.82 13.636a6.048 6.048 0 1 1 0-12.096 6.02 6.02 0 0 1 5.66 4.047H7.592v-1.364h5.66a6.02 6.02 0 0 1-5.66 4.047zm8.82-4.047h-5.455v-1.364h5.455v1.364zm0-3.273H7.592V9.364h8.82v1.364z" />
  </svg>
);

const InfineonLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="white">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l8 4v8.64l-8 4-8-4V8.18l8-4zM12 8L4 12l8 4 8-4-8-4z" />
  </svg>
);

const useCases = [
  {
    id: 1,
    icon: Scale,
    title: "Legal Professionals",
    description:
      "Review contracts, case files, and legal documents in minutes instead of hours. Extract key clauses, identify risks, and get instant answers to complex legal questions.",
    benefits: [
      "Review contracts 10x faster",
      "Identify critical clauses instantly",
      "Ask questions about case law",
      "Extract key dates and deadlines",
    ],
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-500/20 to-cyan-500/20",
    iconBg: "bg-blue-500/20",
  },
  {
    id: 2,
    icon: GraduationCap,
    title: "Researchers & Academics",
    description:
      "Process hundreds of research papers weekly. Extract findings, compare methodologies, and build knowledge faster than ever before.",
    benefits: [
      "Process 100+ papers weekly",
      "Compare research methodologies",
      "Extract key findings instantly",
      "Build comprehensive literature reviews",
    ],
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/20 to-pink-500/20",
    iconBg: "bg-purple-500/20",
  },
  {
    id: 3,
    icon: Briefcase,
    title: "Business Analysts",
    description:
      "Turn lengthy reports into actionable insights. Analyze market research, financial documents, and strategic plans in seconds.",
    benefits: [
      "Transform reports into insights",
      "Analyze market research instantly",
      "Extract financial key metrics",
      "Identify strategic opportunities",
    ],
    gradient: "from-orange-500 to-red-500",
    bgGradient: "from-orange-500/20 to-red-500/20",
    iconBg: "bg-orange-500/20",
  },
  {
    id: 4,
    icon: FileSearch,
    title: "Content Creators",
    description:
      "Research topics, extract quotes, and understand complex subjects quickly. Perfect for writers, journalists, and content teams.",
    benefits: [
      "Research topics in minutes",
      "Extract perfect quotes",
      "Understand complex subjects",
      "Create content faster",
    ],
    gradient: "from-emerald-500 to-green-500",
    bgGradient: "from-emerald-500/20 to-green-500/20",
    iconBg: "bg-emerald-500/20",
  },
  {
    id: 5,
    icon: Users,
    title: "HR & Recruiting",
    description:
      "Process resumes, job descriptions, and employee documents efficiently. Extract qualifications, match candidates, and analyze policies.",
    benefits: [
      "Process resumes instantly",
      "Match candidate qualifications",
      "Analyze job descriptions",
      "Review employee policies quickly",
    ],
    gradient: "from-violet-500 to-purple-500",
    bgGradient: "from-violet-500/20 to-purple-500/20",
    iconBg: "bg-violet-500/20",
  },
  {
    id: 6,
    icon: TrendingUp,
    title: "Consultants & Advisors",
    description:
      "Analyze client documents, market reports, and industry research. Provide insights faster and deliver more value to clients.",
    benefits: [
      "Analyze client docs instantly",
      "Extract market insights",
      "Compare industry reports",
      "Deliver insights faster",
    ],
    gradient: "from-yellow-500 to-orange-500",
    bgGradient: "from-yellow-500/20 to-orange-500/20",
    iconBg: "bg-yellow-500/20",
  },
];

const UseCaseCard = ({ useCase, index }: { useCase: (typeof useCases)[0]; index: number }) => {
  const Icon = useCase.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      <div
        className={`relative h-full bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 rounded-3xl p-8 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-white/20 hover:scale-[1.02]`}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${useCase.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        />

        <div className="relative mb-6">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${useCase.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>

        <div className="relative">
          <h3 className="text-2xl font-bold text-white mb-3">{useCase.title}</h3>
          <p className="text-white/70 leading-relaxed mb-6">{useCase.description}</p>

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
                <div
                  className={`w-2 h-2 rounded-full bg-gradient-to-r ${useCase.gradient} flex-shrink-0`}
                />
                <span className="text-sm text-white/60">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          className={`absolute inset-0 bg-gradient-to-r ${useCase.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}
        />
      </div>
    </motion.div>
  );
};

export default function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 overflow-hidden bg-black">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,0,255,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,107,0,0.1)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6">
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
            Whether you're reviewing contracts, researching papers, or analyzing reports - Visura
            adapts to your workflow and saves you hours every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <UseCaseCard key={useCase.id} useCase={useCase} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20"
        >
          <p className="text-lg md:text-xl text-white/40 mb-8 text-center font-medium">
            Trusted by professionals at
          </p>

          <div className="relative overflow-hidden py-6">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black via-black to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black via-black to-transparent z-10 pointer-events-none" />

            <div className="flex items-center gap-16 md:gap-20 animate-scroll-logos">
              {[
                { name: "Microsoft", Logo: MicrosoftLogo, bgColor: "bg-white" },
                { name: "Google", Logo: GoogleLogo, bgColor: "bg-white" },
                { name: "IBM", Logo: IBMLogo, bgColor: "bg-blue-600" },
                { name: "Oracle", Logo: OracleLogo, bgColor: "bg-red-600" },
                { name: "Infineon", Logo: InfineonLogo, bgColor: "bg-blue-500" },
              ].map((company, i) => (
                <div key={`first-${i}`} className="flex-shrink-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 group">
                    <div
                      className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl ${company.bgColor} flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 p-4`}
                    >
                      <company.Logo className="w-full h-full" />
                    </div>
                    <span className="text-white/80 text-base md:text-lg font-semibold whitespace-nowrap">
                      {company.name}
                    </span>
                  </div>
                </div>
              ))}

              {[
                { name: "Microsoft", Logo: MicrosoftLogo, bgColor: "bg-white" },
                { name: "Google", Logo: GoogleLogo, bgColor: "bg-white" },
                { name: "IBM", Logo: IBMLogo, bgColor: "bg-blue-600" },
                { name: "Oracle", Logo: OracleLogo, bgColor: "bg-red-600" },
                { name: "Infineon", Logo: InfineonLogo, bgColor: "bg-blue-500" },
              ].map((company, i) => (
                <div key={`second-${i}`} className="flex-shrink-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 group">
                    <div
                      className={`w-24 h-24 md:w-32 md:h-32 rounded-2xl ${company.bgColor} flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-300 p-4`}
                    >
                      <company.Logo className="w-full h-full" />
                    </div>
                    <span className="text-white/80 text-base md:text-lg font-semibold whitespace-nowrap">
                      {company.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
