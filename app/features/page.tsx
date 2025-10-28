"use client";
import Link from "next/link";
import { ArrowLeft, Zap, Brain, Download, Users, Shield, BarChart3, FileText, Clock, Share2, CheckCircle, Star, Globe, Lock, Settings, Activity, TrendingUp, Target, Award, Sparkles, MessageCircle } from "lucide-react";

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: Brain,
      title: "AI Document Summarization",
      description: "Intelligent AI analyzes your PDFs and creates comprehensive summaries",
      features: [
        "Extract key insights from any PDF document",
        "Generate executive summaries automatically",
        "Identify important points and main topics",
        "Context-aware analysis of document content"
      ],
      stats: "AI Powered"
    },
    {
      icon: MessageCircle,
      title: "Interactive Chat with Documents",
      description: "Ask questions and get answers directly from your uploaded documents",
      features: [
        "Chat with your PDFs using natural language",
        "Get specific answers from document content",
        "Multiple chat sessions per document",
        "Conversation history tracking"
      ],
      stats: "Live Chat"
    },
    {
      icon: FileText,
      title: "PDF Text Extraction",
      description: "Advanced PDF processing with client-side text extraction",
      features: [
        "Extract text from PDF documents",
        "Handle multi-page documents",
        "Fallback processing for complex PDFs",
        "Secure file storage with Supabase"
      ],
      stats: "PDF Ready"
    },
    {
      icon: Download,
      title: "Download & Share",
      description: "Easy sharing and downloading of summaries and original files",
      features: [
        "Download AI-generated summaries as text files",
        "Share summary links with others",
        "Download original PDF files",
        "Copy links to clipboard for sharing"
      ],
      stats: "Export Ready"
    }
  ];

  const advancedFeatures = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with compliance standards",
      details: [
        "SOC 2 Type II certified infrastructure",
        "End-to-end encryption for all data",
        "GDPR and HIPAA compliance ready",
        "Advanced access controls and audit logging"
      ]
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive analytics and performance monitoring",
      details: [
        "Real-time processing analytics",
        "Usage tracking and performance metrics",
        "Customizable dashboards",
        "Detailed reporting and visualization"
      ]
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly on document analysis projects",
      details: [
        "Role-based access control",
        "Shared workspaces and projects",
        "Real-time collaboration features",
        "Comment and annotation system"
      ]
    },
    {
      icon: Settings,
      title: "API Integration",
      description: "Developer-friendly integration options",
      details: [
        "RESTful API endpoints",
        "Webhook notifications",
        "SDK libraries for popular languages",
        "Custom integration support"
      ]
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Productivity",
      description: "Save 80% of time spent on manual document analysis"
    },
    {
      icon: Target,
      title: "Improve Accuracy",
      description: "Reduce human errors with AI-powered analysis"
    },
    {
      icon: Award,
      title: "Scale Operations",
      description: "Process thousands of documents simultaneously"
    },
    {
      icon: Sparkles,
      title: "Enhanced Insights",
      description: "Discover patterns and insights you might miss"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">Features</h1>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Discover the comprehensive suite of powerful capabilities that make Visura the ultimate 
              AI-powered document analysis platform for modern businesses.
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-black mb-8">The Best Way to Analyze Documents with AI, Anywhere, Anytime</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Visura is a smart and versatile document analysis platform that helps you extract insights, 
            automate workflows, and stay productive. Experience the future of document intelligence.
          </p>
          <div className="flex justify-center">
            <a
              href="mailto:help@productsolution.net?subject=Interested in Visura Document Analysis Services&body=Hello,%0D%0A%0D%0AI am interested in learning more about Visura's document analysis services. Could you please provide me with more information about your pricing, features, and how to get started?%0D%0A%0D%0AThank you for your time.%0D%0A%0D%0ABest regards"
              className="px-10 py-4 border-2 border-black text-black font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 text-lg"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-sm text-gray-500 uppercase tracking-wide mb-4">Core Features</h3>
            <h2 className="text-4xl font-bold text-black mb-6">Powerful AI-Driven Document Analysis</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core features provide the foundation for intelligent document processing and analysis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                        <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                          {feature.stats}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 text-lg leading-relaxed">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.features.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center text-gray-700">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">Advanced Capabilities</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade features designed for scalability, security, and seamless integration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2 text-left">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-sm text-gray-600 flex items-start">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">Why Choose Visura?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your document workflow with measurable benefits and proven results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-6">Feature Comparison</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how Visura compares to traditional document analysis methods
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Visura</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Manual Analysis</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Basic Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { feature: "Processing Speed", visura: "15-30 seconds", manual: "2-4 hours", basic: "30-60 minutes" },
                    { feature: "Accuracy Rate", visura: "99.9%", manual: "85-90%", basic: "70-80%" },
                    { feature: "Multi-format Support", visura: "✓", manual: "✗", basic: "Limited" },
                    { feature: "Batch Processing", visura: "✓", manual: "✗", basic: "✗" },
                    { feature: "AI Insights", visura: "✓", manual: "✗", basic: "✗" },
                    { feature: "Team Collaboration", visura: "✓", manual: "Limited", basic: "✗" },
                    { feature: "API Integration", visura: "✓", manual: "✗", basic: "✗" },
                    { feature: "Cost per Document", visura: "$0.10", manual: "$50+", basic: "$5-10" }
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">{row.visura}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{row.manual}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-500">{row.basic}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
