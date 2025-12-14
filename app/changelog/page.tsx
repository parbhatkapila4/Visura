"use client";
import Link from "next/link";
import { ArrowLeft, Plus, Bug, Zap, Shield, Users, X, Mail } from "lucide-react";
import { useState } from "react";

export default function ChangelogPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updates = [
    {
      version: "v2.1.0",
      date: "October 2025",
      type: "feature",
      title: "Current Platform Features",
      description: "All the features currently available in Visura",
      changes: [
        "AI-powered document analysis and summarization",
        "Support for PDF and Word document uploads",
        "Smart key point extraction from documents",
        "User authentication and account management",
        "Document processing dashboard",
        "Export results in multiple formats",
        "Real-time processing status updates",
      ],
    },
    {
      version: "v1.5.0",
      date: "July 2025",
      type: "feature",
      title: "Initial Release & Core Features",
      description: "First major release with core document analysis capabilities",
      changes: [
        "Launched AI-powered document analysis platform",
        "Added support for PDF and Word document processing",
        "Implemented basic summarization and key point extraction",
        "Created user dashboard and document management system",
      ],
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-black text-white border-black";
      case "improvement":
        return "bg-gray-100 text-black border-gray-300";
      case "fix":
        return "bg-gray-100 text-black border-gray-300";
      default:
        return "bg-gray-100 text-black border-gray-300";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "feature":
        return "New Feature";
      case "improvement":
        return "Improvement";
      case "fix":
        return "Bug Fix";
      default:
        return "Update";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200 py-8 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6">
            Changelog
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl">
            Stay up-to-date with our latest updates, new features, and improvements. We're
            constantly working to make Visura better for you.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="space-y-6 sm:space-y-8">
          {updates.map((update, index) => (
            <div key={index} className="relative">
              {index !== updates.length - 1 && (
                <div className="absolute left-4 sm:left-6 top-12 w-0.5 h-full bg-gray-200"></div>
              )}

              <div className="flex gap-3 sm:gap-6">
                <div className="flex-shrink-0 w-8 h-8 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full"></div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <span className="text-lg sm:text-2xl font-bold text-black">
                        {update.version}
                      </span>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getTypeColor(
                          update.type
                        )}`}
                      >
                        {getTypeLabel(update.type)}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">{update.date}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3">
                    {update.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                    {update.description}
                  </p>

                  <ul className="space-y-2">
                    {update.changes.map((change, changeIndex) => (
                      <li
                        key={changeIndex}
                        className="flex items-start gap-2 text-xs sm:text-sm text-gray-700"
                      >
                        <div className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Stay Updated</h2>
          <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8">
            Get notified about new features and updates as soon as they're released.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 sm:px-8 py-2.5 sm:py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors text-sm sm:text-base"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors bg-white bg-opacity-70 rounded-full p-1"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Get in touch with our team for support or inquiries
              </p>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Email us at:</p>
                <a
                  href="mailto:help@productsolution.net"
                  className="text-base sm:text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors break-all"
                >
                  help@productsolution.net
                </a>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 sm:px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
