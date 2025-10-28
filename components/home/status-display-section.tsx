"use client";
import { BarChart3, Clock } from "lucide-react";

export default function StatusDisplaySection() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Real-time Analytics
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Track your document analysis progress with real-time updates and detailed analytics. 
            Monitor processing status and view comprehensive insights as they're generated.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content Blocks */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Processing Analytics</h3>
                <p className="text-gray-300">View detailed metrics on document processing speed and accuracy</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Real-time Updates</h3>
                <p className="text-gray-300">Get instant notifications when analysis is complete and insights are ready</p>
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Main Device */}
              <div className="w-80 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800 mb-2">85%</div>
                  <div className="w-16 h-16 bg-blue-500 rounded mx-auto mb-2 flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm text-gray-600">Processing</div>
                </div>
              </div>
              
              {/* Laptop decoration */}
              <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-16 h-12 bg-gray-300 rounded"></div>
              
              {/* Plant decoration */}
              <div className="absolute -right-4 -bottom-4 w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
