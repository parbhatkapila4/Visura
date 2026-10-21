"use client";
import Link from "next/link";
import { ArrowLeft, Check, Zap, Shield, Users } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "10",
      period: "one-time payment",
      description: "Every feature, with room for a few more documents.",
      features: [
        "Keep up to 10 documents",
        "AI summary and chat for every document",
        "PDF, DOCX, PPTX, XLSX, XLS, TXT and MD files up to 32 MB",
        "2 summary downloads, as PDF",
      ],
      popular: false,
      cta: "Buy Starter",
      href: "/checkout/starter",
    },
    {
      name: "Pro",
      price: "20",
      period: "one-time payment",
      description: "Every feature, with room for a large library.",
      features: [
        "Keep up to 1,000 documents",
        "AI summary and chat for every document",
        "PDF, DOCX, PPTX, XLSX, XLS, TXT and MD files up to 32 MB",
        "2 summary downloads, as PDF",
      ],
      popular: true,
      cta: "Buy Pro",
      href: "/checkout",
    },
    {
      name: "Free",
      price: "Free",
      period: "",
      description: "Try every feature with no payment.",
      features: [
        "Keep up to 5 documents",
        "AI summary and chat for every document",
        "PDF, DOCX, PPTX, XLSX, XLS, TXT and MD files up to 32 MB",
        "2 summary downloads, as PDF",
      ],
      popular: false,
      cta: "Sign up free",
      href: "/sign-up",
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
            Back to home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Pricing</h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Every plan has the same features. Plans differ only in how many documents your account
            can keep, and each new version of a document counts as one. Paid plans are a one-time
            payment, and nothing renews. Prices are in US dollars. Checkout charges in rupees, US
            dollars or euros, depending on where you are. It cannot take payment from the UK,
            Canada, Australia or Singapore.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div key={index} className={`relative group ${plan.popular ? "md:-mt-8" : ""}`}>
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
                        {plan.price === "Free" ? "Free" : `$${plan.price}`}
                      </span>
                      {plan.price !== "Free" && (
                        <span className="text-gray-600">{plan.period}</span>
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

                  <Link
                    href={plan.href}
                    className={`block w-full py-4 px-6 text-center font-semibold rounded-xl transition-all duration-300 ${
                      plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : plan.price === "Free"
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Can I move from Starter to Pro?
              </h3>
              <p className="text-gray-600">
                Yes. Buy Pro at its full price and your plan changes once the payment is confirmed.
                Your documents stay where they are. Payments are not prorated.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a free trial?</h3>
              <p className="text-gray-600">
                No. The free plan has every feature, keeps up to 5 documents and does not expire.
                You can sign up without payment details.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What file formats do you support?
              </h3>
              <p className="text-gray-600">
                PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx and .xls), plain text and
                Markdown, up to 32 MB per file. Your browser reads the first 50 pages of a PDF. If
                it cannot read the file, the server reads the whole file instead. If a PDF has no
                text layer, such as a scan, only its first 10 pages are read, with English OCR.
                Older .doc and .ppt files and images are not supported.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Start on the free plan</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign up free
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
