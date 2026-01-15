"use client";
import Link from "next/link";
import { ArrowLeft, X, Mail } from "lucide-react";
import { useState } from "react";

export default function AboutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-black text-white py-8 sm:py-16">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">About us</h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl">
            Hyper-focused on details. We're dedicated to our craft and we hope it shows through in
            our work.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-20">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-8 sm:mb-12 lg:mb-16">
            Our principles
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            <div className="space-y-8 sm:space-y-12">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
                  Question the standards
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  We believe in challenging conventional approaches to document analysis. Our
                  AI-powered platform reimagines how teams process and understand complex
                  information, making insights more accessible and actionable than ever before.
                </p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
                  Hiring is for everyone
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Document analysis shouldn't be limited to large enterprises. We've built Visura to
                  be accessible to organizations of all sizes, from startups to Fortune 500
                  companies, democratizing access to powerful AI-driven insights.
                </p>
              </div>
            </div>

            <div className="space-y-8 sm:space-y-12">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
                  The details matter
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Every pixel, every algorithm, every user interaction is crafted with precision. We
                  obsess over the quality of our document analysis, ensuring that every summary,
                  insight, and export meets the highest standards of accuracy and usefulness.
                </p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">
                  Start with simple
                </h3>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Complex problems deserve elegant solutions. We've designed Visura to be intuitive
                  and powerful, where advanced AI capabilities are presented through a clean,
                  user-friendly interface that anyone can master in minutes.
                </p>
                ude
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12 sm:py-20 bg-gray-50">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <img
                src="/demo.png"
                alt="Charlotte skyline"
                className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg animate-pulse"
                style={{
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  animationDuration: "2s",
                }}
              />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-4 sm:mb-6">
                About Visura
              </h2>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
                <p>
                  Visura is an AI-powered document analysis platform that transforms complex
                  documents into clear, actionable insights. We believe that every piece of
                  information should be accessible and understandable, regardless of its complexity
                  or format.
                </p>
                <p>
                  Our platform uses advanced machine learning algorithms to analyze PDFs, Word
                  documents, and other file formats, extracting key insights, generating summaries,
                  and providing exportable results that help teams make better decisions faster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
