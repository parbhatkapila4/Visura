"use client";
import { CheckIcon, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

// Helper function to create checkout session via API
const createCheckoutSession = async (priceId: string) => {
  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    });

    if (!response.ok) {
      throw new Error("Failed to create checkout session");
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

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
  index,
  priceId,
}: {
  name: string;
  price: string;
  description: string;
  period: string;
  borderColor: string;
  index: number;
  priceId?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      if (priceId) {
        const checkoutUrl = await createCheckoutSession(priceId);
        window.location.href = checkoutUrl;
      } else {
        throw new Error("Price ID not provided");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        delay: index * 0.2,
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        scale: 1.02,
        y: -2,
        transition: {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }}
    >
      <div
        className="relative p-[1px] rounded-[2rem] overflow-hidden bg-gray-900/50 backdrop-blur-sm shadow-lg"
        style={{
          boxShadow: "0 0 20px rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
        <div className="relative h-full w-full rounded-[2rem] bg-black backdrop-blur-sm ">
          <div className="relative h-full w-full rounded-[2rem] bg-gray-900/50 backdrop-blur-sm p-6 flex flex-col">
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

            <div className="flex-1"></div>

            <div className="mt-8">
              <motion.button
              onClick={handleCheckout}
              disabled={isLoading}
              className="relative w-full overflow-hidden rounded-2xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              whileHover={{ 
                scale: 1.03,
                transition: {
                  duration: 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              whileTap={{ 
                scale: 0.97,
                transition: {
                  duration: 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="relative flex h-full w-full cursor-pointer items-center justify-center rounded-2xl bg-gray-800 px-4 py-3 text-white font-medium backdrop-blur-3xl transition-colors hover:bg-gray-700 disabled:opacity-50">
                {isLoading ? "Loading..." : "Try Now"}
              </span>
              </motion.button>
            </div>
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
    try {
      const priceId = "price_1S82BQIDKmPOE5aTwhecvlb9";
      const checkoutUrl = await createCheckoutSession(priceId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const serviceTags = [
    "PDF Summaries",
    "Quick Insights",
    "Executive Overviews",
    "Smart Highlights",
    "Research Digests",
    "Meeting Notes Extraction",
    "Report Condensing",
    "Contract Summaries",
  ];

  return (
    <motion.div
      className="relative w-full max-w-full overflow-hidden"
      initial={{ opacity: 0, x: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ 
        delay: 0.3,
        duration: 0.7,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: {
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      }}
    >
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-[2rem] p-3 sm:p-6 lg:p-8 backdrop-blur-sm max-w-xs sm:max-w-sm md:max-w-md mx-auto w-full overflow-hidden">
        <div className="hidden md:flex justify-center w-full mb-4 sm:mb-6 md:mb-8 h-24 sm:h-32 md:h-44 items-center overflow-hidden">
          <div className="relative w-48 sm:w-64 md:w-80 h-20 sm:h-24 md:h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl opacity-90"></div>

            <div className="absolute -left-1 sm:-left-2 md:-left-4 top-1 sm:top-2 w-12 sm:w-16 md:w-20 h-10 sm:h-12 md:h-16 bg-gray-800/80 rounded-xl border border-gray-600/50 backdrop-blur-sm">
              <div className="p-1 sm:p-2 space-y-0.5 sm:space-y-1">
                <div className="flex gap-0.5 sm:gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-transparent rounded-sm"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-sm"></div>
                </div>
                <div className="grid grid-cols-2 gap-0.5 sm:gap-1">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-sm"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-sm"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-sm"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-sm"></div>
                </div>
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 sm:w-20 md:w-24 h-12 sm:h-16 md:h-20 bg-black rounded-xl border border-gray-500/30 shadow-2xl">
              <div className="p-2 sm:p-3 flex flex-col items-center justify-center h-full">
                <div className="w-6 sm:w-8 h-2 sm:h-3 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-sm mb-1 sm:mb-2 shadow-lg shadow-purple-500/50"></div>
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-orange-400 via-transparent to-purple-600 rounded-sm shadow-lg shadow-orange-500/50"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full shadow-lg shadow-cyan-500/50"></div>
                </div>
              </div>
            </div>

            <div className="absolute -right-1 sm:-right-2 md:-right-4 top-2 sm:top-3 w-12 sm:w-16 md:w-20 h-10 sm:h-12 md:h-16 bg-gray-800/80 rounded-xl border border-gray-600/50 backdrop-blur-sm">
              <div className="p-1 sm:p-2 space-y-0.5 sm:space-y-1">
                <div className="flex gap-0.5 sm:gap-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-transparent rounded-sm"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-sm"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-sm"></div>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="w-full h-0.5 sm:h-1 bg-gradient-to-r from-transparent to-orange-500 rounded-sm"></div>
                  <div className="w-3/4 h-0.5 sm:h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-sm"></div>
                  <div className="w-1/2 h-0.5 sm:h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-sm"></div>
                </div>
                <div className="text-xs text-white/60 font-mono">$2,847</div>
              </div>
            </div>

            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-30"></div>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 md:mb-7 italic text-center">
          Read less!
        </h3>

        <p className="text-gray-400 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base text-center px-1 sm:px-2 md:px-4 max-w-full">
          Get high-impact summaries{" "}
          <span className="text-orange-400 font-bold"> in seconds</span>. No
          fluff. Just clarity.
        </p>

        <div className="relative overflow-hidden mb-4 sm:mb-6 md:mb-8">
          <div className="flex gap-1 sm:gap-1.5 md:gap-2 lg:gap-4 animate-scroll overflow-x-hidden">
            {serviceTags.map((tag, index) => (
              <span
                key={`first-${index}`}
                className="px-1.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 border border-gray-600 text-white/70 text-xs font-medium rounded-full uppercase tracking-wide whitespace-nowrap flex-shrink-0"
              >
                {tag}
              </span>
            ))}

            {serviceTags.map((tag, index) => (
              <span
                key={`second-${index}`}
                className="px-1.5 sm:px-3 md:px-4 py-0.5 sm:py-1 md:py-1.5 bg-gray-700 border border-gray-600 text-white text-xs font-medium rounded-full uppercase tracking-wide whitespace-nowrap flex-shrink-0"
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
          whileHover={{ 
            scale: 1.03,
            transition: {
              duration: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94]
            }
          }}
          whileTap={{ 
            scale: 0.97,
            transition: {
              duration: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94]
            }
          }}
        >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="relative flex h-full w-full cursor-pointer items-center justify-between rounded-2xl bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 text-white/80 font-bold text-sm sm:text-base backdrop-blur-3xl transition-colors hover:bg-green-600/20 disabled:opacity-50">
            <span>Get a summary</span>
            <span>$20</span>
          </span>
        </motion.button>

        <p className="text-gray-500 text-xs uppercase text-center mt-3 sm:mt-4">
          One Summary, One Price
        </p>
      </div>
    </motion.div>
  );
};

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      name: "Starter",
      price: "10",
      period: "month",
      description: "Perfect for individuals and small teams getting started with document analysis",
      features: [
        "Up to 50 documents/month",
        "Basic AI summarization",
        "PDF & Word support",
        "Email support",
        "Standard processing speed"
      ],
      priceId: "price_1S82BQIDKmPOE5aT0N1VCGT4",
      popular: false
    },
    {
      name: "Professional",
      price: "20",
      period: "month",
      description: "Ideal for growing businesses and power users who need advanced document analysis",
      features: [
        "Unlimited documents",
        "Advanced AI summarization",
        "All file formats (PDF, Word, PowerPoint)",
        "Priority support",
        "Fast processing (30s)",
        "Export in multiple formats",
        "Team collaboration"
      ],
      priceId: "price_1S82BQIDKmPOE5aTwhecvlb9",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact",
      description: "Tailored solutions for large organizations with high-volume document processing needs",
      features: [
        "Everything in Professional",
        "Custom AI models for specific document types",
        "API access and webhooks",
        "Dedicated support",
        "On-premise deployment options",
        "Custom integrations",
        "SLA guarantee"
      ],
      priceId: null,
      popular: false
    }
  ];

  return (
        <section
          className="py-20 bg-white"
          id="pricing"
          ref={ref}
        >

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ 
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your document analysis needs. All plans include our core AI-powered
              summarization features with no hidden fees.
            </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`relative group ${plan.popular ? 'md:-mt-8' : ''}`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
              transition={{ 
                duration: 0.7, 
                delay: 0.1 * index,
                ease: [0.25, 0.46, 0.45, 0.94],
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: {
                  duration: 0.3,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: {
                  duration: 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                </div>
              )}

                  <motion.div 
                    className={`relative h-full p-8 rounded-3xl border transition-all duration-500 ${
                      plan.popular
                        ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-500/50 shadow-2xl shadow-orange-500/20'
                        : 'bg-gray-50 border-gray-200 group-hover:border-gray-300 group-hover:shadow-xl group-hover:shadow-gray-200/50'
                    }`}
                    whileHover={{
                      boxShadow: plan.popular 
                        ? "0 25px 50px -12px rgba(249, 115, 22, 0.25)" 
                        : "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
                      transition: {
                        duration: 0.3,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }
                    }}
                  >
                {/* Background Glow */}
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-3xl blur-xl" />
                )}

                <div className="relative z-10">
                  {/* Plan Header */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price === 'Custom' ? 'Custom' : `$${plan.price}`}
                      </span>
                      {plan.price !== 'Custom' && (
                        <span className="text-gray-600">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <motion.div 
                    className="space-y-4 mb-8"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.2 + (0.1 * index),
                      staggerChildren: 0.1
                    }}
                  >
                    {plan.features.map((feature, featureIndex) => (
                      <motion.div 
                        key={featureIndex} 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: 0.3 + (0.1 * index) + (0.05 * featureIndex),
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        whileHover={{
                          x: 4,
                          transition: {
                            duration: 0.2,
                            ease: [0.25, 0.46, 0.45, 0.94]
                          }
                        }}
                      >
                        <motion.div
                          whileHover={{ 
                            scale: 1.2, 
                            rotate: 5,
                            transition: {
                              duration: 0.2,
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }
                          }}
                        >
                          <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </motion.div>
                        <span className="text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* CTA Button */}
                  {plan.priceId ? (
                    <div className="mt-6">
                      <WorkWithUsCard
                        name={plan.name}
                        price={plan.price}
                        description={plan.description}
                        period={plan.period}
                        borderColor="blue"
                        index={index}
                        priceId={plan.priceId}
                      />
                    </div>
                  ) : (
                    <button className="w-full py-4 px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all duration-300">
                      Contact Sales
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 }}
          transition={{ 
            duration: 0.8, 
            delay: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        >
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 border border-gray-300 rounded-full text-gray-700">
            <CheckIcon className="w-5 h-5 text-green-500" />
            <span>All plans include 30-day money-back guarantee</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
