"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, Clock3, CreditCard, FileWarning, HelpCircle } from "lucide-react";

export default function CancellationRefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Cancellation &amp; Refund Policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Understand how cancellations, plan downgrades, and refund requests are handled at
            Visura.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Overview</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We aim to make your experience with Visura transparent and flexible. This policy
                outlines how cancellations work, what happens when you change or downgrade your
                plan, and the circumstances under which refunds are provided.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Cancelling Your Subscription</h2>
              <div className="flex items-start gap-4">
                <RefreshCw className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    You can cancel your subscription at any time from within your account settings.
                    Once cancelled, you will retain access to premium features until the end of your
                    current billing cycle. After the cycle ends, your account will automatically
                    revert to the free plan.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Refund Eligibility</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Initial Purchase</h3>
                    <p className="text-gray-700">
                      We offer a full refund for annual subscriptions within the first 14 days of
                      purchase if the product does not meet your expectations. Monthly subscriptions
                      are non-refundable but can be cancelled to prevent future charges.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock3 className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Prorated Adjustments</h3>
                    <p className="text-gray-700">
                      If you upgrade or downgrade your plan mid-cycle, we automatically apply
                      prorated credits toward your next invoice. These credits cannot be exchanged
                      for cash refunds.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Exceptions</h2>
              <div className="flex items-start gap-4">
                <FileWarning className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Refunds are not granted for accounts found to violate our Terms of Service,
                    misuse of the platform, or for requests submitted more than 60 days after the
                    original transaction date unless required by applicable law.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">How to Request a Refund</h2>
              <div className="flex items-start gap-4">
                <HelpCircle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    To request a refund, contact our support team with your account email, purchase
                    ID, and a brief explanation. We review all requests within 5 business days and
                    respond with the outcome and next steps.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Need More Help?</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                If you have additional questions about cancellations or refunds, please reach out to
                our team so we can assist you directly.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-black font-semibold">Email: help@productsolution.net</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
