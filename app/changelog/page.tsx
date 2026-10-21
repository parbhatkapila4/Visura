"use client";
import Link from "next/link";
import { ArrowLeft, Plus, Bug, Zap, Shield, Users, X, Mail } from "lucide-react";
import { useState } from "react";

export default function ChangelogPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updates = [
    {
      date: "Sep 6, 2026",
      title: "Rebuilt home page",
      description:
        "The home page now walks through what happens when you upload a new version of a document.",
      changes: [
        "Shows which chunks carry over from the previous version and which are processed again",
        "Shows how the changes between two versions are recorded",
      ],
    },
    {
      date: "Mar 29, 2026",
      title: "New summary views and workspace search",
      description:
        "Every summary links to four new pages, and workspaces can search and compare their documents.",
      changes: [
        "Sections outlines the start of the document as titled sections",
        "AI insights pulls out key insights, risks, financial highlights, action points and important facts from the start of the document",
        "Knowledge graph maps the topics, entities and concepts at the start of the document and how they relate",
        "Processing insights shows how many of the version's chunks were reused and how many were new, with a timeline of processing events",
        "Search a workspace's documents by meaning and see the matching passages",
        "Run a workspace analysis that looks for comparisons and conflicts between its documents",
      ],
    },
    {
      date: "Mar 14, 2026",
      title: "Chat home and account page",
      description: "Chat has its own starting page, and account settings have their own page.",
      changes: [
        "The chat page lists your documents so you can pick one to chat with",
        "Added an account page for managing your profile",
        "Workspaces now require you to sign in",
      ],
    },
    {
      date: "Jan 24, 2026",
      title: "Chat answers from the relevant passages",
      description:
        "On long documents, chat answers from the passages closest to your question instead of the whole text.",
      changes: [
        "Passages are ranked by embedding similarity to your question, and the closest ones go to the model",
        "Embeddings are stored under a SHA-256 hash of their text, so a passage already embedded is reused instead of embedded again",
      ],
    },
    {
      date: "Jan 23, 2026",
      title: "Changes between versions",
      description:
        "When a new version of a document finishes processing, Visura records what changed since the previous version. The app does not show these records.",
      changes: [
        "Gemini 2.5 Flash, through OpenRouter, describes changes in the first 40 changed passages, keeps each one it can back with a quote from the document, and labels it with a type such as added, removed or modified",
        "The upload page shows how many chunks have finished while a version is processed",
      ],
    },
    {
      date: "Jan 22, 2026",
      title: "Document versions and chunk reuse",
      description:
        "Uploading a changed file with the same name adds a new version of that document instead of starting over.",
      changes: [
        "Each version's text is split into chunks, and each chunk is hashed with SHA-256",
        "A chunk whose hash matches a chunk in an earlier version of the document reuses that chunk's summary instead of going back to the model",
        "Each version records how many chunks were reused and how many were new",
        "Before a version is created, Visura estimates its token use and does not process it if your daily limit would be exceeded",
      ],
    },
    {
      date: "Jan 14–15, 2026",
      title: "Sign-in pages and mobile chat",
      description: "Layout changes to the sign-in pages and the chat page on phones.",
      changes: [
        "Sign-in and sign-up pages show an illustrated side panel on large screens",
        "Added a New chat button to the document chat page on phones",
      ],
    },
    {
      date: "Dec 25, 2025",
      title: "Scanned PDFs",
      description: "PDFs with no selectable text are now read with OCR.",
      changes: [
        "When a PDF has no extractable text, its pages go through English OCR in your browser, up to the first 10 pages",
        "Your browser reads up to the first 50 pages of a PDF",
      ],
    },
    {
      date: "Dec 24, 2025",
      title: "More file types",
      description: "Uploads accept Word, text, Markdown, Excel and PowerPoint files alongside PDF.",
      changes: [
        "Added text extraction for Word (DOCX), plain text (TXT), Markdown (MD), Excel (XLSX, XLS) and PowerPoint (PPTX) files",
      ],
    },
    {
      date: "Dec 12, 2025",
      title: "Workspace chat and sharing from a summary",
      description:
        "Workspaces got a chat, and a summary can be added to a workspace from its page.",
      changes: [
        "Each workspace has a chat",
        "Add a summary to a workspace from the summary page",
        "Only the owner of a document can share it to a workspace",
      ],
    },
    {
      date: "Dec 12, 2025",
      title: "New summary page and dashboard",
      description: "The summary page and the dashboard were rebuilt.",
      changes: [
        "Summaries open in a new reading view",
        "The summary prompt now asks for a longer, more detailed breakdown of the document",
      ],
    },
    {
      date: "Dec 5–11, 2025",
      title: "Workspaces",
      description: "Create a workspace to keep documents together.",
      changes: ["Share your documents into a workspace", "Delete a workspace you created"],
    },
    {
      date: "Nov 21–24, 2025",
      title: "Analytics tab",
      description: "The dashboard has an Analytics tab next to your summaries.",
      changes: [
        "Counts your documents, in total or across your 4 most recent weeks with uploads in the past 30 days",
        "Lists your most recent uploads",
      ],
    },
    {
      date: "Nov 21, 2025",
      title: "Share links",
      description: "Share a summary with anyone by link.",
      changes: ["Anyone with the link can read the summary without signing in"],
    },
    {
      date: "Nov 20, 2025",
      title: "PDF downloads",
      description: "Download a summary as a PDF from the dashboard.",
      changes: [
        "Markdown symbols are stripped from the PDF, and bold text stays bold",
        "Downloads are counted per account, and downloading the same summary again does not count twice",
      ],
    },
    {
      date: "Nov 7, 2025",
      title: "Razorpay checkout",
      description: "Payments moved from Stripe to Razorpay.",
      changes: [
        "Checkout creates a one-time Razorpay order",
        "Added checkout pages for the Pro and Starter plans",
        "Checkout picks the currency from the country you are browsing from",
        "Added Shipping and Cancellation & refund pages",
      ],
    },
    {
      date: "Nov 2, 2025",
      title: "Loading and error screens",
      description:
        "Pages show a loading state while they fetch data and an error screen when they fail.",
      changes: [
        "Added loading screens for the dashboard, summary and chat pages",
        "Added error screens with a retry button for the dashboard, the upload page and the rest of the site",
        "Chat messages are rate-limited per user, and chat requests are validated before they run",
      ],
    },
    {
      date: "Oct 30 – Nov 2, 2025",
      title: "Rebuilt chat and phone layouts",
      description: "The document chat page was rebuilt, and core pages were reworked for phones.",
      changes: ["Reworked the header, dashboard and summary cards for small screens"],
    },
    {
      date: "Oct 28, 2025",
      title: "Site pages",
      description: "Added standalone pages for the rest of the site.",
      changes: [
        "Added About, Features, Pricing, Docs, Support and Contact pages",
        "Added Privacy, Terms and Cookies pages",
        "Added this changelog",
      ],
    },
    {
      date: "Sep 17, 2025",
      title: "Chat with a document",
      description: "Ask questions about an uploaded PDF and get answers based on its full text.",
      changes: [
        "Each summary has a chat page",
        "Conversations are saved, and a document's chat reopens your most recent one",
      ],
    },
    {
      date: "Sep 17, 2025",
      title: "Plans and upload limits",
      description: "Added paid plans with Stripe checkout.",
      changes: ["On the free plan, the dashboard shows how many summaries you can create"],
    },
    {
      date: "Sep 15–16, 2025",
      title: "Dashboard and summary pages",
      description: "Your summaries got a dashboard and a page each.",
      changes: [
        "The dashboard lists your summaries as cards",
        "Each summary opens on its own page",
        "Delete a summary from the dashboard",
      ],
    },
    {
      date: "Sep 14–15, 2025",
      title: "Accounts, upload and summaries",
      description: "Sign in, upload a PDF and get a summary.",
      changes: [
        "Sign up and sign in with Clerk",
        "Upload a PDF; its text is extracted and summarized by a model through OpenRouter",
        "Moved file storage from UploadThing to Supabase Storage",
        "Summaries are saved in a Postgres database on Neon",
      ],
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="bg-white border-b border-gray-200 py-8 sm:py-16">
        <div className="w-full px-6 lg:px-12 xl:px-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6 sm:mb-8"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to home</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6">
            Changelog
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl">
            What changed in Visura and when, taken from the project&apos;s commit history. Newest
            first.
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
