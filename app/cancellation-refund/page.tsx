"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw, CreditCard, FileWarning, HelpCircle } from "lucide-react";

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
            Back to home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Cancellation and refund policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Starter and Pro are paid for once. This page covers what that means for cancelling and
            for refunds.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Overview</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Every Visura purchase is a one-time payment taken through Razorpay. There is no
                subscription: nothing renews, and Visura does not charge you again unless you pay
                again at checkout.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Cancelling</h2>
              <div className="flex items-start gap-4">
                <RefreshCw className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    There is no subscription to cancel and no billing cycle to wait out. Deleting
                    your documents does not close your account and does not refund a payment.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Refunds</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">
                      No trial, no proration, no fixed refund window
                    </h3>
                    <p className="text-gray-700">
                      Visura has no free trial, gives no prorated credit when you move between
                      plans, and does not promise a refund within a set number of days. If you want
                      your money back, ask, and we will look at your request.
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
                    We do not refund payments on accounts suspended for breaking our Terms of
                    Service, unless the law requires us to.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">How to ask for a refund</h2>
              <div className="flex items-start gap-4">
                <HelpCircle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Email parbhat@parbhat.dev from the address you sign in to Visura with. Say which
                    plan you bought, when you paid, and why you want a refund.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Other questions</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Send anything else about a payment to the same address.
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-black font-semibold">Email: parbhat@parbhat.dev</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
