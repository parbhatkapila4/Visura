"use client";
import { Play } from "lucide-react";

export default function DeveloperFriendlySection() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Developer-friendly
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Right out of the box, Visura comes with a comprehensive API, ready for integration into your document analysis workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Device and Features */}
          <div className="space-y-12">
            {/* Document Analysis Preview */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-40 bg-gray-800 rounded-lg shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded mb-2 mx-auto flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="text-green-400 font-mono text-lg">ANALYZING</div>
                  </div>
                </div>
                {/* Status indicators */}
                <div className="absolute -top-2 -left-2 w-6 h-4 bg-gray-600 rounded"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Feature Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
              {/* REST API */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">
                  &gt; REST API
                </h3>
                <p className="text-gray-300">
                  Integrate document analysis into your applications with our comprehensive REST API
                </p>
              </div>

              {/* SDK & Libraries */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">
                  &gt; SDK & Libraries
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Go</span>
                  </div>
                  <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">JS</span>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Py</span>
                  </div>
                </div>
                <p className="text-gray-300">
                  Process documents and generate summaries using JavaScript, Go, or Python
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Code Editor */}
          <div className="flex justify-center">
            <div className="w-full max-w-lg">
              {/* Code Editor Window */}
              <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
                {/* Title Bar */}
                <div className="bg-gray-800 px-4 py-3 flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Play className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm font-mono">visura_demo.py</span>
                  </div>
                </div>

                {/* Code Content */}
                <div className="p-6 font-mono text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="text-orange-400">import</span>{" "}
                      <span className="text-blue-400">requests</span>
                    </div>
                    <div className="text-gray-500">
                      # Upload and analyze PDF document
                    </div>
                    <div>
                      <span className="text-blue-400">response</span> = <span className="text-blue-400">requests</span>.
                      <span className="text-yellow-400">post</span>(
                    </div>
                    <div>
                      <span className="text-gray-300">    </span>
                      <span className="text-green-400">"https://api.visura.dev/analyze"</span>,
                    </div>
                    <div>
                      <span className="text-gray-300">    </span>
                      <span className="text-blue-400">files</span>={"{"}<span className="text-green-400">"file"</span>: <span className="text-blue-400">open</span>(<span className="text-green-400">"report.pdf"</span>, <span className="text-green-400">"rb"</span>){"}"}
                    </div>
                    <div>
                      <span className="text-gray-300">    </span>
                      <span className="text-blue-400">data</span>={"{"}<span className="text-green-400">"mode"</span>: <span className="text-green-400">"summary"</span>{"}"}
                    </div>
                    <div>)</div>
                    <div className="text-gray-500">
                      # Get AI-generated summary
                    </div>
                    <div>
                      <span className="text-blue-400">summary</span> = <span className="text-blue-400">response</span>.<span className="text-yellow-400">json</span>()
                    </div>
                    <div>
                      <span className="text-blue-400">print</span>(<span className="text-blue-400">summary</span>[<span className="text-green-400">"insights"</span>])
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connecting Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 400">
            <defs>
              <pattern id="dotted" patternUnits="userSpaceOnUse" width="4" height="4">
                <circle cx="2" cy="2" r="1" fill="#6B7280" />
              </pattern>
            </defs>
            <path
              d="M 200 200 Q 300 150 400 200"
              stroke="url(#dotted)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4,4"
            />
            <path
              d="M 200 250 Q 300 300 400 250"
              stroke="url(#dotted)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4,4"
            />
            <path
              d="M 400 200 Q 500 180 600 200"
              stroke="url(#dotted)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="4,4"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
