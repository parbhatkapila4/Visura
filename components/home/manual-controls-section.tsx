"use client";
import { FileText, Brain, Download, Users } from "lucide-react";

export default function ManualControlsSection() {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Document Management
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Easily manage your documents with intuitive controls and quick access to all analysis features. 
            Upload, process, and export your documents with just a few clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative">

          {/* Product Image */}
          <div className="flex justify-center">
            <div className="relative w-80 h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-600 animate-pulse">
              {/* Main Screen */}
              <div className="w-48 h-32 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-sm">PROCESSING</div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                {/* Left Control */}
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
                
                {/* Center Button */}
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
                </div>
                
                {/* Right Control */}
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Blocks */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <FileText className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-white">Upload Documents</h3>
              </div>
              <p className="text-sm text-gray-300">Drag and drop PDFs, Word docs, and other formats for analysis</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <Brain className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
              </div>
              <p className="text-sm text-gray-300">Automatically extract key insights and generate summaries</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <Download className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-white">Export Results</h3>
              </div>
              <p className="text-sm text-gray-300">Download summaries in PDF, Word, or text formats</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                  <Users className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="text-lg font-semibold text-white">Share & Collaborate</h3>
              </div>
              <p className="text-sm text-gray-300">Share insights with your team via secure links</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
