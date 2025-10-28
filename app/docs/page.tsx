"use client";
import Link from "next/link";
import { ArrowLeft, Book, Code, Zap, Shield, Users, FileText, X, Mail } from "lucide-react";
import { useState } from "react";

export default function DocumentationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sections = [
    {
      icon: <Zap className="w-6 h-6 text-black" />,
      title: "Getting Started",
      description: "Learn the basics of document analysis with Visura",
      guides: [
        "Upload Your First Document",
        "Understanding Analysis Results",
        "Dashboard Overview",
        "Basic Settings & Configuration"
      ]
    },
    {
      icon: <Code className="w-6 h-6 text-black" />,
      title: "API Reference",
      description: "Complete API documentation for document analysis",
      guides: [
        "Authentication & API Keys",
        "Document Upload API",
        "Analysis Results Endpoints",
        "Webhook Configuration",
        "Rate Limits & Best Practices"
      ]
    },
    {
      icon: <FileText className="w-6 h-6 text-black" />,
      title: "Integration Guides",
      description: "Step-by-step integration tutorials",
      guides: [
        "Python SDK Integration",
        "JavaScript/Node.js Setup",
        "REST API Integration",
        "Webhook Implementation",
        "Custom Analysis Workflows"
      ]
    },
    {
      icon: <Shield className="w-6 h-6 text-black" />,
      title: "Security & Privacy",
      description: "Document security and privacy best practices",
      guides: [
        "Document Encryption",
        "Data Privacy & GDPR",
        "Secure File Handling",
        "Access Control & Permissions",
        "Audit Logging & Monitoring"
      ]
    },
    {
      icon: <Users className="w-6 h-6 text-black" />,
      title: "Team & Sharing",
      description: "Collaborate and share analysis results",
      guides: [
        "Team Workspace Setup",
        "Sharing Analysis Results",
        "Export & Download Options",
        "Team Analytics & Reports",
        "User Management"
      ]
    },
    {
      icon: <Book className="w-6 h-6 text-black" />,
      title: "Advanced Features",
      description: "Advanced document analysis capabilities",
      guides: [
        "Batch Document Processing",
        "Custom Analysis Templates",
        "Advanced Export Options",
        "API Rate Limiting",
        "Performance Optimization"
      ]
    }
  ];


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Documentation</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Learn how to use Visura's AI-powered document analysis platform. Get started with 
            our guides, API documentation, and integration tutorials.
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="#getting-started" className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-colors">
            <Zap className="w-8 h-8 text-black mb-3" />
            <h3 className="text-lg font-semibold text-black mb-2">Getting Started</h3>
            <p className="text-gray-600 text-sm">Upload and analyze your first document</p>
          </Link>
          <Link href="#api-reference" className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-colors">
            <Code className="w-8 h-8 text-black mb-3" />
            <h3 className="text-lg font-semibold text-black mb-2">API Reference</h3>
            <p className="text-gray-600 text-sm">Document analysis API endpoints</p>
          </Link>
          <Link href="#integrations" className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-colors">
            <FileText className="w-8 h-8 text-black mb-3" />
            <h3 className="text-lg font-semibold text-black mb-2">Integrations</h3>
            <p className="text-gray-600 text-sm">SDK and workflow integration guides</p>
          </Link>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                {section.icon}
                <h3 className="text-xl font-semibold text-black">{section.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{section.description}</p>
              <ul className="space-y-2">
                {section.guides.map((guide, guideIndex) => (
                  <li key={guideIndex} className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors">
                    <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0"></div>
                    <span className="cursor-pointer">{guide}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>


      {/* Support Section */}
      <div className="bg-black text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Need Help with Document Analysis?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Having trouble with document processing or analysis? Our support team is here to help.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-black transition-colors"
            >
              Contact Support
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
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Contact Support</h3>
              <p className="text-gray-600 mb-6">
                Get in touch with our support team for document analysis help and inquiries
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
