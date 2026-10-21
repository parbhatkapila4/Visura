"use client";
import Link from "next/link";
import { ArrowLeft, Mail, ArrowRight, Twitter, Linkedin, Github } from "lucide-react";

export default function ContactPage() {
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
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Contact</h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl">
            Send questions, bug reports and billing problems by email.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-6 sm:p-8 lg:p-10 xl:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,340px)_minmax(0,1fr)] gap-10 lg:gap-14 xl:gap-20">
              <div className="space-y-8 lg:space-y-10">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Get in touch</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <a
                        href="mailto:parbhat@parbhat.dev"
                        className="text-lg text-zinc-400 hover:text-white transition-colors"
                      >
                        parbhat@parbhat.dev
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-500 tracking-[0.16em] uppercase mb-3">
                      Find us
                    </h3>
                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      <a
                        href="https://x.com/Parbhat03"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">Twitter</span>
                      </a>
                      <a
                        href="https://www.linkedin.com/in/parbhat-kapila/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                      <a
                        href="https://github.com/parbhatkapila4/Visura"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                      >
                        <Github className="w-5 h-5" />
                        <span className="text-sm">GitHub</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-6 lg:mb-8">
                  <p className="text-xs font-semibold text-zinc-500 tracking-[0.18em] uppercase mb-2">
                    Email
                  </p>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white">Before you write</h3>
                </div>

                <p className="text-lg text-zinc-400 mb-6">
                  Send it from the address you sign in with, so it can be matched to your account.
                  If it is about a document, include the document&apos;s name.
                </p>

                <a
                  href="mailto:parbhat@parbhat.dev"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all group bg-primary text-primary-foreground hover:opacity-90"
                >
                  Email parbhat@parbhat.dev
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
