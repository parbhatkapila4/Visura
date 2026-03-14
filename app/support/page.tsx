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
      icon: <User className="w-8 h-8 text-primary" />,
      title: "My Account",
      description: "Manage your account settings, profile information, and personal preferences for document analysis."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-primary" />,
      title: "Billing & Subscriptions",
      description: "View your subscription details, billing history, and manage payment methods for Visura services."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: "Mobile Access",
      description: "Access your document analysis results and manage files on mobile devices and tablets."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Team Collaboration",
      description: "Share analysis results, manage team workspaces, and collaborate on document insights."
    },
    {
      icon: <Settings className="w-8 h-8 text-primary" />,
      title: "Account Settings",
      description: "Configure analysis preferences, notification settings, and customize your document processing workflow."
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "International Support",
      description: "Get help with document analysis in multiple languages and international document formats."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Security & Privacy",
      description: "Learn about document security, data privacy, and how we protect your sensitive information."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
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
    <div className="min-h-screen w-full bg-black" onClick={handlePageClick}>
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-4">
        <div className="w-full">
          <div className="flex justify-between items-start mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="rounded-full border border-primary/40 bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
              This page is under building
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Support</h1>
          <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl">
            Get help with document analysis, troubleshoot issues, and find answers to your questions.
          </p>
        </div>
      </div>

      <div className="py-12 sm:py-16 relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How can we help you today?</h2>
          <p className="text-base sm:text-lg text-zinc-400 mb-8 max-w-2xl mx-auto">
            Find answers to common questions about document analysis, account management, and technical support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search support articles and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-white/20 rounded-xl bg-zinc-900/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <button className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportCategories.map((category, index) => (
            <div 
              key={index} 
              className="rounded-xl border border-white/10 bg-zinc-900/80 p-6 hover:bg-zinc-900 transition-colors"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{category.title}</h3>
                <p className="text-sm text-zinc-400">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="py-12 sm:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <h3 className="text-2xl font-bold text-white mb-6">Popular Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 hover:bg-zinc-900 transition-colors">
              <h4 className="font-semibold text-white mb-2">Getting Started with Document Analysis</h4>
              <p className="text-sm text-zinc-400">Learn how to upload and analyze your first document</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 hover:bg-zinc-900 transition-colors">
              <h4 className="font-semibold text-white mb-2">Understanding Analysis Results</h4>
              <p className="text-sm text-zinc-400">How to interpret and use your document insights</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-4 hover:bg-zinc-900 transition-colors">
              <h4 className="font-semibold text-white mb-2">Export and Share Options</h4>
              <p className="text-sm text-zinc-400">Download and share your analysis results</p>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 max-w-md w-full relative modal-content">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Contact Support</h3>
              <p className="text-zinc-400 mb-6">
                Get in touch with our support team for document analysis help and inquiries
              </p>
              
              <div className="rounded-xl border border-white/10 bg-zinc-800/80 p-4 mb-6">
                <p className="text-sm text-zinc-500 mb-2">Email us at:</p>
                <a 
                  href="mailto:parbhat@parbhat.dev"
                  className="text-lg font-semibold text-primary hover:opacity-90 transition-opacity"
                >
                  parbhat@parbhat.dev
                </a>
              </div>
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isUnderBuildingModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8 max-w-md w-full relative modal-content">
            <button
              onClick={() => setIsUnderBuildingModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors rounded-full p-1"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Page Under Construction</h3>
              <p className="text-zinc-400 mb-6">
                This support page is currently under development. We're working hard to bring you the best experience.
              </p>
              
              <div className="rounded-xl border border-white/10 bg-zinc-800/80 p-4 mb-6">
                <p className="text-sm text-zinc-500 mb-2">For immediate support, contact us at:</p>
                <a 
                  href="mailto:parbhat@parbhat.dev"
                  className="text-lg font-semibold text-primary hover:opacity-90 transition-opacity"
                >
                  parbhat@parbhat.dev
                </a>
              </div>
              
              <button
                onClick={() => setIsUnderBuildingModalOpen(false)}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity"
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
