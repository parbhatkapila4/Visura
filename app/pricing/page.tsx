"use client";
import Link from "next/link";
import { ArrowLeft, Check, Star, Zap, Shield, Users } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$10",
      period: "month",
      description: "Perfect for individuals and small teams getting started with document analysis",
      features: [
        "Up to 50 documents/month",
        "Basic AI summarization",
        "PDF & Word support",
        "Email support",
        "Standard processing speed",
      ],
      popular: false,
      cta: "Get Started",
    },
    {
      name: "Professional",
      price: "$20",
      period: "month",
      description:
        "Ideal for growing businesses and power users who need advanced document analysis",
      features: [
        "Unlimited documents",
        "Advanced AI summarization",
        "All file formats (PDF, Word, PowerPoint)",
        "Priority support",
        "Fast processing (30s)",
        "Export in multiple formats",
        "Team collaboration",
      ],
      popular: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact",
      description:
        "Tailored solutions for large organizations with high-volume document processing needs",
      features: [
        "Everything in Professional",
        "Custom AI models for specific document types",
        "API access and webhooks",
        "Dedicated support",
        "On-premise deployment options",
        "Custom integrations",
        "SLA guarantee",
      ],
      popular: false,
      cta: "Contact Sales",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Pricing</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Choose the perfect plan that fits your document analysis needs. All plans include our
            core AI-powered summarization features with no hidden fees.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`relative group ${plan.popular ? "md:-mt-8" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`relative h-full p-8 rounded-3xl border transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-500/50 shadow-2xl shadow-orange-500/20"
                    : "bg-gray-50 border-gray-200 group-hover:border-gray-300 group-hover:shadow-xl"
                }`}
              >
                {plan.popular && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-3xl blur-xl" />
                )}

                <div className="relative z-10">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price === "Custom" ? "Custom" : `$${plan.price}`}
                      </span>
                      {plan.price !== "Custom" && (
                        <span className="text-gray-600">/{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`w-full py-4 px-6 font-semibold rounded-xl transition-all duration-300 ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : plan.price === "Custom"
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect
                immediately, and we'll prorate any billing differences.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes! We offer a 14-day free trial for all plans. No credit card required to get
                started.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What file formats do you support?
              </h3>
              <p className="text-gray-600">
                We support PDF, Word, PowerPoint, Excel, plain text, and image files. Our AI can
                extract and analyze text from any of these formats.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do you offer refunds?</h3>
              <p className="text-gray-600">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact us for
                a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of professionals who trust Visura for their document analysis needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
