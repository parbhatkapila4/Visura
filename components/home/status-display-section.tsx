"use client";
import { BarChart3, Clock, FileText, Zap } from "lucide-react";
import { useState, useEffect } from "react";

// Animated Analytics Component
function AnimatedAnalytics() {
  const [displayText, setDisplayText] = useState("0%");
  const [subText, setSubText] = useState("ANALYZING");

  useEffect(() => {
    let step = 0;
    let cycle = 0;
    
    const animate = () => {
      if (cycle >= 2) {
        // After 2 cycles, show COMPLETE permanently
        setDisplayText("COMPLETE");
        setSubText("");
        return;
      }

      if (step <= 100) {
        setDisplayText(`${step}%`);
        setSubText("ANALYZING");
        step++;
        setTimeout(animate, 50);
      } else {
        // Show COMPLETE for 2 seconds
        setDisplayText("COMPLETE");
        setSubText("");
        cycle++;
        step = 0;
        setTimeout(animate, 2000);
      }
    };

    animate();
  }, []);

  return (
    <div className="w-80 h-48 bg-black rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden border-2 border-dashed border-orange-500" style={{ animation: 'bounce 3s infinite' }}>
      {/* Laptop decoration */}
      <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 w-16 h-12 bg-gray-300 rounded"></div>
      
      {/* Main content */}
      <div className="text-center relative z-10">
        <div className={`text-3xl font-bold mb-2 ${displayText === "COMPLETE" ? "text-green-600" : "text-white"}`}>
          {displayText}
        </div>
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg mx-auto mb-2 flex items-center justify-center shadow-lg">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        {subText && <div className="text-sm text-gray-300 font-medium">{subText}</div>}
      </div>
      
      {/* Status indicator */}
      <div className="absolute -right-4 -bottom-4 w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-pulse"></div>
    </div>
  );
}

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
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Document Analytics</h3>
                <p className="text-gray-300">Track processing speed, accuracy metrics, and document insights in real-time</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black border-2 border-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Live Processing</h3>
                <p className="text-gray-300">Get instant notifications when document analysis is complete and summaries are ready</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Smart Insights</h3>
                <p className="text-gray-300">AI-powered analysis extracts key points, summaries, and actionable insights automatically</p>
              </div>
            </div>
          </div>

          {/* Animated Analytics Display */}
          <div className="flex justify-center">
            <AnimatedAnalytics />
          </div>
        </div>
      </div>
    </section>
  );
}
