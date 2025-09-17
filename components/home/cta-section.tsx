import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Upload, FileText } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function CTASection() {
  return (
    <section className="bg-gray-50 py-12 ">
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 ">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to unlock hours of productive reading time?
            </h2>
            <p className="mx-auto max-w-6xl text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-[20px]/relaxed dark:text-gray-400  ">
              Convert lengthy documents into clear, actionable knowledge with
              our AI-powered synthesizer.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
            <SignedOut>
              <Button
                size="lg"
                variant={"link"}
                className="w-full min-[400px]:w-auto bg-linear-to-r from-slate-900 to-rose-500 hover:from-rose-500 hover:to-slate-900 hover:text-white text-white transition-all duration-300 hover:no-underline"
              >
                <Link
                  href="/#pricing"
                  className="flex items-center justify-center"
                >
                  Get Started{" "}
                  <ArrowRight className="ml-2 h-4 w-4 animate-pulse" />
                </Link>
              </Button>
            </SignedOut>
            
            <SignedIn>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  size="lg"
                  variant={"link"}
                  className="w-full min-[400px]:w-auto bg-linear-to-r from-slate-900 to-rose-500 hover:from-rose-500 hover:to-slate-900 hover:text-white text-white transition-all duration-300 hover:no-underline"
                >
                  <Link
                    href="/upload"
                    className="flex items-center justify-center"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload PDF
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant={"outline"}
                  className="w-full min-[400px]:w-auto"
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Summaries
                  </Link>
                </Button>
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </section>
  );
}
