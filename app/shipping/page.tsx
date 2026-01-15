"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Globe2,
  Clock4,
  ShieldCheck,
  Headset,
} from "lucide-react";

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
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Shipping Policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Learn how Visura delivers digital products, handles provisioning timelines, and supports
            customer access around the globe.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Digital Delivery</h2>
              <div className="flex items-start gap-4">
                <Package className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Visura is a fully digital platform. Once your payment is confirmed, account upgrades
                    and feature access are delivered instantly to the email address associated with your
                    account. No physical shipping is required.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Global Availability</h2>
              <div className="flex items-start gap-4">
                <Globe2 className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Our services are available worldwide wherever internet access is permitted by local
                    regulations. Certain payment methods may vary by region, but access to the Visura
                    platform remains consistent.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Provisioning Timeline</h2>
              <div className="flex items-start gap-4">
                <Clock4 className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Under normal circumstances, premium features become available within minutes after
                    payment confirmation. If you do not see the changes reflected, please log out and back
                    in, or contact support with your order details.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Secure Access</h2>
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    All digital deliveries are processed through secure, encrypted systems. You are
                    responsible for safeguarding your login credentials and ensuring that only authorized
                    team members access your subscription.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Need Assistance?</h2>
              <div className="flex items-start gap-4">
                <Headset className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Our support team is available to help with any access issues, billing questions, or
                    account provisioning concerns. Reach out and we will respond within one business day.
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

