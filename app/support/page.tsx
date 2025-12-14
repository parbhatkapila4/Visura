"use client";
import Link from "next/link";
import { ArrowLeft, Search, User, CreditCard, Smartphone, Users, Settings, Globe, Shield, BarChart3, X, Mail } from "lucide-react";
import { useState } from "react";

export default function SupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnderBuildingModalOpen, setIsUnderBuildingModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const supportCategories = [
    {
      icon: <User className="w-8 h-8 text-black" />,
      title: "My Account",
      description: "Manage your account settings, profile information, and personal preferences for document analysis."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-black" />,
      title: "Billing & Subscriptions",
      description: "View your subscription details, billing history, and manage payment methods for Visura services."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-black" />,
      title: "Mobile Access",
      description: "Access your document analysis results and manage files on mobile devices and tablets."
    },
    {
      icon: <Users className="w-8 h-8 text-black" />,
      title: "Team Collaboration",
      description: "Share analysis results, manage team workspaces, and collaborate on document insights."
    },
    {
      icon: <Settings className="w-8 h-8 text-black" />,
      title: "Account Settings",
      description: "Configure analysis preferences, notification settings, and customize your document processing workflow."
    },
    {
      icon: <Globe className="w-8 h-8 text-black" />,
      title: "International Support",
      description: "Get help with document analysis in multiple languages and international document formats."
    },
    {
      icon: <Shield className="w-8 h-8 text-black" />,
      title: "Security & Privacy",
      description: "Learn about document security, data privacy, and how we protect your sensitive information."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-black" />,
      title: "Analytics & Reports",
      description: "Understand your analysis results, generate reports, and track document processing performance."
    }
  ];

  const handlePageClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.modal-content')) {
      return;
    }
    setIsUnderBuildingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white" onClick={handlePageClick}>
      <div className="bg-black text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
              This page is under building
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">Support</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Get help with document analysis, troubleshoot issues, and find answers to your questions.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 py-16 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-black mb-4">How can we help you today?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Find answers to common questions about document analysis, account management, and technical support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search support articles and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <button className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
              Search
            </button>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200 rounded-full opacity-20 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-200 rounded-full opacity-20 transform -translate-x-24 translate-y-24"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportCategories.map((category, index) => (
            <div 
              key={index} 
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">{category.title}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-black mb-6">Popular Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-black mb-2">Getting Started with Document Analysis</h4>
              <p className="text-sm text-gray-600">Learn how to upload and analyze your first document</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-black mb-2">Understanding Analysis Results</h4>
              <p className="text-sm text-gray-600">How to interpret and use your document insights</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-black mb-2">Export and Share Options</h4>
              <p className="text-sm text-gray-600">Download and share your analysis results</p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative modal-content">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-white bg-opacity-70 rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-black" />
              </div>
              
              <h3 className="text-2xl font-bold text-black mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-6">
                Get in touch with our support team for document analysis help and inquiries
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Email us at:</p>
                <a 
                  href="mailto:help@productsolution.net"
                  className="text-lg font-semibold text-black hover:text-gray-700 transition-colors"
                >
                  help@productsolution.net
                </a>
              </div>
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isUnderBuildingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative modal-content">
            <button
              onClick={() => setIsUnderBuildingModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-white bg-opacity-70 rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-black mb-2">Page Under Construction</h3>
              <p className="text-gray-600 mb-6">
                This support page is currently under development. We're working hard to bring you the best experience.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">For immediate support, contact us at:</p>
                <a 
                  href="mailto:help@productsolution.net"
                  className="text-lg font-semibold text-black hover:text-gray-700 transition-colors"
                >
                  help@productsolution.net
                </a>
              </div>
              
              <button
                onClick={() => setIsUnderBuildingModalOpen(false)}
                className="px-6 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
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
