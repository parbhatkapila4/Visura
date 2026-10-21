"use client";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Brain,
  Download,
  Users,
  BarChart3,
  FileText,
  Clock,
  Share2,
  CheckCircle,
  Star,
  Globe,
  Lock,
  Activity,
  TrendingUp,
  Target,
  Award,
  ScanSearch,
  MessageCircle,
} from "lucide-react";

export default function FeaturesPage() {
  const coreFeatures = [
    {
      icon: Brain,
      title: "Summaries",
      description:
        "Visura splits the document into passages, summarizes each one, and merges them into one summary.",
      features: [
        "Headings for an executive summary, key points, details, risks and action items",
        "A sections page: an outline drafted from the start of the document",
        "An insights page of key insights, risks, financial highlights and action items from the start of the document",
        "A graph of the topics and entities from the start of the document",
      ],
      stats: "Every upload",
    },
    {
      icon: MessageCircle,
      title: "Chat with a document",
      description: "Ask questions in plain language and get answers from the document's text.",
      features: [
        "Your most recent chat is saved, so you can pick it up where you left off",
        "For longer documents, answers list the passages they drew on",
        "Passages from a PDF show a page number when Visura knows it",
      ],
      stats: "Saved chats",
    },
    {
      icon: FileText,
      title: "File formats and limits",
      description:
        "Text is read in your browser. If that finds almost nothing, the server reads the uploaded file instead.",
      features: [
        "PDF, DOCX, PPTX, XLSX, XLS, TXT and MD files; the upload form accepts up to 32 MB",
        "PDFs read in your browser: the first 50 pages",
        "Scanned PDFs with no text layer: up to 10 pages, read with English OCR",
        "Older .doc and .ppt files are not supported; save them as .docx or .pptx",
      ],
      stats: "32 MB upload limit",
    },
    {
      icon: Download,
      title: "Download and share",
      description: "Download a summary as a PDF, or share a link to it.",
      features: [
        "Download summaries as PDF files from your dashboard",
        "Every account, on any plan, can download 2 summaries; downloading one again does not count",
        "Create a share link from the summary page; it is copied to your clipboard",
        "Anyone with the link can read the summary without signing in",
      ],
      stats: "PDF export",
    },
  ];

  const advancedFeatures = [
    {
      icon: BarChart3,
      title: "Analytics",
      description: "A dashboard of what you have uploaded",
      details: [
        "How many documents you have, in total or across your 4 most recent weeks with uploads in the past 30 days",
        "Word counts across your summaries",
        "Your most recent uploads",
      ],
    },
    {
      icon: Users,
      title: "Workspaces",
      description: "A place to group your documents, search them and compare them",
      details: [
        "Add a document to a workspace from its summary page",
        "Search the documents in a workspace",
        "Ask Visura to compare them and flag conflicts",
      ],
    },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Matching passages keep their summaries",
      description:
        "Passages that match an earlier version reuse their earlier summaries, and the rest are summarized. Matching sets aside line breaks, extra spaces, quote and dash styles, running headers and footers, short label-like lines that appear three or more times, and any line that reads like a page number, including a line of nothing but digits.",
    },
    {
      icon: Target,
      title: "See what was reused",
      description:
        "Each version's processing page shows how many passages were reused and how many were new.",
    },
    {
      icon: Award,
      title: "Cut-off and OCR reads are flagged",
      description:
        "If Visura read only the first 50 pages of a PDF, or read a scan with OCR, the processing page says so, and its overview leaves out the reuse counts.",
    },
    {
      icon: ScanSearch,
      title: "Compare two files without an account",
      description:
        "The compare page checks two versions of a PDF, DOCX, TXT or MD file in your browser. Neither file is uploaded.",
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-4">
        <div className="w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              Features
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-4xl mx-auto leading-relaxed">
              What Visura does with a file after you upload it, and where its limits are.
            </p>
          </div>
        </div>
      </div>

      <div className="py-12 sm:py-16 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">
            Summaries, chat and versions for your documents
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed">
            Upload a PDF, Word (.docx), PowerPoint (.pptx), Excel, text or Markdown file. Visura
            summarizes it, answers questions about it, and when you upload a changed version under
            the same name, reuses the summaries of passages that match an earlier version and
            summarizes the rest.
          </p>
          <a
            href="mailto:parbhat@parbhat.dev?subject=Question%20about%20Visura"
            className="inline-flex px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity"
          >
            Email us
          </a>
        </div>
      </div>

      <div className="py-12 sm:py-16 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h3 className="text-xs sm:text-sm text-zinc-500 uppercase tracking-wide mb-3 sm:mb-4">
              Core features
            </h3>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              What each document gets
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto">
              A summary, a chat, a PDF download and a share link, plus the limits on what Visura can
              read.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl p-6 sm:p-8 border border-white/10 bg-zinc-900/80 hover:bg-zinc-900 transition-colors"
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4 lg:gap-6 text-center md:text-left">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col items-center md:items-start sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-2 sm:mb-3">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                          {feature.title}
                        </h3>
                        <span className="text-xs sm:text-sm font-semibold text-primary bg-primary/20 px-2 sm:px-3 py-1 rounded-full">
                          {feature.stats}
                        </span>
                      </div>
                      <p className="text-zinc-400 mb-3 sm:mb-4 text-sm sm:text-base leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-1.5 sm:space-y-2">
                        {feature.features.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex items-center justify-center md:justify-start text-zinc-300 text-sm sm:text-base"
                          >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2 sm:mr-3 flex-shrink-0" />
                            <span className="break-words">{item}</span>
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

      <div className="py-12 sm:py-16 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Analytics and workspaces
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto">
              Keep track of your uploads, and group documents into workspaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {advancedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl p-6 border border-white/10 bg-zinc-900/80 hover:bg-zinc-900 transition-colors text-center"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6 bg-white/10 text-primary">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-400 mb-3 sm:mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 text-center md:text-left">
                    {feature.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="text-xs sm:text-sm text-zinc-400 flex items-center justify-center md:justify-start md:items-start"
                      >
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-0 md:mt-1.5 mr-2 sm:mr-3 flex-shrink-0" />
                        <span className="break-words">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="py-12 sm:py-16 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              When a document changes
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto">
              Upload a changed file under the same name and Visura records it as a new version of
              the same document.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-20 lg:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 bg-primary/20 text-primary group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
