"use client";
import Link from "next/link";
import { ArrowLeft, Cookie, Settings, Shield, Database } from "lucide-react";

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
            Back to home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Cookies</h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl">
            What Visura and the services it uses store in your browser, and why.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="space-y-14">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">What cookies are</h2>
              <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
                <Cookie className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                    Cookies are small pieces of data a website stores in your browser. Visura uses
                    them to keep you signed in, and Razorpay&apos;s checkout may add its own when
                    you pay. Visura runs no analytics or advertising scripts.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                What this site stores
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
                  <Settings className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Sign-in cookies (Clerk)
                    </h3>
                    <p className="text-zinc-400">
                      Clerk sets the cookies that keep you signed in, such as __session and
                      __client_uat, plus short-lived ones such as __clerk_handshake while it checks
                      your session. On Clerk development instances it also sets __clerk_db_jwt.
                      Signing in does not work without them.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
                  <Shield className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Payment cookies (Razorpay)
                    </h3>
                    <p className="text-zinc-400">
                      When you press pay on a checkout page, Visura loads Razorpay&apos;s checkout
                      script from checkout.razorpay.com, and Razorpay may set its own cookies from
                      then on. No other page loads it.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5">
                  <Database className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Browser storage
                    </h3>
                    <p className="text-zinc-400">
                      Visura can write two entries to session storage: visura_signin_redirect_ts, a
                      timestamp the sign-in page uses to catch redirect loops, and
                      visura-logout-pending, which keeps the loading screen up while you sign out.
                      When you upload or compare a scanned PDF, the page downloads a
                      text-recognition engine and its English data from cdn.jsdelivr.net and keeps
                      the data in IndexedDB (keyval-store) so it is not downloaded again.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Controlling cookies
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-6">
                Visura has no cookie settings of its own. Your browser controls them:
              </p>
              <ul className="space-y-3 text-base sm:text-lg text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>{" "}
                  <strong className="text-white">Browser settings:</strong> Most browsers let you
                  see and control cookies in their settings
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>{" "}
                  <strong className="text-white">Delete cookies:</strong> You can delete cookies
                  that have already been set in your browser
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>{" "}
                  <strong className="text-white">Block cookies:</strong> Blocking them entirely
                  stops sign-in from working
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Third-party cookies
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Clerk&apos;s and Razorpay&apos;s cookies are covered by their own privacy policies.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">How long they last</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Session storage clears when you close the tab. The text-recognition data in
                IndexedDB stays until you clear this site&apos;s data. Clerk and Razorpay decide how
                long their cookies last.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Contact us</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Send questions about cookies or this page to:
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
