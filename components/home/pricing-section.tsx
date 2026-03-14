"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PricingWithChart } from "@/components/ui/pricing-with-chart";

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="pricing" className="relative py-32 bg-black">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PricingWithChart />
        </motion.div>
      </div>
    </section>
  );
}
