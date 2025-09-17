"use client";
import { cn } from "@/lib/utils";
import { pricingPlans } from "@/utils/constants";
import { ArrowRight, CheckIcon, Clock, Users, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

type PriceType = {
  name: string;
  price: string;
  description: string;
  items: string[];
  id: string;
  paymentLink: string;
  priceId: string;
};

const WorkWithUsCard = ({
  name,
  price,
  description,
  period,
  borderColor,
  index,
  paymentLink,
}: {
  name: string;
  price: string;
  description: string;
  period: string;
  borderColor: string;
  index: number;
  paymentLink?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    if (paymentLink) {
      window.open(paymentLink, "_blank");
      setIsLoading(false);
    } else {
      // Add your checkout logic here
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
    >
      <div
        className="relative p-[1px] rounded-[2rem] overflow-hidden bg-gray-900/50 backdrop-blur-sm shadow-lg"
        style={{
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <div className="relative h-full w-full rounded-[2rem] bg-black backdrop-blur-sm ">
          <div className="relative h-full w-full rounded-[2rem] bg-gray-900/50 backdrop-blur-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                <p className="text-gray-400 text-sm">{description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">${price}</div>
                <div className="text-gray-400 text-sm">/{period}</div>
              </div>
            </div>

            <motion.button
              onClick={handleCheckout}
              disabled={isLoading}
              className="relative w-full overflow-hidden rounded-2xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="relative flex h-full w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-800 px-4 py-3 text-white font-medium backdrop-blur-3xl transition-colors hover:bg-gray-700 disabled:opacity-50">
                {isLoading ? "Loading..." : "Try Now"}
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StartSmallCard = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    // Redirect to Stripe payment link
    window.open(
      "https://buy.stripe.com/test_fZufZi7uH2Tca5U4ACcbC01?success_url=https://visura.vercel.app/&cancel_url=https://visura.vercel.app/",
      "_blank"
    );
    setIsLoading(false);
  };

  const serviceTags = [
    "PDF Summaries",
    "Quick Insights",
    "Executive Overviews",
    "AI-Powered Highlights",
    "Research Digests",
    "Meeting Notes Extraction",
    "Report Condensing",
    "Contract Summaries",
  ];

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
    >
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-[2rem] p-8 backdrop-blur-sm max-w-md mx-auto">
        {/* Graphic placeholder */}
        <div className="flex justify-center mb-8 h-44 items-center">
          <div className="relative w-80 h-32">
            {/* Background with texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl opacity-90"></div>

            {/* Left app window (behind) */}
            <div className="absolute -left-4 top-2 w-20 h-16 bg-gray-800/80 rounded-xl border border-gray-600/50 backdrop-blur-sm">
              <div className="p-2 space-y-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-sm"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                  <div className="w-3 h-3 bg-purple-400 rounded-sm"></div>
                  <div className="w-3 h-3 bg-pink-400 rounded-sm"></div>
                  <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Central app window (main) */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-20 bg-black rounded-xl border border-gray-500/30 shadow-2xl">
              <div className="p-3 flex flex-col items-center justify-center h-full">
                {/* Glowing geometric shapes */}
                <div className="w-8 h-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-sm mb-2 shadow-lg shadow-purple-500/50"></div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 rounded-sm shadow-lg shadow-orange-500/50"></div>
                  <div className="w-3 h-3 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full shadow-lg shadow-cyan-500/50"></div>
                </div>
              </div>
            </div>

            {/* Right app window (behind) */}
            <div className="absolute -right-4 top-3 w-20 h-16 bg-gray-800/80 rounded-xl border border-gray-600/50 backdrop-blur-sm">
              <div className="p-2 space-y-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-sm"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-sm"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-sm"></div>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-sm"></div>
                  <div className="w-3/4 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-sm"></div>
                  <div className="w-1/2 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-sm"></div>
                </div>
                <div className="text-xs text-white/60 font-mono">$2,847</div>
              </div>
            </div>

            {/* Subtle glow effects */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-30"></div>
          </div>
        </div>

        <h3 className="text-3xl font-bold text-white mb-7 italic text-center">
          Read less!
        </h3>

        <p className="text-gray-400 mb-8 text-base text-center">
          Get high-impact summaries{" "}
          <span className="text-orange-400 font-bold"> in seconds</span>. No
          fluff. Just clarity.
        </p>

        {/* Service Tags - Infinite Scroll */}
        <div className="relative overflow-hidden mb-8 -mx-4">
          <div className="flex gap-4 animate-scroll px-4">
            {/* First set of tags */}
            {serviceTags.map((tag, index) => (
              <span
                key={`first-${index}`}
                className="px-4 py-2 border border-gray-600 text-white/70 text-sm font-medium rounded-full uppercase tracking-wide whitespace-nowrap flex-shrink-0"
              >
                {tag}
              </span>
            ))}
            {/* Duplicate set for seamless loop */}
            {serviceTags.map((tag, index) => (
              <span
                key={`second-${index}`}
                className="px-4 py-2 bg-gray-700 border border-gray-600 text-white text-sm font-medium rounded-full uppercase tracking-wide whitespace-nowrap flex-shrink-0"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleCheckout}
          disabled={isLoading}
          className="relative w-full overflow-hidden rounded-2xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="relative flex h-full w-full cursor-pointer items-center justify-between rounded-2xl bg-transparent px-4 py-3 text-white/80 font-bold text-base backdrop-blur-3xl transition-colors hover:bg-green-600/20 disabled:opacity-50">
            <span>Get a summary</span>
            <span>$20</span>
          </span>
        </motion.button>

        <p className="text-gray-500 text-xs uppercase text-center mt-4">
          One Summary, One Price
        </p>
      </div>
    </motion.div>
  );
};

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const titleVariants = {
    hidden: {
      opacity: 0,
      y: -30,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <section
      className="relative overflow-hidden bg-black py-16 pt-24"
      id="pricing"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Left Column - Work with us */}
          <motion.div
            className="space-y-8"
            variants={titleVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div>
              <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-500 to-gray-800 mb-12 ml-6">
                Summarize With AI
              </h2>
              <p className="text-gray-600 text-xl mb-4 leading-relaxed">
                Tap in on a <span className="text-white/70 p-1">Basic</span> or{" "}
                <span className="text-white/70 p-1">Pro</span> basis. You’ll get
                your very own Slack channel and direct access to instant PDF
                insights that transform the way you work.
              </p>
            </div>

            <div className="space-y-4">
              <WorkWithUsCard
                name="Starter"
                price="10"
                description="Quick support for small fixes, updates, and testing."
                period="Monthly"
                borderColor="blue"
                index={0}
                paymentLink="https://buy.stripe.com/test_28EdRabKXeBUce2ffgcbC00?success_url=https://visura.vercel.app/&cancel_url=https://visura.vercel.app/"
              />
              <WorkWithUsCard
                name="Elite"
                price="20"
                description="Priority handling for launches, major fixes, and advanced testing."
                period="Monthly"
                borderColor="purple"
                index={1}
                paymentLink="https://buy.stripe.com/test_fZufZi7uH2Tca5U4ACcbC01?success_url=https://visura.vercel.app/&cancel_url=https://visura.vercel.app/"
              />
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-white">
                <CheckIcon className="w-5 h-5 text-green-400" />
                <span>Unlimited documents</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-green-400" />
                <span>Within 30 Seconds</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-green-400" />
                <span>Instant PDF Insights</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Start small */}
          <motion.div
            className="flex items-center"
            variants={titleVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <StartSmallCard />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
