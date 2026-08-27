"use client";
import Link from "next/link";
import { ArrowLeft, Cookie, Settings, Eye, Shield, Database } from "lucide-react";

export default function CookiesSettingsPage() {
  return (
    <div className="min-h-screen w-full bg-black">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-4">
        <div className="w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Cookies Settings</h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl">
            Learn about how we use cookies and manage your cookie preferences on Visura.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="space-y-14">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">What Are Cookies?</h2>
              <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
                <Cookie className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                    Cookies are small text files that are stored on your device when you visit our
                    website. They help us provide you with a better experience by remembering your
                    preferences and enabling certain functionality.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Types of Cookies We Use
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
                  <Settings className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Essential Cookies
                    </h3>
                    <p className="text-zinc-400">
                      These cookies are necessary for the website to function properly. They enable
                      basic functions like page navigation, access to secure areas, and
                      authentication. The website cannot function properly without these cookies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
                  <Eye className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Analytics Cookies
                    </h3>
                    <p className="text-zinc-400">
                      These cookies help us understand how visitors interact with our website by
                      collecting and reporting information anonymously. This helps us improve our
                      website's performance and user experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
                  <Shield className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Security Cookies
                    </h3>
                    <p className="text-zinc-400">
                      These cookies are used to enhance the security of our platform and protect
                      against unauthorized access and malicious activities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
                  <Database className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Preference Cookies
                    </h3>
                    <p className="text-zinc-400">
                      These cookies remember your choices and preferences, such as language
                      settings, theme preferences, and other customization options.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Managing Your Cookie Preferences
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-6">
                You can control and manage cookies in several ways:
              </p>
              <ul className="space-y-3 text-base sm:text-lg text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>{" "}
                  <strong className="text-white">Browser Settings:</strong> Most web browsers allow
                  you to control cookies through their settings preferences
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>{" "}
                  <strong className="text-white">Opt-out Tools:</strong> You can use industry
                  opt-out tools to manage advertising cookies
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>{" "}
                  <strong className="text-white">Delete Cookies:</strong> You can delete cookies
                  that have already been set in your browser
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>{" "}
                  <strong className="text-white">Block Cookies:</strong> You can set your browser to
                  block cookies entirely, though this may affect functionality
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Third-Party Cookies
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Some cookies on our site are set by third-party services that we use, such as
                analytics providers and payment processors. These cookies are subject to the
                respective third parties' privacy policies.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Cookie Retention</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Different cookies have different retention periods. Session cookies are deleted when
                you close your browser, while persistent cookies remain on your device for a set
                period or until you delete them manually.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Updates to This Policy
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our
                practices or for other operational, legal, or regulatory reasons. We will notify you
                of any material changes by posting the updated policy on this page.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Contact Us</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                If you have any questions about our use of cookies or this Cookie Policy, please
                contact us at:
              </p>
              <div className="mt-4 p-4 sm:p-5 rounded-xl border border-white/10 bg-zinc-900/60">
                <p className="text-white font-semibold">Email: parbhat@parbhat.dev</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
