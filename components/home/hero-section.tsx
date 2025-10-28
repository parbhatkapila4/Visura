"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Play, Clock, Square, Home, Settings, FileText, Bot, Zap } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Hero Content */}
        <div className="text-center space-y-12 pt-16">
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
              Transform Documents
              <br />
              <span className="text-orange-500">Into Insights</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              <span className="font-bold text-gray-900">VISURA</span> is an AI-powered document analysis platform that transforms 
              complex PDFs, reports, and documents into clear, actionable insights in seconds. 
              Perfect for professionals, researchers, and businesses who need to extract value from documents quickly.
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <SignedOut>
              <Button
                size="lg"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/sign-up">Get Started Free</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button
                size="lg"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/upload">Upload Document</Link>
              </Button>
            </SignedIn>
          </div>

          {/* Product Mockup */}
          <div className="relative mt-16">
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                  {/* Left - Document Input */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-orange-500" />
                      <span className="font-semibold text-gray-900">Upload Document</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-200 hover:border-orange-300 transition-colors duration-300">
                      <div className="text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-2 animate-bounce" />
                        <p>Drop your PDF here</p>
                      </div>
                    </div>
                  </div>

                  {/* Center - AI Processing */}
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                      <Bot className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                      </div>
                      <p className="text-sm text-gray-600 animate-pulse">AI Processing...</p>
                    </div>
                  </div>

                  {/* Right - Results */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Zap className="w-6 h-6 text-green-500 animate-pulse" />
                      <span className="font-semibold text-gray-900">Get Insights</span>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="space-y-2">
                        <div className="h-2 bg-green-200 rounded w-full animate-pulse"></div>
                        <div className="h-2 bg-green-200 rounded w-3/4 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 bg-green-200 rounded w-1/2 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Section - Clean Icons */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="text-center">
            {/* Clock Icon */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">AI-Powered Analysis</h3>
            <p className="text-sm text-gray-600 leading-tight">
              Advanced AI algorithms extract<br />
              key insights, summarize content,<br />
              and identify important patterns
            </p>
          </div>

          <div className="text-center">
            {/* Apps Grid Icon */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M17 6h2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Multiple Formats</h3>
            <p className="text-sm text-gray-600 leading-tight">
              Support for PDF, Word, PowerPoint,<br />
              and more document types with<br />
              seamless processing
            </p>
          </div>

          <div className="text-center">
            {/* Smart Home Icon */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M12 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 6l2-2 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 6l2-2 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 8v2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                <path d="M10 10h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                <path d="M10 12h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Secure & Private</h3>
            <p className="text-sm text-gray-600 leading-tight">
              Enterprise-grade security with<br />
              encrypted processing and<br />
              data privacy protection
            </p>
          </div>

          <div className="text-center">
            {/* Star/Asterisk Icon */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Export & Share</h3>
            <p className="text-sm text-gray-600 leading-tight">
              Download summaries in multiple<br />
              formats, share with teams,<br />
              and integrate with your workflow
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
