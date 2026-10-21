import Link from "next/link";

export const metadata = {
  title: "Sign-in help | Visura",
  description: "Troubleshooting sign-in and Cloudflare 1016 errors",
};

export default function SignInHelpPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-lg w-full rounded-xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-xl font-semibold text-white mb-2">Sign-in not working?</h1>
        <p className="text-white/70 text-sm mb-6">
          Visura signs you in through Clerk. If clicking Sign in leads to an error page such as{" "}
          <strong className="text-white/90">Cloudflare Error 1016</strong>, or the sign-in page
          never gets past Loading…, try these in order.
        </p>
        <ul className="space-y-3 text-sm text-white/80 mb-8">
          <li>
            <strong className="text-white">1.</strong> Go back to the{" "}
            <Link href="/" className="text-white underline hover:no-underline">
              home page
            </Link>{" "}
            and click Sign in again in a few minutes.
          </li>
          <li>
            <strong className="text-white">2.</strong> Try a different browser (e.g. Edge or
            Firefox) or an incognito/private window.
          </li>
          <li>
            <strong className="text-white">3.</strong> If the sign-in page keeps loading, click
            Clear session and sign in again under the spinner, and check that your device&apos;s
            clock is set to the right time.
          </li>
        </ul>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
