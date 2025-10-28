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
        "Real-time processing status updates"
      ]
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
        "Created user dashboard and document management system"
      ]
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-black text-white border-black';
      case 'improvement': return 'bg-gray-100 text-black border-gray-300';
      case 'fix': return 'bg-gray-100 text-black border-gray-300';
      default: return 'bg-gray-100 text-black border-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature': return 'New Feature';
      case 'improvement': return 'Improvement';
      case 'fix': return 'Bug Fix';
      default: return 'Update';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-black mb-6">Changelog</h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Stay up-to-date with our latest updates, new features, and improvements. 
            We're constantly working to make Visura better for you.
          </p>
        </div>
      </div>

      {/* Changelog Timeline */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-8">
          {updates.map((update, index) => (
            <div key={index} className="relative">
              {/* Timeline Line */}
              {index !== updates.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
              )}
              
              <div className="flex gap-6">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
                
                {/* Content */}
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-black">{update.version}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(update.type)}`}>
                        {getTypeLabel(update.type)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{update.date}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-black mb-3">{update.title}</h3>
                  <p className="text-gray-600 mb-4">{update.description}</p>
                  
                  <ul className="space-y-2">
                    {update.changes.map((change, changeIndex) => (
                      <li key={changeIndex} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-black rounded-full mt-2 flex-shrink-0"></div>
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

      {/* CTA Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-gray-300 mb-8">
            Get notified about new features and updates as soon as they're released.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-white bg-opacity-70 rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-600 mb-6">
                Get in touch with our team for support or inquiries
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Email us at:</p>
                <a 
                  href="mailto:help@productsolution.net"
                  className="text-lg font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  help@productsolution.net
                </a>
              </div>
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
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
