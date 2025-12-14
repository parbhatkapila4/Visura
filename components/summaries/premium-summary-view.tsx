"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { parseSection } from "@/utils/summary-helpers";
import {
  ChevronLeft,
  MessageSquare,
  BookOpen,
  Share2,
  Copy,
  X,
  Building2,
  Clock,
  FileText,
  Zap,
  Sparkles,
  ArrowUpRight,
  Check,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  Hash,
  Eye,
  BookMarked,
  Lightbulb,
  Target,
  Brain,
  ListChecks,
  TrendingUp,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

// ============================================
// GLOW CARD COMPONENT
// ============================================
const GlowCard = ({ children, className = "", color = "orange" }: { 
  children: React.ReactNode; 
  className?: string;
  color?: "orange" | "purple" | "blue" | "green" | "red" | "cyan" | "amber";
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const colors: Record<string, string> = {
    orange: "rgba(249, 115, 22, 0.12)",
    purple: "rgba(168, 85, 247, 0.12)",
    blue: "rgba(59, 130, 246, 0.12)",
    green: "rgba(34, 197, 94, 0.12)",
    red: "rgba(239, 68, 68, 0.12)",
    cyan: "rgba(6, 182, 212, 0.12)",
    amber: "rgba(245, 158, 11, 0.12)",
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${colors[color]}, transparent 40%)`,
          opacity: isHovered ? 1 : 0,
          willChange: 'opacity',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)'
        }}
      />
      <div className="absolute inset-0 rounded-[inherit] border border-white/[0.08]" />
      <motion.div
        className="absolute inset-0 rounded-[inherit] border border-white/20 opacity-0"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      {children}
    </motion.div>
  );
};

// ============================================
// SECTION ICON HELPER
// ============================================
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

const getSectionColor = (index: number): "orange" | "purple" | "blue" | "green" | "cyan" | "amber" => {
  const colors: ("orange" | "purple" | "blue" | "green" | "cyan" | "amber")[] = ["orange", "purple", "blue", "green", "cyan", "amber"];
  return colors[index % colors.length];
};

// ============================================
// SECTION CARD COMPONENT
// ============================================
const SectionCard = ({ 
  section, 
  index 
}: { 
  section: { title: string; points: string[] }; 
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const color = getSectionColor(index);
  const Icon = getSectionIcon(section.title);

  const colorClasses: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    orange: { bg: "from-orange-500/10 to-amber-500/5", border: "border-orange-500/20", text: "text-orange-400", glow: "shadow-orange-500/10" },
    purple: { bg: "from-purple-500/10 to-pink-500/5", border: "border-purple-500/20", text: "text-purple-400", glow: "shadow-purple-500/10" },
    blue: { bg: "from-blue-500/10 to-cyan-500/5", border: "border-blue-500/20", text: "text-blue-400", glow: "shadow-blue-500/10" },
    green: { bg: "from-emerald-500/10 to-teal-500/5", border: "border-emerald-500/20", text: "text-emerald-400", glow: "shadow-emerald-500/10" },
    cyan: { bg: "from-cyan-500/10 to-blue-500/5", border: "border-cyan-500/20", text: "text-cyan-400", glow: "shadow-cyan-500/10" },
    amber: { bg: "from-amber-500/10 to-yellow-500/5", border: "border-amber-500/20", text: "text-amber-400", glow: "shadow-amber-500/10" },
  };

  const styles = colorClasses[color];

  // Clean the title
  const cleanTitle = section.title.replace(/^\d+\.\s*/, '').replace(/^#+\s*/, '');

  return (
    <motion.div
      ref={ref}
      id={`section-${index}`}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="scroll-mt-24"
      style={{
        willChange: isInView ? 'auto' : 'transform, opacity',
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 500px'
      }}
    >
      <GlowCard className="bg-[#0a0a0a] rounded-2xl" color={color}>
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="w-full flex items-start gap-4 text-left">
            {/* Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${styles.bg} ${styles.border} border flex items-center justify-center shadow-lg ${styles.glow}`}>
              <Icon className={`w-6 h-6 ${styles.text}`} />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${styles.text} uppercase tracking-wider`}>
                  Section {index + 1}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs text-white/40">
                  {section.points.length} insights
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white transition-colors leading-tight">
                {cleanTitle}
              </h3>
            </div>
          </div>

          {/* Content */}
          <div className="pt-6 space-y-4">
            {section.points.map((point, pointIndex) => {
              const cleanText = point
                .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, "")
                .replace(/\*\*(.*?)\*\*/g, "$1")
                .replace(/\*(.*?)\*/g, "$1")
                .replace(/^•\s*/, "")
                .replace(/^-\s*/, "")
                .trim();

              if (!cleanText || cleanText.length < 3) return null;

              return (
                <motion.div
                  key={pointIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ delay: pointIndex * 0.03 }}
                  className="group/point flex gap-4 p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all duration-300"
                  style={{
                    willChange: isInView ? 'auto' : 'transform, opacity',
                    transform: 'translateZ(0)',
                    WebkitTransform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }}
                >
                  <div className={`flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${styles.bg.replace('/10', '/60').replace('/5', '/40')} mt-2.5`} />
                  <p className="text-white/70 group-hover/point:text-white/90 leading-relaxed transition-colors text-sm sm:text-base">
                    {cleanText}
                  </p>
                </motion.div>
              );
            }).filter(Boolean)}
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
};

// ============================================
// TABLE OF CONTENTS
// ============================================
const TableOfContents = ({ 
  sections, 
  activeSection,
  onSectionClick,
  isScrollingRef
}: { 
  sections: { title: string; points: string[] }[];
  activeSection: number;
  onSectionClick?: (index: number) => void;
  isScrollingRef?: React.MutableRefObject<boolean>;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    e.preventDefault();
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      const element = document.getElementById(`section-${index}`);
      if (!element) {
        console.warn(`Section element with id "section-${index}" not found. Available sections:`, 
          Array.from(document.querySelectorAll('[id^="section-"]')).map(el => el.id));
        return;
      }

      // Set flag to prevent scroll tracking from interfering
      if (isScrollingRef) {
        isScrollingRef.current = true;
      }

      // Update active section immediately
      if (onSectionClick) {
        onSectionClick(index);
      }

      // Calculate scroll position
      // scroll-mt-24 (96px) is already applied to the element
      // We need to account for the sticky header (approximately 64-80px)
      const headerOffset = 80;
      const elementTop = element.offsetTop; // This already accounts for scroll-margin
      const offsetPosition = elementTop - headerOffset;

      // Scroll to the element
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });

      // Reset flag after scroll completes (smooth scroll takes ~500ms)
      if (isScrollingRef) {
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 1000);
      }
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-2">
        <BookMarked className="w-4 h-4 text-orange-400" />
        <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Contents</span>
      </div>
      <nav className="space-y-1">
        {sections.map((section, index) => {
          const cleanTitle = section.title.replace(/^\d+\.\s*/, '').replace(/^#+\s*/, '');
          const isActive = activeSection === index;
          
          return (
            <a
              key={index}
              href={`#section-${index}`}
              onClick={(e) => handleClick(e, index)}
              className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-orange-500/10 text-orange-400 border-l-2 border-orange-500' 
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <span className="line-clamp-1">{cleanTitle}</span>
            </a>
          );
        })}
      </nav>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function PremiumSummaryView({ summary }: PremiumSummaryViewProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [hasActiveShare, setHasActiveShare] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isAddingToWorkspace, setIsAddingToWorkspace] = useState(false);
  const [workspacesWithDocument, setWorkspacesWithDocument] = useState<Set<string>>(new Set());
  const hasFetchedWorkspaces = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Check for error summary
  const isErrorSummary = 
    summary.summary_text.toLowerCase().includes('extraction error') ||
    summary.summary_text.toLowerCase().includes('object.defineproperty') ||
    summary.summary_text.toLowerCase().includes('was unable to access') ||
    summary.summary_text.toLowerCase().includes('i apologize');

  // Parse sections
  const sections = summary.summary_text
    .split("\n#")
    .map((section) => section.trim())
    .filter(Boolean)
    .map(parseSection);

  // Track active section based on scroll position
  useEffect(() => {
    // Cache section elements for better performance
    const sectionElements = sections.map((_, i) => 
      document.getElementById(`section-${i}`)
    ).filter(Boolean) as HTMLElement[];

    const handleScroll = () => {
      // Don't update if we're programmatically scrolling
      if (isScrollingRef.current) return;

      const headerOffset = 100;
      const scrollPosition = window.scrollY + headerOffset;

      // Use cached elements for better performance
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop) {
            // Only update if section changed
            if (activeSection !== i) {
              setActiveSection(i);
            }
            break;
          }
        }
      }
    };

    // Use Intersection Observer for better performance
    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          const sectionIndex = parseInt(sectionId.split('-')[1]);
          if (!isNaN(sectionIndex) && activeSection !== sectionIndex) {
            setActiveSection(sectionIndex);
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    sectionElements.forEach((el) => {
      if (el) observer.observe(el);
    });

    // Fallback scroll handler (throttled)
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

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      observer.disconnect();
    };
  }, [sections.length, activeSection]);

  const totalInsights = sections.reduce((total, section) => total + section.points.length, 0);
  const estimatedReadTime = Math.ceil(totalInsights * 0.5);
  const wordCount = summary.word_count || summary.summary_text.split(/\s+/).length;

  // Fetch workspaces
  const fetchWorkspaces = async () => {
    if (isLoadingWorkspaces) return;
    setIsLoadingWorkspaces(true);
    try {
      const [workspacesRes, sharedDocsRes] = await Promise.all([
        fetch("/api/workspaces"),
        fetch(`/api/workspaces/documents?workspaceId=all&pdfSummaryId=${summary.id}`).catch(() => null)
      ]);
      
      if (workspacesRes.ok) {
        const data = await workspacesRes.json();
        setWorkspaces(Array.isArray(data) ? data : []);
        
        if (sharedDocsRes?.ok) {
          const sharedDocs = await sharedDocsRes.json();
          setWorkspacesWithDocument(new Set(
            Array.isArray(sharedDocs) ? sharedDocs.map((d: any) => d.workspace_id) : []
          ));
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
    
    const workspace = workspaces.find(w => w.id === workspaceId);
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
        // Show success toast with workspace name
        toast.success(`Added to ${workspaceName}`, {
          description: "The document is now available in the workspace",
          duration: 3000,
        });
        // Update state to mark document as added
        setWorkspacesWithDocument(prev => new Set(prev).add(workspaceId));
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

  // Error state
  if (isErrorSummary) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <GlowCard className="bg-[#0a0a0a] rounded-3xl" color="red">
            <div className="p-8 sm:p-12">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-3">Processing Failed</h2>
                  <p className="text-white/60 mb-6 leading-relaxed">
                    We couldn't extract text from this document. This usually happens with scanned PDFs, 
                    password-protected files, or corrupted documents.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/upload">
                      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Another File
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        Back to Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen bg-black"
      style={{ 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 origin-left z-50"
        style={{ 
          scaleX: scrollYProgress,
          willChange: 'transform',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/80 border-b border-white/5" style={{
        willChange: 'transform',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:block">Dashboard</span>
            </Link>


            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              {/* Workspace Dropdown */}
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
                  <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5 hover:!text-white">
                    <Building2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:block">Workspace</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-[#111] border-white/10">
                  <div className="p-2">
                    <p className="text-xs text-white/40 px-2 py-1 mb-2">Add to workspace</p>
                    {isLoadingWorkspaces ? (
                      <div className="py-8 flex justify-center">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : workspaces.length === 0 ? (
                      <div className="py-6 text-center text-white/40 text-sm">
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
                            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer text-white hover:!text-white focus:!text-white focus:bg-white/10 hover:bg-white/10"
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              added ? 'bg-green-500/10' : 'bg-blue-500/10'
                            }`}>
                              {added ? (
                                <Check className="w-4 h-4 text-green-400" />
                              ) : (
                                <Building2 className="w-4 h-4 text-blue-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white">{ws.name}</p>
                              {added && <p className="text-xs text-green-400">Added</p>}
                            </div>
                          </DropdownMenuItem>
                        );
                      })
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Share */}
              <Button 
                type="button"
                size="sm" 
                variant="outline" 
                className="border-white/10 text-white hover:bg-white/5 hover:!text-white relative z-10"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Show dialog immediately for instant feedback
                  setShowShareDialog(true);
                  setIsGeneratingShareLink(true);
                  setShareUrl(null);
                  
                  try {
                    const res = await fetch(`/api/summaries/${summary.id}/share`, { 
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      }
                    });
                    
                    if (!res.ok) {
                      const errorData = await res.json().catch(() => ({}));
                      const errorMessage = errorData.error || errorData.message || `HTTP error! status: ${res.status}`;
                      throw new Error(errorMessage);
                    }
                    
                    const data = await res.json();
                    
                    if (!data.shareUrl) {
                      throw new Error("Share URL not found in response");
                    }
                    
                    // Copy to clipboard
                    try {
                      if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(data.shareUrl);
                      } else {
                        // Fallback for browsers that don't support clipboard API
                        const textArea = document.createElement("textarea");
                        textArea.value = data.shareUrl;
                        textArea.style.position = "fixed";
                        textArea.style.left = "-999999px";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                      }
                    } catch (clipboardError) {
                      console.error("Clipboard error:", clipboardError);
                    }
                    
                    // Update dialog with share URL
                    setShareUrl(data.shareUrl);
                    setIsGeneratingShareLink(false);
                    setHasActiveShare(true);
                  } catch (e: any) {
                    console.error("Share error:", e);
                    setIsGeneratingShareLink(false);
                    setShowShareDialog(false);
                    toast.error("Share Failed", {
                      description: e.message || "Failed to share. Please try again.",
                      duration: 5000,
                      position: "top-center",
                    });
                  }
                }}
              >
                <Share2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:block">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>


      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mb-8 shadow-2xl shadow-orange-500/25"
            >
              <BookOpen className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight"
            >
              {summary.title}
            </motion.h1>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-6 text-white/50"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm">{sections.length} sections</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm">{totalInsights} insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{estimatedReadTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">{wordCount.toLocaleString()} words</span>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <Link href={`/chatbot/${summary.id}`}>
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 text-lg px-8 py-6 rounded-2xl shadow-2xl shadow-orange-500/25">
                  <MessageSquare className="w-5 h-5 mr-3" />
                  Chat with this Document
                  <ArrowUpRight className="w-5 h-5 ml-3" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section 
        className="py-12 lg:py-16"
        style={{
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Content */}
          <main className="space-y-6">
              {sections.map((section, index) => (
                <SectionCard key={index} section={section} index={index} />
              ))}

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pt-8"
              >
                <GlowCard className="bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-3xl">
                  <div className="p-8 sm:p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/20 flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-8 h-8 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Have questions about this document?</h3>
                    <p className="text-white/50 mb-8 max-w-md mx-auto">
                      Start a conversation with our AI to explore deeper insights and get instant answers.
                    </p>
                    <Link href={`/chatbot/${summary.id}`}>
                      <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90 px-8 py-6 rounded-2xl">
                        <MessageSquare className="w-5 h-5 mr-3" />
                        Start Chatting
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </GlowCard>
              </motion.div>
            </main>
        </div>
      </section>

      {/* Share Success Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#0f0f0f] border-white/10 text-white max-w-md [&>button]:hidden">
          {isGeneratingShareLink ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-6 h-6 text-orange-400" />
                    </motion.div>
                  </div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Generating Share Link...
                  </DialogTitle>
                </div>
                <DialogDescription className="text-white/60 text-sm">
                  Please wait while we create your shareable link.
                </DialogDescription>
              </DialogHeader>
            </>
          ) : shareUrl ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-white">
                    Link Copied to Clipboard!
                  </DialogTitle>
                </div>
                <DialogDescription className="text-white/60 text-sm">
                  Your share link has been copied. You can now share it with others.
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/40 mb-1.5">Share Link:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-white/20"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/10"
                      onClick={async () => {
                        if (shareUrl) {
                          try {
                            await navigator.clipboard.writeText(shareUrl);
                            toast.success("Copied again!", { duration: 2000 });
                          } catch {
                            const textArea = document.createElement("textarea");
                            textArea.value = shareUrl;
                            textArea.style.position = "fixed";
                            textArea.style.left = "-999999px";
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            toast.success("Copied again!", { duration: 2000 });
                          }
                        }
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowShareDialog(false)}
                  className="border-white/10 text-white hover:bg-white/10 hover:!text-white"
                >
                  Close
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

