"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Sparkles, Zap, Crown, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    id: "basic",
    name: "Starter",
    description: "Perfect for getting started",
    originalPrice: 20,
    discountedPrice: 10,
    icon: Zap,
    gradient: "from-gray-500 to-gray-600",
    popular: false,
    features: [
      "5 documents per month",
      "Basic AI summaries",
      "Chat with documents",
      "PDF & Word support",
      "Email support",
    ],
    limitations: [
      "Max 10 pages per doc",
      "Standard processing",
    ],
    cta: "Get Started",
    ctaLink: "/checkout/starter",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For power users",
    originalPrice: 45,
    discountedPrice: 20,
    icon: Sparkles,
    gradient: "from-[#ff6b00] to-[#ff00ff]",
    popular: true,
    features: [
      "Unlimited documents",
      "Advanced AI analysis",
      "Priority chat with AI",
      "All file formats",
      "Priority support",
      "API access",
      "Team sharing",
      "Custom exports",
    ],
    limitations: [],
    cta: "Get Pro",
    ctaLink: "/checkout",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large teams",
    originalPrice: 200,
    discountedPrice: 99,
    icon: Crown,
    gradient: "from-violet-500 to-purple-600",
    popular: false,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Custom AI training",
      "SSO & SAML",
      "Dedicated support",
      "SLA guarantee",
      "On-premise option",
      "Custom integrations",
      "Audit logs",
    ],
    limitations: [],
    cta: "Contact Sales",
    ctaLink: "/contact",
  },
];

const PricingCard = ({ plan, index }: { plan: typeof plans[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const discountPercent = Math.round(((plan.originalPrice - plan.discountedPrice) / plan.originalPrice) * 100);
  const Icon = plan.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative group ${plan.popular ? 'md:-mt-4' : ''}`}
      style={{ perspective: 1000 }}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <motion.div
          className="absolute -top-4 left-1/2 -translate-x-1/2 z-20"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white text-sm font-bold">
            Most Popular
          </div>
        </motion.div>
      )}

      {/* Glow Effect for Popular */}
      {plan.popular && (
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#ff6b00] rounded-3xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
      )}

      {/* Card */}
      <motion.div
        className={`relative h-full rounded-3xl overflow-hidden ${
          plan.popular 
            ? 'bg-black border-0' 
            : 'bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10'
        } backdrop-blur-xl`}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-8">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-6`}>
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* Name & Description */}
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-white/50 text-sm mb-6">{plan.description}</p>

          {/* Price */}
          <div className="mb-8">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-5xl font-black text-white">
                ${plan.discountedPrice}
              </span>
              <span className="text-white/40">/month</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg text-white/40 line-through">
                ${plan.originalPrice}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                {discountPercent}% OFF
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Link href={plan.ctaLink}>
            <motion.button
              className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 ${
                plan.popular
                  ? 'bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              } transition-colors`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {plan.cta}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>

          {/* Features */}
          <div className="mt-8 space-y-4">
            {plan.features.map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <div className={`w-5 h-5 rounded-full bg-gradient-to-r ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/70 text-sm">{feature}</span>
              </motion.div>
            ))}
            {plan.limitations.map((limitation, i) => (
              <div key={i} className="flex items-center gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white/50">—</span>
                </div>
                <span className="text-white/40 text-sm">{limitation}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="pricing" className="relative py-32 overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ff6b00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff00ff]/10 rounded-full blur-[150px]" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

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
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/70">30-day money-back guarantee</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Simple, transparent
            <br />
            <span className="bg-gradient-to-r from-[#ff6b00] via-[#ff00ff] to-[#00ff88] bg-clip-text text-transparent">
              pricing.
            </span>
          </h2>

          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Limited time offer - Get up to 56% off on all plans. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>

        {/* Bottom Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { icon: Shield, text: "Bank-grade encryption" },
            { icon: Check, text: "SOC 2 Certified" },
            { icon: Zap, text: "99.9% Uptime SLA" },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-white/40">
              <badge.icon className="w-4 h-4" />
              <span className="text-sm">{badge.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
