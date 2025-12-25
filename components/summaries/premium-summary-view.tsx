"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { parseSection, extractSummaryPreview } from "@/utils/summary-helpers";
import {
  ChevronLeft,
  MessageSquare,
  Share2,
  Copy,
  Building2,
  Clock,
  FileText,
  Zap,
  Sparkles,
  ArrowUpRight,
  Check,
  AlertTriangle,
  RefreshCw,
  Hash,
  Eye,
  BookMarked,
  Lightbulb,
  Target,
  Brain,
  ListChecks,
  TrendingUp,
  Quote,
  Download,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PremiumSummaryViewProps {
  summary: {
    id: string;
    title: string;
    summary_text: string;
    created_at: string;
    word_count?: number;
  };
}

const getSectionIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("thesis") || lowerTitle.includes("argument")) return Brain;
  if (lowerTitle.includes("problem")) return Target;
  if (lowerTitle.includes("concept") || lowerTitle.includes("mental")) return Lightbulb;
  if (lowerTitle.includes("evidence") || lowerTitle.includes("research")) return FileText;
  if (lowerTitle.includes("framework") || lowerTitle.includes("system")) return ListChecks;
  if (lowerTitle.includes("objection") || lowerTitle.includes("rebuttal")) return Quote;
  if (lowerTitle.includes("success") || lowerTitle.includes("factor")) return TrendingUp;
  if (lowerTitle.includes("action") || lowerTitle.includes("takeaway")) return Zap;
  if (lowerTitle.includes("insight") || lowerTitle.includes("paradigm")) return Sparkles;
  if (lowerTitle.includes("application") || lowerTitle.includes("relevance")) return Target;
  if (lowerTitle.includes("summary") || lowerTitle.includes("overview")) return BookMarked;
  if (lowerTitle.includes("quote") || lowerTitle.includes("passage")) return Quote;
  return Hash;
};

export default function PremiumSummaryView({ summary }: PremiumSummaryViewProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isAddingToWorkspace, setIsAddingToWorkspace] = useState(false);
  const [workspacesWithDocument, setWorkspacesWithDocument] = useState<Set<string>>(new Set());
  const hasFetchedWorkspaces = useRef(false);
  const isScrollingRef = useRef(false);

  const isErrorSummary =
    summary.summary_text.toLowerCase().includes("extraction error") ||
    summary.summary_text.toLowerCase().includes("object.defineproperty") ||
    summary.summary_text.toLowerCase().includes("was unable to access") ||
    summary.summary_text.toLowerCase().includes("i apologize");

  const sections = summary.summary_text
    .split("\n#")
    .map((section) => section.trim())
    .filter(Boolean)
    .map(parseSection);

  const preview = extractSummaryPreview(summary.summary_text, summary.title, null);

  useEffect(() => {
    const sectionElements = sections
      .map((_, i) => document.getElementById(`section-${i}`))
      .filter(Boolean) as HTMLElement[];

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const headerOffset = 100;
      const scrollPosition = window.scrollY + headerOffset;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop) {
            if (activeSection !== i) {
              setActiveSection(i);
            }
            break;
          }
        }
      }
    };

    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [sections.length, activeSection]);

  const totalInsights = sections.reduce((total, section) => total + section.points.length, 0);
  const estimatedReadTime = Math.ceil(totalInsights * 0.5);
  const wordCount = summary.word_count || summary.summary_text.split(/\s+/).length;

  const fetchWorkspaces = async () => {
    if (isLoadingWorkspaces) return;
    setIsLoadingWorkspaces(true);
    try {
      const [workspacesRes, sharedDocsRes] = await Promise.all([
        fetch("/api/workspaces"),
        fetch(`/api/workspaces/documents?workspaceId=all&pdfSummaryId=${summary.id}`).catch(
          () => null
        ),
      ]);

      if (workspacesRes.ok) {
        const data = await workspacesRes.json();
        setWorkspaces(Array.isArray(data) ? data : []);

        if (sharedDocsRes?.ok) {
          const sharedDocs = await sharedDocsRes.json();
          setWorkspacesWithDocument(
            new Set(Array.isArray(sharedDocs) ? sharedDocs.map((d: any) => d.workspace_id) : [])
          );
        }
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const handleAddToWorkspace = async (workspaceId: string) => {
    if (workspacesWithDocument.has(workspaceId)) return;

    const workspace = workspaces.find((w) => w.id === workspaceId);
    const workspaceName = workspace?.name || "workspace";
    setIsAddingToWorkspace(true);

    try {
      const response = await fetch("/api/workspaces/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfSummaryId: summary.id,
          workspaceId,
          permission: "view",
        }),
      });

      if (response.ok) {
        toast.success(`Added to ${workspaceName}`, {
          description: "The document is now available in the workspace",
          duration: 3000,
        });

        setWorkspacesWithDocument((prev) => new Set(prev).add(workspaceId));
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add to workspace");
      }
    } catch (error) {
      console.error("Error adding to workspace:", error);
      toast.error("Failed to add to workspace");
    } finally {
      setIsAddingToWorkspace(false);
    }
  };

  const handleShare = async () => {
    setShowShareDialog(true);
    setIsGeneratingShareLink(true);
    setShareUrl(null);

    try {
      const res = await fetch(`/api/summaries/${summary.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.shareUrl) {
        throw new Error("Share URL not found in response");
      }

      try {
        await navigator.clipboard.writeText(data.shareUrl);
      } catch {
        const textArea = document.createElement("textarea");
        textArea.value = data.shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setShareUrl(data.shareUrl);
      setIsGeneratingShareLink(false);
    } catch (e: any) {
      console.error("Share error:", e);
      setIsGeneratingShareLink(false);
      setShowShareDialog(false);
      toast.error("Share Failed", {
        description: e.message || "Failed to share. Please try again.",
      });
    }
  };

  const scrollToSection = (index: number) => {
    const element = document.getElementById(`section-${index}`);
    if (!element) return;

    isScrollingRef.current = true;
    setActiveSection(index);

    const headerOffset = 80;
    const elementTop = element.offsetTop;
    const offsetPosition = elementTop - headerOffset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: "smooth",
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000);
  };

  if (isErrorSummary) {
    return (
      <div className="bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">Processing Failed</h1>
            <p className="text-[#888] leading-relaxed max-w-md mx-auto">
              We couldn't extract text from this document. This usually happens with scanned PDFs,
              password-protected files, or corrupted documents.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link href="/upload">
              <Button className="bg-white text-black hover:bg-[#e5e5e5]">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Another File
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-[#2a2a2a] text-white hover:bg-[#1a1a1a]">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-[calc(100vh-56px)] pb-12">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-[#666] hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </Link>
              <span className="text-[#333]">/</span>
              <span className="text-sm text-white font-medium truncate max-w-[200px] sm:max-w-[300px]">
                {summary.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu
                onOpenChange={(open) => {
                  if (open && !hasFetchedWorkspaces.current) {
                    hasFetchedWorkspaces.current = true;
                    fetchWorkspaces();
                  }
                  if (!open) hasFetchedWorkspaces.current = false;
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                  >
                    <Building2 className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-[#111] border-[#1f1f1f]">
                  <div className="p-2">
                    <p className="text-xs text-[#666] px-2 py-1 mb-2">Add to workspace</p>
                    {isLoadingWorkspaces ? (
                      <div className="py-8 flex justify-center">
                        <div className="w-5 h-5 border-2 border-[#333] border-t-white rounded-full animate-spin" />
                      </div>
                    ) : workspaces.length === 0 ? (
                      <div className="py-6 text-center text-[#666] text-sm">
                        No workspaces found
                      </div>
                    ) : (
                      workspaces.map((ws) => {
                        const added = workspacesWithDocument.has(ws.id);
                        return (
                          <DropdownMenuItem
                            key={ws.id}
                            onClick={() => !added && handleAddToWorkspace(ws.id)}
                            disabled={added || isAddingToWorkspace}
                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer text-white hover:text-white focus:text-white focus:bg-[#1a1a1a] hover:bg-[#1a1a1a]"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                added ? "bg-emerald-500/10" : "bg-[#1a1a1a]"
                              }`}
                            >
                              {added ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Building2 className="w-4 h-4 text-[#666]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white">{ws.name}</p>
                              {added && <p className="text-xs text-emerald-500">Added</p>}
                            </div>
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="sm"
                variant="ghost"
                className="text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>

              <Link href={`/chatbot/${summary.id}`}>
                <Button size="sm" className="bg-white text-black hover:bg-[#e5e5e5] ml-2">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex gap-8 py-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <div className="mb-6 p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">
                      Sections
                    </p>
                    <p className="text-lg font-semibold text-white">{sections.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">
                      Insights
                    </p>
                    <p className="text-lg font-semibold text-white">{totalInsights}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">
                      Read time
                    </p>
                    <p className="text-lg font-semibold text-white">{estimatedReadTime}m</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Words</p>
                    <p className="text-lg font-semibold text-white">
                      {(wordCount / 1000).toFixed(1)}k
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f]">
                <p className="text-[11px] text-[#555] uppercase tracking-wider font-medium mb-3 px-2">
                  On this page
                </p>
                <nav className="space-y-0.5">
                  {sections.map((section, index) => {
                    const cleanTitle = section.title.replace(/^\d+\.\s*/, "").replace(/^#+\s*/, "");
                    const isActive = activeSection === index;

                    return (
                      <button
                        key={index}
                        onClick={() => scrollToSection(index)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive
                            ? "bg-white/5 text-white"
                            : "text-[#666] hover:text-[#999] hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className="line-clamp-1">{cleanTitle}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0 max-w-3xl">
            <div className="mb-8 pb-8 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-2 text-[#555] text-sm mb-4">
                <FileText className="w-4 h-4" />
                <span>{preview.documentType || "Document"}</span>
                <span className="text-[#333]">•</span>
                <span>
                  {new Date(summary.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-4 leading-tight tracking-tight">
                {summary.title}
              </h1>

              <div className="flex flex-wrap gap-4 text-sm text-[#666] lg:hidden mb-6">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  {sections.length} sections
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {totalInsights} insights
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {estimatedReadTime} min
                </span>
              </div>

              {preview.keyPoints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[11px] text-[#555] uppercase tracking-wider font-medium">
                    Key highlights
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {preview.keyPoints.slice(0, 3).map((point, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-1.5 rounded-full bg-[#111] border border-[#1f1f1f] text-[#888] text-xs"
                      >
                        {point.length > 50 ? `${point.substring(0, 50)}...` : point}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {sections.map((section, index) => {
                const Icon = getSectionIcon(section.title);
                const cleanTitle = section.title.replace(/^\d+\.\s*/, "").replace(/^#+\s*/, "");

                return (
                  <section key={index} id={`section-${index}`} className="scroll-mt-20">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-[#666]" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">
                          Section {index + 1}
                        </p>
                        <h2 className="text-xl font-semibold text-white">{cleanTitle}</h2>
                      </div>
                    </div>

                    <div className="pl-11 space-y-3">
                      {section.points
                        .map((point, pointIndex) => {
                          const cleanText = point
                            .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "")
                            .replace(/\*\*(.*?)\*\*/g, "$1")
                            .replace(/\*(.*?)\*/g, "$1")
                            .replace(/^•\s*/, "")
                            .replace(/^-\s*/, "")
                            .trim();

                          if (!cleanText || cleanText.length < 3) return null;

                          return (
                            <div
                              key={pointIndex}
                              className="group flex gap-3 py-2 border-l-2 border-[#1f1f1f] hover:border-[#333] pl-4 transition-colors"
                            >
                              <p className="text-[#999] text-[15px] leading-relaxed group-hover:text-[#bbb] transition-colors">
                                {cleanText}
                              </p>
                            </div>
                          );
                        })
                        .filter(Boolean)}
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="mt-12 pt-8 pb-8 border-t border-[#1f1f1f]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-xl bg-[#111] border border-[#1f1f1f]">
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Want to explore deeper?</h3>
                  <p className="text-sm text-[#666]">
                    Chat with AI to ask questions about this document
                  </p>
                </div>
                <Link href={`/chatbot/${summary.id}`}>
                  <Button className="bg-white text-black hover:bg-[#e5e5e5] whitespace-nowrap">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chat
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </main>

          <aside className="hidden xl:block w-48 flex-shrink-0">
            <div className="sticky top-20 space-y-3">
              <Link href={`/chatbot/${summary.id}`} className="block">
                <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1">Ask AI</p>
                  <p className="text-xs text-[#666]">Chat about this doc</p>
                </div>
              </Link>

              <div
                onClick={handleShare}
                className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3">
                  <Share2 className="w-4 h-4 text-[#888]" />
                </div>
                <p className="text-sm font-medium text-white mb-1">Share</p>
                <p className="text-xs text-[#666]">Copy link</p>
              </div>

              <DropdownMenu
                onOpenChange={(open) => {
                  if (open && !hasFetchedWorkspaces.current) {
                    hasFetchedWorkspaces.current = true;
                    fetchWorkspaces();
                  }
                  if (!open) hasFetchedWorkspaces.current = false;
                }}
              >
                <DropdownMenuTrigger asChild>
                  <div className="p-4 rounded-xl bg-[#111111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3">
                      <Building2 className="w-4 h-4 text-[#888]" />
                    </div>
                    <p className="text-sm font-medium text-white mb-1">Workspace</p>
                    <p className="text-xs text-[#666]">Add to team</p>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-[#111] border-[#1f1f1f]">
                  <div className="p-2">
                    <p className="text-xs text-[#666] px-2 py-1 mb-2">Add to workspace</p>
                    {isLoadingWorkspaces ? (
                      <div className="py-8 flex justify-center">
                        <div className="w-5 h-5 border-2 border-[#333] border-t-white rounded-full animate-spin" />
                      </div>
                    ) : workspaces.length === 0 ? (
                      <div className="py-6 text-center text-[#666] text-sm">
                        No workspaces found
                      </div>
                    ) : (
                      workspaces.map((ws) => {
                        const added = workspacesWithDocument.has(ws.id);
                        return (
                          <DropdownMenuItem
                            key={ws.id}
                            onClick={() => !added && handleAddToWorkspace(ws.id)}
                            disabled={added || isAddingToWorkspace}
                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer text-white hover:text-white focus:text-white focus:bg-[#1a1a1a] hover:bg-[#1a1a1a]"
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                added ? "bg-emerald-500/10" : "bg-[#1a1a1a]"
                              }`}
                            >
                              {added ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Building2 className="w-4 h-4 text-[#666]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white">{ws.name}</p>
                              {added && <p className="text-xs text-emerald-500">Added</p>}
                            </div>
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </aside>
        </div>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#111111] border-[#1f1f1f] text-white max-w-md [&>button]:hidden">
          {isGeneratingShareLink ? (
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-[#888] animate-spin" />
                </div>
                <DialogTitle className="text-lg font-semibold text-white">
                  Generating Share Link...
                </DialogTitle>
              </div>
              <DialogDescription className="text-[#666] text-sm">
                Please wait while we create your shareable link.
              </DialogDescription>
            </DialogHeader>
          ) : shareUrl ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-500" />
                  </div>
                  <DialogTitle className="text-lg font-semibold text-white">
                    Link Copied!
                  </DialogTitle>
                </div>
                <DialogDescription className="text-[#666] text-sm">
                  Your share link has been copied to clipboard.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[#0a0a0a] border border-[#1f1f1f]">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-transparent text-sm text-[#888] focus:outline-none cursor-pointer"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const input = e.target as HTMLInputElement;
                      input.select();

                      try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(shareUrl);
                          toast.success("Copied to clipboard!", {
                            description: "Share link has been copied to your clipboard",
                            duration: 3000,
                          });
                        }
                      } catch (err) {}
                    }}
                  />
                  <button
                    type="button"
                    className="p-2 rounded-lg text-[#888] hover:text-white hover:bg-[#1a1a1a] transition-colors flex-shrink-0"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (!shareUrl) {
                        toast.error("No URL to copy");
                        return;
                      }

                      const copyToClipboard = async (text: string) => {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(text);
                          return true;
                        }
                        return false;
                      };

                      const copyFallback = (text: string) => {
                        const textArea = document.createElement("textarea");
                        textArea.value = text;
                        textArea.style.position = "fixed";
                        textArea.style.top = "0";
                        textArea.style.left = "0";
                        textArea.style.width = "2em";
                        textArea.style.height = "2em";
                        textArea.style.padding = "0";
                        textArea.style.border = "none";
                        textArea.style.outline = "none";
                        textArea.style.boxShadow = "none";
                        textArea.style.background = "transparent";
                        textArea.setAttribute("readonly", "");
                        textArea.setAttribute("aria-hidden", "true");
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        textArea.setSelectionRange(0, 99999);

                        try {
                          const successful = document.execCommand("copy");
                          document.body.removeChild(textArea);
                          return successful;
                        } catch {
                          document.body.removeChild(textArea);
                          return false;
                        }
                      };

                      try {
                        const success = await copyToClipboard(shareUrl);
                        if (success) {
                          toast.success("Copied to clipboard!", {
                            description: "Share link has been copied to your clipboard",
                            duration: 3000,
                          });
                        } else {
                          const fallbackSuccess = copyFallback(shareUrl);
                          if (fallbackSuccess) {
                            toast.success("Copied to clipboard!", {
                              description: "Share link has been copied to your clipboard",
                              duration: 3000,
                            });
                          } else {
                            throw new Error("All copy methods failed");
                          }
                        }
                      } catch (error) {
                        console.error("Copy failed:", error);
                        toast.error("Failed to copy", {
                          description: "Please copy the link manually from the input field",
                          duration: 5000,
                        });
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowShareDialog(false)}
                  className="border-[#2a2a2a] text-white hover:bg-[#1a1a1a] hover:text-white"
                >
                  Done
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
