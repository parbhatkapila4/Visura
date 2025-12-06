"use client";

import { useState, useEffect } from "react";
import { Share2, Building2, Eye, MessageSquare, Edit, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  role: string;
}

interface ShareDocumentDialogProps {
  pdfSummaryId: string;
  onShared?: () => void;
}

export default function ShareDocumentDialog({
  pdfSummaryId,
  onShared,
}: ShareDocumentDialogProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchWorkspaces();
    }
  }, [open]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces");
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (workspaceId: string, permission: "view" | "comment" | "edit") => {
    setSharing(workspaceId);
    try {
      const response = await fetch("/api/workspaces/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfSummaryId,
          workspaceId,
          permission,
        }),
      });

      if (response.ok) {
        toast.success("Document shared successfully!");
        setOpen(false);
        onShared?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to share document");
      }
    } catch (error) {
      console.error("Error sharing document:", error);
      toast.error("Failed to share document");
    } finally {
      setSharing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 hover:text-white hover:border-orange-500/50 transition-all duration-300"
        >
          <Share2 className="w-4 h-4" />
          Share with Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border-gray-800/50 backdrop-blur-xl shadow-2xl text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-400" />
            Share Document
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Share this document with one of your workspaces
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4 max-h-[500px] overflow-y-auto scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative mb-4">
                <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <Sparkles className="w-5 h-5 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-gray-400">Loading workspaces...</p>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-gray-900/30 border border-gray-800/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-gray-300 font-medium mb-1">No workspaces found</p>
              <p className="text-sm text-gray-500">Create a workspace to share documents</p>
            </div>
          ) : (
            workspaces.map((workspace, index) => (
              <div
                key={workspace.id}
                className="group p-4 rounded-xl bg-gradient-to-br from-gray-900/40 via-gray-900/30 to-gray-950/40 border border-gray-800/50 hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30">
                      <Building2 className="w-4 h-4 text-orange-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{workspace.name}</span>
                        {workspace.role === 'owner' && (
                          <Crown className="w-3.5 h-3.5 text-orange-400" />
                        )}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800/50 text-gray-400 capitalize border border-gray-700/50 mt-1 inline-block">
                        {workspace.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(workspace.id, "view")}
                    disabled={sharing === workspace.id}
                    className="flex flex-col items-center gap-1.5 h-auto py-2.5 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 hover:text-white hover:border-orange-500/50 transition-all duration-300 disabled:opacity-50"
                  >
                    {sharing === workspace.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">View</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(workspace.id, "comment")}
                    disabled={sharing === workspace.id}
                    className="flex flex-col items-center gap-1.5 h-auto py-2.5 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 hover:text-white hover:border-orange-500/50 transition-all duration-300 disabled:opacity-50"
                  >
                    {sharing === workspace.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xs">Comment</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(workspace.id, "edit")}
                    disabled={sharing === workspace.id}
                    className="flex flex-col items-center gap-1.5 h-auto py-2.5 border-gray-700 bg-gray-800/50 text-white hover:bg-gray-800 hover:text-white hover:border-orange-500/50 transition-all duration-300 disabled:opacity-50"
                  >
                    {sharing === workspace.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Edit className="w-4 h-4" />
                        <span className="text-xs">Edit</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
