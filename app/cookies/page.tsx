"use client";
import Link from "next/link";
import { ArrowLeft, Cookie, Settings, Eye, Shield, Database } from "lucide-react";

export default function CookiesSettingsPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="bg-black text-white py-16">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Cookies Settings</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Learn about how we use cookies and manage your cookie preferences on Visura.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-black mb-6">What Are Cookies?</h2>
              <div className="flex items-start gap-4">
                <Cookie className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Cookies are small text files that are stored on your device when you visit our
                    website. They help us provide you with a better experience by remembering your
                    preferences and enabling certain functionality.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Types of Cookies We Use</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Settings className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Essential Cookies</h3>
                    <p className="text-gray-700">
                      These cookies are necessary for the website to function properly. They enable
                      basic functions like page navigation, access to secure areas, and
                      authentication. The website cannot function properly without these cookies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Eye className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Analytics Cookies</h3>
                    <p className="text-gray-700">
                      These cookies help us understand how visitors interact with our website by
                      collecting and reporting information anonymously. This helps us improve our
                      website's performance and user experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Security Cookies</h3>
                    <p className="text-gray-700">
                      These cookies are used to enhance the security of our platform and protect
                      against unauthorized access and malicious activities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Database className="w-6 h-6 text-black mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Preference Cookies</h3>
                    <p className="text-gray-700">
                      These cookies remember your choices and preferences, such as language
                      settings, theme preferences, and other customization options.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">
                Managing Your Cookie Preferences
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                You can control and manage cookies in several ways:
              </p>
              <ul className="space-y-3 text-lg text-gray-700">
                <li>
                  • <strong>Browser Settings:</strong> Most web browsers allow you to control
                  cookies through their settings preferences
                </li>
                <li>
                  • <strong>Opt-out Tools:</strong> You can use industry opt-out tools to manage
                  advertising cookies
                </li>
                <li>
                  • <strong>Delete Cookies:</strong> You can delete cookies that have already been
                  set in your browser
                </li>
                <li>
                  • <strong>Block Cookies:</strong> You can set your browser to block cookies
                  entirely, though this may affect functionality
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Third-Party Cookies</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Some cookies on our site are set by third-party services that we use, such as
                analytics providers and payment processors. These cookies are subject to the
                respective third parties' privacy policies.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Cookie Retention</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Different cookies have different retention periods. Session cookies are deleted when
                you close your browser, while persistent cookies remain on your device for a set
                period or until you delete them manually.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Updates to This Policy</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our
                practices or for other operational, legal, or regulatory reasons. We will notify you
                of any material changes by posting the updated policy on this page.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-black mb-6">Contact Us</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                If you have any questions about our use of cookies or this Cookie Policy, please
                contact us at:
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
