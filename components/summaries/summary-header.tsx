"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  MessageCircle,
  BookOpen,
  ArrowRight,
  Share2,
  X,
  Copy,
  ChevronDown,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SummaryHeader({
  title,
  createdAt,
  readingTime,
  summaryId,
}: {
  title: string;
  createdAt: string;
  readingTime?: number;
  summaryId?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [hasActiveShare, setHasActiveShare] = useState(false);
  const [isCheckingShare, setIsCheckingShare] = useState(true);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [workspaceDialogOpen, setWorkspaceDialogOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isAddingToWorkspace, setIsAddingToWorkspace] = useState(false);
  const [workspacesWithDocument, setWorkspacesWithDocument] = useState<Set<string>>(new Set());
  const hasFetchedWorkspaces = useRef(false);

  useEffect(() => {
    if (!summaryId) {
      setIsCheckingShare(false);
      return;
    }

    const checkShareStatus = async () => {
      try {
        const response = await fetch(`/api/summaries/${summaryId}/share/status`);
        if (response.ok) {
          const data = await response.json();
          setHasActiveShare(data.hasActiveShare || false);
          if (data.hasActiveShare && data.shareUrl) {
            setShareUrl(data.shareUrl as string);
          }
        }
      } catch (error) {
        console.error("Error checking share status:", error);
      } finally {
        setIsCheckingShare(false);
      }
    };

    checkShareStatus();
  }, [summaryId]);

  const fetchWorkspaces = async () => {
    if (isLoadingWorkspaces) return;

    setIsLoadingWorkspaces(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const [workspacesResponse, sharedDocsResponse] = await Promise.all([
        fetch("/api/workspaces", {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        }),
        summaryId
          ? fetch(`/api/workspaces/documents?workspaceId=all&pdfSummaryId=${summaryId}`, {
              signal: controller.signal,
              headers: {
                "Content-Type": "application/json",
              },
            }).catch(() => null)
          : Promise.resolve(null),
      ]);

      clearTimeout(timeoutId);

      if (workspacesResponse.ok) {
        const workspacesData = await workspacesResponse.json();
        setWorkspaces(Array.isArray(workspacesData) ? workspacesData : []);

        if (sharedDocsResponse?.ok && summaryId) {
          try {
            const sharedDocs = await sharedDocsResponse.json();
            const workspaceIdsWithDoc = new Set(
              Array.isArray(sharedDocs) ? sharedDocs.map((doc: any) => doc.workspace_id) : []
            );
            setWorkspacesWithDocument(workspaceIdsWithDoc);
          } catch (e) {
            console.warn("Could not fetch shared documents info:", e);
          }
        } else {
          setWorkspacesWithDocument(new Set());
        }
      } else {
        const errorData = await workspacesResponse.json().catch(() => ({ error: "Unknown error" }));
        toast.error(errorData.error || "Failed to load workspaces");
        setWorkspaces([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        toast.error("Request timed out. Please try again.");
      } else {
        console.error("Error fetching workspaces:", error);
        toast.error("Failed to load workspaces. Please try again.");
      }
      setWorkspaces([]);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const handleAddToWorkspace = async (workspaceId: string) => {
    if (!summaryId) {
      toast.error("Summary ID is missing");
      return;
    }

    if (workspacesWithDocument.has(workspaceId)) {
      const workspace = workspaces.find((w) => w.id === workspaceId);
      toast.error(`Document is already in ${workspace?.name || "this workspace"}`);
      return;
    }

    const workspace = workspaces.find((w) => w.id === workspaceId);
    const workspaceName = workspace?.name || "workspace";

    setIsAddingToWorkspace(true);
    try {
      const response = await fetch("/api/workspaces/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfSummaryId: summaryId,
          workspaceId: workspaceId,
          permission: "view",
        }),
      });

      if (response.ok) {
        toast.success(`Successfully added to ${workspaceName}!`);

        setWorkspacesWithDocument((prev) => new Set(prev).add(workspaceId));
        setWorkspaceDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Not uploaded. Please try again.");
      }
    } catch (error) {
      console.error("Error adding document to workspace:", error);
      toast.error("Not uploaded. Please try again.");
    } finally {
      setIsAddingToWorkspace(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-500/5 rounded-3xl -m-6 p-6"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent rounded-3xl"></div>

      <div className="relative z-10">
        <div className="flex flex-col gap-8 mb-12">
          <motion.div
            className="flex flex-row justify-between items-center w-full gap-2 sm:gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link href="/dashboard" className="w-auto ml-2 sm:ml-0">
              <motion.div whileHover={{ scale: 1.02, x: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  className="group flex items-center gap-2 hover:bg-gray-800/80 backdrop-blur-md rounded-xl transition-all duration-300 bg-gray-900/40 border border-gray-700/50 hover:border-orange-500/30 px-3 py-2 sm:px-5 sm:py-3 w-auto"
                >
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/10 group-hover:from-orange-500/30 group-hover:to-amber-500/20 transition-all duration-300 border border-orange-500/20">
                    <ChevronLeft className="h-4 w-4 text-orange-400 transition-transform group-hover:-translate-x-1" />
                  </div>
                  <span className="font-semibold text-gray-200 group-hover:text-white text-sm sm:text-base transition-colors">
                    Back to Dashboard
                  </span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            className="w-full flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="relative w-full max-w-4xl">
              <motion.div
                className="absolute -inset-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-3xl blur-xl opacity-60"
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-orange-500/60 via-amber-500/40 to-orange-500/60 rounded-3xl blur-md opacity-50"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              <div className="relative bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl rounded-3xl border border-orange-500/30 p-8 sm:p-10 shadow-2xl">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-tl-3xl rounded-br-full blur-2xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-amber-500/20 to-transparent rounded-br-3xl rounded-tl-full blur-2xl"></div>

                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center">
                    <motion.div
                      className="flex-shrink-0"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl blur-lg opacity-60"></div>
                        <div className="relative bg-gradient-to-br from-orange-500 to-amber-500 p-4 rounded-2xl shadow-lg border border-orange-400/50">
                          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    <div className="min-w-0">
                      <motion.h1
                        className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <span className="bg-gradient-to-r from-white via-orange-100 to-amber-100 bg-clip-text text-transparent drop-shadow-lg">
                          {title}
                        </span>
                      </motion.h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {summaryId && (
            <div className="flex justify-center items-center w-full">
              <motion.div
                className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link href={`/chatbot/${summaryId}`} className="inline-flex">
                  <Button className="group relative flex items-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:via-amber-400 hover:to-orange-400 text-white rounded-xl transition-all duration-300 shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 px-4 py-2 sm:px-6 sm:py-3 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative z-10 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm sm:text-base">Chat with Document</span>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Button>
                </Link>

                <DropdownMenu
                  open={workspaceDialogOpen}
                  onOpenChange={(open) => {
                    setWorkspaceDialogOpen(open);
                    if (open && !hasFetchedWorkspaces.current) {
                      hasFetchedWorkspaces.current = true;

                      setTimeout(() => {
                        fetchWorkspaces();
                      }, 50);
                    }
                    if (!open) {
                      hasFetchedWorkspaces.current = false;

                      setWorkspacesWithDocument(new Set());
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <Button className="group relative flex items-center gap-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 text-white rounded-xl transition-all duration-300 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 px-4 py-2 sm:px-6 sm:py-3 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <div className="relative z-10 flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <span className="font-bold text-sm sm:text-base">Add to Workplace</span>
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="bg-gray-900 border-gray-700 w-80 max-h-96 overflow-y-auto"
                    align="end"
                  >
                    <div className="p-2">
                      <div className="px-2 py-1.5 mb-2">
                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Select Workspace
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Add this document to a workspace
                        </p>
                      </div>

                      {isLoadingWorkspaces ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        </div>
                      ) : workspaces.length === 0 ? (
                        <div className="text-center py-6">
                          <Building2 className="h-10 w-10 text-gray-600 mx-auto mb-3" />
                          <p className="text-sm text-gray-400 mb-1">No workspaces found</p>
                          <p className="text-xs text-gray-500 mb-4">Create a workspace first</p>
                          <Link href="/workspaces" onClick={() => setWorkspaceDialogOpen(false)}>
                            <Button
                              size="sm"
                              className="bg-white text-black hover:bg-white/90 text-xs"
                            >
                              Go to Workspaces
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {workspaces.map((workspace) => {
                            const alreadyAdded = workspacesWithDocument.has(workspace.id);
                            return (
                              <DropdownMenuItem
                                key={workspace.id}
                                onClick={() => {
                                  if (!alreadyAdded && !isAddingToWorkspace) {
                                    handleAddToWorkspace(workspace.id);
                                  }
                                }}
                                disabled={isAddingToWorkspace || alreadyAdded}
                                className={`flex items-center gap-3 p-3 rounded-lg ${
                                  alreadyAdded
                                    ? "cursor-not-allowed opacity-60"
                                    : "cursor-pointer focus:bg-gray-800 focus:text-white"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    alreadyAdded
                                      ? "bg-green-500/20 border border-green-500/30"
                                      : "bg-blue-500/20 border border-blue-500/30"
                                  }`}
                                >
                                  {alreadyAdded ? (
                                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                                  ) : (
                                    <Building2 className="h-4 w-4 text-blue-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {workspace.name}
                                  </p>
                                  {workspace.description && !alreadyAdded && (
                                    <p className="text-xs text-gray-400 truncate">
                                      {workspace.description}
                                    </p>
                                  )}
                                  {alreadyAdded && (
                                    <p className="text-xs text-green-400 truncate">Already added</p>
                                  )}
                                </div>
                                {isAddingToWorkspace && !alreadyAdded && (
                                  <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                )}
                              </DropdownMenuItem>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                {!hasActiveShare ? (
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/summaries/${summaryId}/share`, {
                          method: "POST",
                        });

                        if (!response.ok) {
                          const errorData = await response.json();
                          throw new Error(errorData.error || "Failed to generate share link");
                        }

                        const data = await response.json();
                        const shareUrl = data.shareUrl;
                        setHasActiveShare(true);
                        setShareUrl(shareUrl);

                        const shareData = {
                          title: title || "AI Summary",
                          text: `Check out this AI-generated summary: ${title || "Summary"}`,
                          url: shareUrl,
                        };

                        if (navigator.share && navigator.canShare(shareData)) {
                          await navigator.share(shareData);
                          toast.success("Summary shared successfully");
                        } else {
                          await navigator.clipboard.writeText(shareUrl);
                          toast.success("Share link copied to clipboard!");
                        }
                      } catch (error) {
                        if (error instanceof Error && error.name === "AbortError") {
                          return;
                        }

                        try {
                          const response = await fetch(`/api/summaries/${summaryId}/share`, {
                            method: "POST",
                          });
                          if (response.ok) {
                            const data = await response.json();
                            const shareUrl = data.shareUrl;
                            setHasActiveShare(true);
                            setShareUrl(shareUrl);
                            await navigator.clipboard.writeText(shareUrl);
                            toast.success("Share link copied to clipboard!");
                          } else {
                            throw error;
                          }
                        } catch (clipboardError) {
                          console.error("Share error:", error);
                          toast.error("Failed to share summary. Please try again.");
                        }
                      }
                    }}
                    className="group relative flex items-center gap-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-500 hover:to-gray-600 text-white rounded-xl transition-all duration-300 shadow-2xl shadow-gray-500/20 hover:shadow-gray-500/40 px-4 py-2 sm:px-6 sm:py-3 overflow-hidden border border-gray-600/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative z-10 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                        <Share2 className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-sm sm:text-base">Share</span>
                    </div>
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="group relative flex items-center gap-2 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 hover:from-gray-600 hover:via-gray-500 hover:to-gray-600 text-white rounded-xl transition-all duration-300 shadow-2xl shadow-gray-500/20 hover:shadow-gray-500/40 px-4 py-2 sm:px-6 sm:py-3 overflow-hidden border border-gray-600/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="relative z-10 flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                            <Share2 className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-sm sm:text-base">Share</span>
                          <ChevronDown className="h-4 w-4 opacity-70" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-gray-900 border-gray-700 text-white"
                    >
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            let urlToCopy = shareUrl;

                            if (!urlToCopy) {
                              const response = await fetch(`/api/summaries/${summaryId}/share`, {
                                method: "POST",
                              });
                              if (response.ok) {
                                const data = await response.json();
                                urlToCopy = data.shareUrl;
                                if (urlToCopy) {
                                  setShareUrl(urlToCopy);
                                }
                              } else {
                                throw new Error("Failed to get share link");
                              }
                            }

                            if (urlToCopy) {
                              await navigator.clipboard.writeText(urlToCopy);
                              toast.success("Share link copied to clipboard!");
                            } else {
                              throw new Error("Share URL not available");
                            }
                          } catch (error) {
                            console.error("Copy error:", error);
                            toast.error("Failed to copy share link. Please try again.");
                          }
                        }}
                        className="cursor-pointer focus:bg-gray-800 focus:text-white"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        <span>Copy Link</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              `/api/summaries/${summaryId}/share/revoke`,
                              {
                                method: "POST",
                              }
                            );

                            if (!response.ok) {
                              const errorData = await response.json();
                              throw new Error(errorData.error || "Failed to revoke share link");
                            }

                            setHasActiveShare(false);
                            setShareUrl(null);
                            toast.success(
                              "Share link revoked successfully. The link is no longer accessible."
                            );
                          } catch (error) {
                            console.error("Revoke error:", error);
                            toast.error("Failed to revoke share link. Please try again.");
                          }
                        }}
                        className="cursor-pointer focus:bg-red-500/20 focus:text-red-400 text-red-400"
                      >
                        <X className="mr-2 h-4 w-4" />
                        <span>Revoke Share</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </motion.div>
            </div>
          )}

          <motion.div
            className="relative h-px w-full max-w-3xl mx-auto"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent blur-sm"></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
