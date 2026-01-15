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
        "Basic Settings & Configuration",
      ],
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
        "Rate Limits & Best Practices",
      ],
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
        "Custom Analysis Workflows",
      ],
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
        "Audit Logging & Monitoring",
      ],
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
        "User Management",
      ],
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
        "Performance Optimization",
      ],
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="bg-black text-white py-16">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-6">Documentation</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Learn how to use Visura's AI-powered document analysis platform. Get started with our
            guides, API documentation, and integration tutorials.
          </p>
        </div>
      </div>

      <div className="w-full px-6 lg:px-12 xl:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="#getting-started"
            className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-colors"
          >
            <Zap className="w-8 h-8 text-black mb-3" />
            <h3 className="text-lg font-semibold text-black mb-2">Getting Started</h3>
            <p className="text-gray-600 text-sm">Upload and analyze your first document</p>
          </Link>
          <Link
            href="#api-reference"
            className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-colors"
          >
            <Code className="w-8 h-8 text-black mb-3" />
            <h3 className="text-lg font-semibold text-black mb-2">API Reference</h3>
            <p className="text-gray-600 text-sm">Document analysis API endpoints</p>
          </Link>
          <Link
            href="#integrations"
            className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:bg-gray-100 transition-colors"
          >
            <FileText className="w-8 h-8 text-black mb-3" />
            <h3 className="text-lg font-semibold text-black mb-2">Integrations</h3>
            <p className="text-gray-600 text-sm">SDK and workflow integration guides</p>
          </Link>
        </div>
      </div>

      <div className="w-full px-6 lg:px-12 xl:px-20 pb-24 space-y-16 lg:space-y-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                {section.icon}
                <h3 className="text-xl font-semibold text-black">{section.title}</h3>
              </div>
              <p className="text-gray-600 mb-4">{section.description}</p>
              <ul className="space-y-2">
                {section.guides.map((guide, guideIndex) => (
                  <li
                    key={guideIndex}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-black transition-colors"
                  >
                    <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0"></div>
                    <span className="cursor-pointer">{guide}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="space-y-8 lg:space-y-10">
          <div className="max-w-4xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-3">What is Visura?</h2>
            <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
              Visura is an AI-powered document analysis platform. You upload PDFs and other
              long‑form documents, and Visura turns them into clear, structured insights you can
              search, summarize, and chat with. Instead of manually scanning pages, you get instant
              answers to specific questions, concise summaries, and a permanent knowledge base of
              everything you&apos;ve uploaded.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-black mb-2">Who is it for?</h3>
              <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
                Product teams, founders, analysts, students, and anyone who works with dense PDFs:
                reports, research papers, legal docs, contracts, specs, and more. If you regularly
                need to “read and understand” documents, Visura is built for you.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-black mb-2">Why does it exist?</h3>
              <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
                Most knowledge is trapped in static files. Manually reading and summarizing them is
                slow, error‑prone, and doesn&apos;t scale. Visura exists to give you a single place
                where documents become interactive: you can search, summarize, compare, and ask
                questions like you would with a teammate who has read everything.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-black mb-2">How does it feel to use?</h3>
              <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
                You drag‑and‑drop a file, wait a few seconds, and immediately get a clean summary
                card, analytics, and a chatbot you can talk to about that document. From there you
                can keep everything organized in your dashboard and workspaces.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6 lg:space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-black">How Visura works</h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-500 tracking-[0.18em] uppercase mb-2">
                1 · Upload
              </p>
              <h3 className="text-lg font-semibold text-black mb-2">Add your documents</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Upload PDFs and other supported formats from your dashboard. Files are stored
                securely and prepared for AI analysis, including text extraction and page‑level
                processing.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-500 tracking-[0.18em] uppercase mb-2">
                2 · Analyze
              </p>
              <h3 className="text-lg font-semibold text-black mb-2">AI understanding</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Visura&apos;s pipeline breaks your document into logical sections, extracts
                entities, and runs summarization and insight generation so you get a concise
                overview instead of a wall of text.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-500 tracking-[0.18em] uppercase mb-2">
                3 · Explore
              </p>
              <h3 className="text-lg font-semibold text-black mb-2">Dashboard & summaries</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                On the dashboard you can browse summaries, see key metrics per document, download
                results, and organize everything into workspaces for different projects or teams.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-500 tracking-[0.18em] uppercase mb-2">
                4 · Chat
              </p>
              <h3 className="text-lg font-semibold text-black mb-2">
                Ask questions in plain English
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Each document has its own AI chatbot. Ask follow‑up questions, compare sections, or
                request custom summaries and explanations tailored to your role or use‑case.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 lg:space-y-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-black">Data, privacy & security</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-black mb-2">Document handling</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Uploaded files are processed only to generate summaries, analytics, and chat
                context. We do not sell your data or use your documents for training generic models.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-black mb-2">Security basics</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                All traffic is encrypted in transit via HTTPS. Storage is protected with
                industry‑standard security practices, and access to documents is scoped to your
                authenticated account or workspace.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-black mb-2">Ownership</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                You retain full ownership of your documents and generated summaries. You can export
                your data and delete documents or summaries from your account at any time.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 lg:space-y-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-black">Common questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-base lg:text-lg font-semibold text-black mb-2">
                How accurate are the summaries?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Summaries are generated by modern large language models with document‑aware
                prompting. For critical work (legal, medical, financial), you should still review
                the original document, but Visura dramatically reduces the time needed to get an
                initial understanding.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-base lg:text-lg font-semibold text-black mb-2">
                What file types work best?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Standard, text‑based PDFs give the best results. Scanned PDFs may require OCR and
                can be more variable in quality, but the platform is designed to handle most common
                document formats you encounter in everyday work.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-base lg:text-lg font-semibold text-black mb-2">
                Can I collaborate with my team?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Yes. Workspaces let you share documents, summaries, and chat sessions with your
                teammates so everyone can build on the same knowledge base instead of working in
                silos.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-base lg:text-lg font-semibold text-black mb-2">
                How do I get help or request features?
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                You can reach us anytime at{" "}
                <a
                  href="mailto:parbhat@parbhat.dev"
                  className="text-black font-medium underline underline-offset-2"
                >
                  parbhat@parbhat.dev
                </a>
                . We actively use this feedback to shape the roadmap.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4 lg:space-y-6">
          <h2 className="text-2xl lg:text-3xl font-bold text-black">
            Where to find things in Visura
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm lg:text-base">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-black mb-2">Dashboard</h3>
              <p className="text-gray-700 leading-relaxed">
                The `/dashboard` route shows all documents you&apos;ve uploaded, quick stats, and
                entry points into summaries and chat. It&apos;s the best place to get a high‑level
                view of your activity in Visura.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-black mb-2">Summaries</h3>
              <p className="text-gray-700 leading-relaxed">
                Each processed document has a dedicated summary view under `/summaries/[id]`. Here
                you&apos;ll see the main points, extracted sections, and actions like download or
                share.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-black mb-2">Chatbot</h3>
              <p className="text-gray-700 leading-relaxed">
                The document chatbot lives at `/chatbot/[pdfSummaryId]`. This is where you can ask
                questions about a specific summary, start new chat sessions, and explore documents
                conversationally.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-black mb-2">Uploads & processing</h3>
              <p className="text-gray-700 leading-relaxed">
                Upload flows are handled through the upload components and API routes in this
                project. They take care of storing files, extracting text, and triggering summary
                generation so that new documents automatically appear in your dashboard.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-black mb-2">Workspaces</h3>
              <p className="text-gray-700 leading-relaxed">
                Workspaces let you group documents and collaborate with others. The workspace logic
                lives in the `workspaces` components and `lib/workspaces` helpers, which control how
                documents are shared and organized.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold text-black mb-2">Rate limiting & reliability</h3>
              <p className="text-gray-700 leading-relaxed">
                To keep things fast and stable, Visura uses rate‑limiting utilities (in
                `lib/rate-limit`) and monitoring helpers to protect the AI and upload endpoints. If
                you hit those limits, try again after a short pause.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
