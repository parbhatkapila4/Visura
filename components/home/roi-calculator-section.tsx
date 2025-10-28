"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Calculator, Clock, DollarSign, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ROICalculatorSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [documentsPerWeek, setDocumentsPerWeek] = useState(10);
  const [hourlyRate, setHourlyRate] = useState(150);

  // Calculate ROI
  const hoursSavedPerWeek = documentsPerWeek * 2; // 2 hours per document on average
  const monthlySavings = (hoursSavedPerWeek * hourlyRate * 4.33).toFixed(0);
  const annualSavings = (hoursSavedPerWeek * hourlyRate * 52).toFixed(0);
  const monthlyROI = ((parseInt(monthlySavings) - 20) / 20 * 100).toFixed(0);

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Calculate Your
            <span className="block bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Time Savings
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See exactly how much time and money you'll save with Visura. 
            Most founders save 15+ hours per week and $2,400+ monthly.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Calculator */}
          <motion.div
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">ROI Calculator</h3>
            </div>

            {/* Input Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-3">
                  Documents you process per week
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={documentsPerWeek}
                    onChange={(e) => setDocumentsPerWeek(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="w-16 text-center">
                    <span className="text-2xl font-bold text-blue-400">{documentsPerWeek}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white font-semibold mb-3">
                  Your hourly rate ($)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="w-20 text-center">
                    <span className="text-2xl font-bold text-indigo-400">${hourlyRate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {hoursSavedPerWeek}+
                  </div>
                  <div className="text-sm text-gray-400">Hours saved/week</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-400 mb-1">
                    ${monthlySavings}
                  </div>
                  <div className="text-sm text-gray-400">Monthly savings</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Display */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Main ROI Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-sm border border-blue-500/30 rounded-3xl p-8">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-blue-400 mb-2">
                  {monthlyROI}%
                </div>
                <div className="text-xl text-white font-semibold">Monthly ROI</div>
                <div className="text-gray-300">On your $20/month investment</div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    ${annualSavings}
                  </div>
                  <div className="text-sm text-gray-400">Annual savings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {Math.round(hoursSavedPerWeek * 52)}+
                  </div>
                  <div className="text-sm text-gray-400">Hours saved/year</div>
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div className="space-y-4">
              {[
                {
                  icon: Clock,
                  title: "Instant Processing",
                  description: "30 seconds vs 2+ hours per document"
                },
                {
                  icon: TrendingUp,
                  title: "Better Decisions",
                  description: "Focus on insights, not reading"
                },
                {
                  icon: DollarSign,
                  title: "Massive ROI",
                  description: "Pays for itself in the first week"
                }
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{benefit.title}</div>
                      <div className="text-gray-400 text-sm">{benefit.description}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button
                size="lg"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-2xl shadow-blue-500/25 transition-all duration-300"
              >
                Start Saving Time Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-gray-400 text-sm mt-4">
                Join 2,500+ founders already saving time
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
