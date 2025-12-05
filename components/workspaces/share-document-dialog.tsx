"use client";

import { useState, useEffect } from "react";
import { Share2, Building2 } from "lucide-react";
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
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share with Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription className="text-gray-400">
            Share this document with one of your workspaces
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading workspaces...</div>
          ) : workspaces.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No workspaces found</p>
              <p className="text-sm mt-2">Create a workspace to share documents</p>
            </div>
          ) : (
            workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-400" />
                    <span className="font-medium text-white">{workspace.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 capitalize">
                      {workspace.role}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(workspace.id, "view")}
                    disabled={sharing === workspace.id}
                    className="flex-1"
                  >
                    {sharing === workspace.id ? "Sharing..." : "View"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(workspace.id, "comment")}
                    disabled={sharing === workspace.id}
                    className="flex-1"
                  >
                    {sharing === workspace.id ? "Sharing..." : "Comment"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(workspace.id, "edit")}
                    disabled={sharing === workspace.id}
                    className="flex-1"
                  >
                    {sharing === workspace.id ? "Sharing..." : "Edit"}
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

