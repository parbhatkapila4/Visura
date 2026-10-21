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
            Back to home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Privacy policy</h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl">
            What Visura collects, which services receive it, and how to have it deleted.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="space-y-14">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Introduction</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed">
                Visura turns the documents you upload into summaries you can read and chat with. To
                do that it stores your files and their text, and sends that text to AI models
                through OpenRouter. This page lists what Visura collects, which services receive it,
                and what deleting a document does and does not remove.
              </p>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Information we collect
              </h2>
              <div className="space-y-5">
                <div className="group rounded-2xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-6 transition-colors hover:border-white/[0.12] hover:bg-zinc-800/50">
                  <div className="flex items-start gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1.5">
                        Account information
                      </h3>
                      <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                        When you sign up, Clerk collects your email address and, if you give it,
                        your name. Visura copies both into its own database, along with your plan
                        and, once you pay, the Razorpay order and payment IDs. These are used to
                        sign you in, apply the plan you bought and enforce its document limit. If
                        you email us, we also have whatever you include.
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
                      <h3 className="text-lg font-semibold text-white mb-1.5">Documents</h3>
                      <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                        The files you upload, the text extracted from them, and what Visura makes
                        from that text: sections, summaries, embeddings, insights, a graph of what
                        the document mentions and descriptions of what changed between versions.
                        Your chat messages and the answers are stored too, as is a record of which
                        summaries you downloaded. This is used to show you your documents, answer
                        your questions and count your downloads.
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
                      <h3 className="text-lg font-semibold text-white mb-1.5">Usage information</h3>
                      <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                        Visura runs no analytics or tracking scripts. The server logs what it does,
                        such as which feature you used and whether a request failed. A log line can
                        include your account ID, your email address, the link to a file you
                        uploaded, or text from your document or its summary. On the checkout pages,
                        Visura reads the country our host derives from your IP address to show
                        prices in your currency.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                Services that receive your data
              </h2>
              <ul className="space-y-3 text-base sm:text-lg text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Vercel hosts the app. Every request passes
                  through it, including your IP address, and it receives the server logs.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Clerk runs sign-in and holds your account:
                  your email address, name and sign-in sessions.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Supabase stores the files you upload. Each
                  file sits at a public link that Visura does not show on any page, and anyone who
                  has the link can open the file.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Neon hosts the database: your account
                  record, documents and their text, versions, sections, summaries, embeddings,
                  insights, the document graph, change descriptions, download records, chat history
                  and workspaces.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> OpenRouter receives document text to write
                  summaries, sections, insights, the document graph and change descriptions and to
                  create embeddings, text from a workspace&apos;s documents when you analyze that
                  workspace, what you search for in a workspace, and your chat messages with text
                  from the document. It passes each request to a model from Anthropic, OpenAI or
                  Google.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Upstash counts your chat requests, keyed
                  by your account ID, to enforce the chat rate limit. It also caches summaries,
                  document-type guesses and embedding vectors, keyed by a hash of the text they came
                  from.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Razorpay takes payments. Each order
                  carries your email address, account ID and plan, and you enter your payment
                  details in Razorpay&apos;s own checkout.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> If an alert webhook is configured, Visura
                  posts to it when a processing limit stops your upload or a document fails to
                  process. The alert can include your account ID, the ID of the document or its
                  version, and the error message.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Data security</h2>
              <div className="group rounded-2xl border border-white/[0.08] bg-zinc-900/50 backdrop-blur-sm p-6 sm:p-6 transition-colors hover:border-white/[0.12] hover:bg-zinc-800/50">
                <div className="flex items-start gap-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                      Your data is held by the services listed above, and Visura relies on their
                      security. Visura adds no encryption of its own.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Your data</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-4">
                Deleting a document from your dashboard removes its summary, its chat history and
                its share link. It does not remove the uploaded file, the document&apos;s versions
                or what was built from them: the passages and their summaries, sections, insights,
                the document graph, descriptions of what changed and embeddings. Cached copies in
                Upstash stay until they expire.
              </p>
              <ul className="space-y-3 text-base sm:text-lg text-zinc-400">
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Email parbhat@parbhat.dev to have your
                  documents, uploaded files and account data deleted
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> Email the same address to ask what Visura
                  holds about you
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span> If you create a share link for a summary,
                  anyone who has the link can read that summary
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Contact us</h2>
              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed mb-5">
                Send questions about this policy or your data to:
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
