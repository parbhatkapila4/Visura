"use client";
import { cn } from "@/lib/utils";
import {  pricingPlans } from "@/utils/constants";
import { ArrowRight, CheckIcon } from "lucide-react";
import { useState } from "react";

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
}: PriceType) => {
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

  return (
    <div className="relative w-full max-w-lg hover:scale-105 hover:transition-all duration-300">
      <div
        className={cn(
          "relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 rounded-2xl border-[1px] border-gray-600/50 bg-gray-800/80 backdrop-blur-xs shadow-sm",
          id === "pro" ? "border-[#04724D] gap-5 border-2 shadow-lg" : ""
        )}
      >
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-lg lg:text-xl font-bold capitalize text-white">{name}</p>
            <p className="text-gray-300 mt-2">{description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <p className="text-5xl tracking-tight font-extrabold text-white">${price}</p>
          <div className="flex flex-col justify-end mb-[4px]">
            <p className="text-xs uppercase font-semibold mt-1 text-white">USD</p>
            <p className="text-xs text-gray-300 mt-1">/ month</p>
          </div>
        </div>
        <div className="space-y-2.5 leading-loose text-base flex-1">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckIcon size={18} className="text-[#04724D]" />
              <span className="text-gray-300">{item}</span>
            </li>
          ))}
        </div>
        <div className="space-y-2 flex justify-center w-full">
          <button
            onClick={handleCheckout}
            disabled={isLoading || !priceId}
            className={cn(
              "w-full rounded-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#04724D] to-[#059669] hover:from-[#059669] hover:to-[#04724D] text-white border-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300",
              id === "pro"
                ? "border-[#04724D] shadow-lg"
                : "border-[#04724D]/20"
            )}
          >
            {isLoading ? 'Loading...' : 'Try Now'} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function PricingSection() {
  return (
    <section className="relative overflow-hidden" id="pricing">
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
        <div className="flex items-center justify-center w-full pb-12">
          <h2 className="uppercase font-bold text-xl mb-8 text-[#04724D]">
            Pricing
          </h2>
        </div>
        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
