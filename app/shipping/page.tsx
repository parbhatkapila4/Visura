"use client";

import Link from "next/link";
import { ArrowLeft, Package, Globe2, Clock4, ShieldCheck, Headset } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-16">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Shipping policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Visura is software you use in the browser. Nothing is shipped: your plan changes once
            the payment is confirmed.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Digital delivery</h2>
              <div className="flex items-start gap-4">
                <Package className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Nothing physical is shipped. Once the payment is confirmed, the plan changes on
                    the Visura account you paid from, and that account can keep as many documents as
                    the plan allows.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Availability</h2>
              <div className="flex items-start gap-4">
                <Globe2 className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Visura runs in the browser, so there is no delivery address or region. Nothing
                    in Visura blocks sign-in by country, but checkout cannot take payment from the
                    UK, Canada, Australia or Singapore.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">When your plan changes</h2>
              <div className="flex items-start gap-4">
                <Clock4 className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Your plan changes once the payment is confirmed. If your new limit does not
                    show, refresh the page. If it still does not show, email us with the date you
                    paid.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Payments and sign-in</h2>
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Razorpay takes the payment, and your card or bank details go to Razorpay, not to
                    Visura. The plan belongs to the account that paid for it, so keep your sign-in
                    details to yourself.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Need help?</h2>
              <div className="flex items-start gap-4">
                <Headset className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Email the address below with questions about access or billing.
                  </p>
                </div>
              </div>
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
