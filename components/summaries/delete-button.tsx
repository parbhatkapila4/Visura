"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteButtonProps {
  summaryId: string;
  onDelete?: (deletedSummaryId: string) => void;
}

export default function DeleteButton({ summaryId, onDelete }: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`/api/summaries/${summaryId}`, {
        method: "DELETE",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `Failed to delete (${response.status})`
        );
      }

      toast.success("Summary deleted successfully");
      setIsOpen(false);

      if (onDelete) {
        onDelete(summaryId);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error("Delete request timed out. Please try again.");
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to delete summary");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="text-white/60 hover:text-white hover:bg-white/10 border-0 bg-transparent"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-white text-black border-gray-200 [&>button]:bg-transparent [&>button]:hover:bg-transparent"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-black">Are you absolutely sure?</DialogTitle>
          <DialogDescription className="text-gray-700">
            This action cannot be undone. This will permanently delete your summary and remove it
            from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
