"use client";
import { FileText, Brain, Zap } from "lucide-react";

export default function DemoSection() {

  return (
    <>
      <section className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">
              See Visura in Action
            </h2>
            <p className="text-xl text-neutral-300 max-w-3xl mx-auto">
              Watch how our AI transforms complex documents into clear, actionable insights in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                From Document to Insights
              </h3>
              <p className="text-lg text-neutral-300 mb-8 leading-relaxed">
                Upload any document and watch as our AI extracts key information, 
                generates summaries, and provides actionable insights in real-time.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-300" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Lightning Fast</h4>
                    <p className="text-neutral-300">Documents analyzed and summarized in under 30 seconds</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">AI-Powered Analysis</h4>
                    <p className="text-neutral-300">Advanced algorithms extract key insights and patterns</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-neutral-300" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Multiple Formats</h4>
                    <p className="text-neutral-300">Export summaries as PDF, Word, or share via link</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Video */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                  >
                    <source src="/Visurademo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
