"use client";
import Link from "next/link";
import { ArrowLeft, Plus, Bug, Zap, Shield, Users, X, Mail } from "lucide-react";
import { useState } from "react";

export default function ChangelogPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updates = [
    {
      version: "v2.5.0",
      date: "January 2026",
      type: "feature",
      title: "Workspace Collaboration & Performance",
      description: "Major release focused on real-time collaboration, performance, and reliability.",
      changes: [
        "Introduced shared workspaces so teams can collaborate on document analysis in real time",
        "Added per-workspace permissions for safer sharing with teammates and external collaborators",
        "Optimized PDF ingestion pipeline for large files, reducing processing time by up to 40%",
        "Rolled out autosave for chat sessions so conversation context is never lost between refreshes",
        "Improved dashboard analytics with richer usage graphs and per-user activity insights",
        "Enhanced error handling and retry behavior for flaky uploads and third‑party API calls",
      ],
    },
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
    <div className="min-h-screen w-full bg-white">
      <div className="bg-white border-b border-gray-200 py-8 sm:py-16">
        <div className="w-full px-6 lg:px-12 xl:px-20">
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

      <div className="w-full px-6 lg:px-12 xl:px-20 py-8 sm:py-16">
        <div className="w-full space-y-6 sm:space-y-8">
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

      
    </div>
  );
}
