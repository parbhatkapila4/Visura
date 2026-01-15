"use client";
import Link from "next/link";
import { ArrowLeft, FileText, Scale, AlertTriangle, Shield, Users } from "lucide-react";

export default function TermsOfServicePage() {
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
          <h1 className="text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Please read these terms carefully before using our AI-powered document analysis
            platform.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Agreement to Terms</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                By accessing and using Visura, you accept and agree to be bound by the terms and
                provision of this agreement. If you do not agree to abide by the above, please do
                not use this service.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Service Description</h2>
              <div className="flex items-start gap-4">
                <FileText className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Visura is an AI-powered document analysis platform that helps users process,
                    analyze, and extract insights from various document formats. Our service
                    includes document upload, AI-powered analysis, summarization, and export
                    capabilities.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">User Responsibilities</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Account Security</h3>
                    <p className="text-gray-700">
                      You are responsible for maintaining the confidentiality of your account
                      credentials and for all activities that occur under your account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Content Compliance</h3>
                    <p className="text-gray-700">
                      You agree not to upload, process, or share any content that is illegal,
                      harmful, threatening, abusive, or violates any third-party rights.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Service Availability</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We strive to provide continuous service availability, but we do not guarantee
                uninterrupted access. We may temporarily suspend the service for maintenance,
                updates, or other operational reasons with reasonable notice when possible.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Intellectual Property</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                The Visura platform, including its design, functionality, and underlying technology,
                is protected by intellectual property laws. You retain ownership of your uploaded
                documents and any content you create using our service.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Limitation of Liability</h2>
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    To the maximum extent permitted by law, Visura shall not be liable for any
                    indirect, incidental, special, consequential, or punitive damages, including but
                    not limited to loss of profits, data, or business opportunities.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Termination</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice, for
                conduct that we believe violates these Terms of Service or is harmful to other
                users, us, or third parties, or for any other reason.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Changes to Terms</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any
                material changes by posting the new terms on this page and updating the "Last
                Updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Contact Information</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
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
