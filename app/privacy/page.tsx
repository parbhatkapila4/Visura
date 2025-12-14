"use client";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Learn how we collect, use, and protect your personal information when using Visura.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Introduction</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                At Visura, we are committed to protecting your privacy and ensuring the security of
                your personal information. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our AI-powered document
                analysis platform.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Information We Collect</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <UserCheck className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Personal Information</h3>
                    <p className="text-gray-700">
                      We collect information you provide directly to us, such as when you create an
                      account, upload documents, or contact us for support. This may include your
                      name, email address, and any other information you choose to provide.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Database className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Document Data</h3>
                    <p className="text-gray-700">
                      We process the documents you upload to provide our analysis services. This
                      includes the content, metadata, and extracted insights from your documents.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Eye className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Usage Information</h3>
                    <p className="text-gray-700">
                      We automatically collect certain information about your use of our service,
                      including your IP address, browser type, device information, and usage
                      patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">How We Use Your Information</h2>
              <ul className="space-y-3 text-lg text-gray-700">
                <li>• Provide and maintain our document analysis services</li>
                <li>• Process and analyze your uploaded documents</li>
                <li>• Communicate with you about your account and our services</li>
                <li>• Improve our platform and develop new features</li>
                <li>• Ensure the security and integrity of our services</li>
                <li>• Comply with legal obligations and protect our rights</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Data Security</h2>
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    We implement appropriate technical and organizational measures to protect your
                    personal information against unauthorized access, alteration, disclosure, or
                    destruction. This includes encryption of data in transit and at rest, secure
                    data centers, and regular security audits.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Your Rights</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                You have certain rights regarding your personal information, including:
              </p>
              <ul className="space-y-3 text-lg text-gray-700">
                <li>• Access to your personal information</li>
                <li>• Correction of inaccurate information</li>
                <li>• Deletion of your personal information</li>
                <li>• Portability of your data</li>
                <li>• Objection to certain processing activities</li>
                <li>• Withdrawal of consent where applicable</li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Contact Us</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please
                contact us at:
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
