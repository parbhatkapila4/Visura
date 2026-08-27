"use client";
import Link from "next/link";
import { ArrowLeft, Lock, Eye, Database, UserCheck, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-4">
        <div className="w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl">
            Learn how we collect, use, and protect your personal information when using Visura.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="space-y-14">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Introduction</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                At Visura, we are committed to protecting your privacy and ensuring the security of
                your personal information. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our AI-powered document
                analysis platform.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Information We Collect
              </h2>
              <div className="space-y-5">
                <div className="group rounded-2xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-6 transition-colors hover:border-white/[0.12] hover:bg-zinc-800/50">
                  <div className="flex items-start gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1.5">
                        Personal Information
                      </h3>
                      <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                        We collect information you provide directly to us, such as when you create
                        an account, upload documents, or contact us for support. This may include
                        your name, email address, and any other information you choose to provide.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-2xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-6 transition-colors hover:border-white/[0.12] hover:bg-zinc-800/50">
                  <div className="flex items-start gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1.5">Document Data</h3>
                      <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                        We process the documents you upload to provide our analysis services. This
                        includes the content, metadata, and extracted insights from your documents.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group rounded-2xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-6 transition-colors hover:border-white/[0.12] hover:bg-zinc-800/50">
                  <div className="flex items-start gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1.5">Usage Information</h3>
                      <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                        We automatically collect certain information about your use of our service,
                        including your IP address, browser type, device information, and usage
                        patterns.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                How We Use Your Information
              </h2>
              <ul className="space-y-3 text-base sm:text-lg text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Provide and maintain our document analysis
                  services
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Process and analyze your uploaded
                  documents
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Communicate with you about your account
                  and our services
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Improve our platform and develop new
                  features
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Ensure the security and integrity of our
                  services
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Comply with legal obligations and protect
                  our rights
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Data Security</h2>
              <div className="group rounded-2xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-6 transition-colors hover:border-white/[0.12] hover:bg-zinc-800/50">
                <div className="flex items-start gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                      We implement appropriate technical and organizational measures to protect your
                      personal information against unauthorized access, alteration, disclosure, or
                      destruction. This includes encryption of data in transit and at rest, secure
                      data centers, and regular security audits.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Your Rights</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-4">
                You have certain rights regarding your personal information, including:
              </p>
              <ul className="space-y-3 text-base sm:text-lg text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Access to your personal information
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Correction of inaccurate information
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Deletion of your personal information
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Portability of your data
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Objection to certain processing activities
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Withdrawal of consent where applicable
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Contact Us</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-5">
                If you have any questions about this Privacy Policy or our data practices, please
                contact us at:
              </p>
              <a
                href="mailto:parbhat@parbhat.dev"
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur-sm p-5 sm:p-6 transition-colors hover:border-primary/30 hover:bg-zinc-800/50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-0.5">
                    Email
                  </p>
                  <p className="text-white font-semibold group-hover:text-primary transition-colors">
                    parbhat@parbhat.dev
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
