"use client";
import { FileText, Brain, Zap, Play, X } from "lucide-react";
import { useState } from "react";

export default function DemoSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const openVideo = () => {
    setIsVideoOpen(true);
  };

  const closeVideo = () => {
    setIsVideoOpen(false);
  };

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              See Visura in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch how our AI transforms complex documents into clear, actionable insights in seconds
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                From Document to Insights
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Upload any document and watch as our AI extracts key information, 
                generates summaries, and provides actionable insights in real-time.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Lightning Fast</h4>
                    <p className="text-gray-600">Documents analyzed and summarized in under 30 seconds</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">AI-Powered Analysis</h4>
                    <p className="text-gray-600">Advanced algorithms extract key insights and patterns</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Multiple Formats</h4>
                    <p className="text-gray-600">Export summaries as PDF, Word, or share via link</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Video Placeholder */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-lg">
                <button
                  onClick={openVideo}
                  className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 w-full group cursor-pointer"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-2">Watch Demo</div>
                    <div className="text-sm text-gray-600">See Visura in action</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl mx-4">
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                className="w-full h-full"
                controls
                autoPlay
                onEnded={closeVideo}
              >
                <source src="/Visurademo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
