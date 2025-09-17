"use client";
import { cn } from "@/lib/utils";
import {  pricingPlans } from "@/utils/constants";
import { ArrowRight, CheckIcon } from "lucide-react";
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


const PricingCard = ({
  name,
  price,
  description,
  items,
  id,
  priceId,
  index,
}: PriceType & { index: number }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    if (!priceId) {
      console.error('Price ID not available');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cardVariants = {
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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.3 + index * 0.2 + i * 0.1,
        duration: 0.4,
      },
    }),
  };

  return (
    <motion.div 
      className="relative w-full max-w-lg"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.05,
        y: -10,
        transition: { duration: 0.3 }
      }}
    >
      <motion.div
        className={cn(
          "relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 rounded-2xl border-[1px] border-gray-600/50 bg-gray-800/80 backdrop-blur-xs shadow-sm",
          id === "pro" ? "border-[#04724D] gap-5 border-2 shadow-lg" : ""
        )}
        whileHover={{ 
          borderColor: id === "pro" ? "#04724D" : "#059669",
          boxShadow: "0 20px 40px rgba(4, 114, 77, 0.3)",
          transition: { duration: 0.3 }
        }}
      >
        <motion.div 
          className="flex justify-between items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + index * 0.2 }}
        >
          <div>
            <motion.p 
              className="text-lg lg:text-xl font-bold capitalize text-white"
              whileHover={{ scale: 1.05 }}
            >
              {name}
            </motion.p>
            <p className="text-gray-300 mt-2">{description}</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.2 }}
        >
          <motion.p 
            className="text-5xl tracking-tight font-extrabold text-white"
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: index * 0.5
            }}
          >
            ${price}
          </motion.p>
          <div className="flex flex-col justify-end mb-[4px]">
            <p className="text-xs uppercase font-semibold mt-1 text-white">USD</p>
            <p className="text-xs text-gray-300 mt-1">/ month</p>
          </div>
        </motion.div>
        
        <div className="space-y-2.5 leading-loose text-base flex-1">
          {items.map((item, itemIndex) => (
            <motion.li 
              key={itemIndex} 
              className="flex items-center gap-2"
              custom={itemIndex}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.2,
                  rotate: 360,
                  transition: { duration: 0.3 }
                }}
              >
                <CheckIcon size={18} className="text-[#04724D]" />
              </motion.div>
              <motion.span 
                className="text-gray-300"
                whileHover={{ 
                  color: "#04724D",
                  x: 5,
                  transition: { duration: 0.2 }
                }}
              >
                {item}
              </motion.span>
            </motion.li>
          ))}
        </div>
        
        <motion.div 
          className="space-y-2 flex justify-center w-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + index * 0.2 }}
        >
          <motion.button
            onClick={handleCheckout}
            disabled={isLoading || !priceId}
            className={cn(
              "w-full rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#04724D] to-[#059669] hover:from-[#059669] hover:to-[#04724D] text-white border-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300",
              id === "pro"
                ? "border-[#04724D] shadow-lg"
                : "border-[#04724D]/20"
            )}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 10px 20px rgba(4, 114, 77, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Loading...
              </motion.span>
            ) : (
              <>
                Try Now
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={18} />
                </motion.div>
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
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
    <section className="relative overflow-hidden" id="pricing" ref={ref}>
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
        <motion.div 
          className="flex items-center justify-center w-full pb-12"
          variants={titleVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h2 
            className="uppercase font-bold text-xl mb-8 text-[#04724D]"
            whileHover={{ 
              scale: 1.1,
              color: "#059669",
              transition: { duration: 0.3 }
            }}
          >
            Pricing
          </motion.h2>
        </motion.div>
        
        <motion.div 
          className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {pricingPlans.map((plan, index) => (
            <PricingCard key={plan.id} {...plan} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
