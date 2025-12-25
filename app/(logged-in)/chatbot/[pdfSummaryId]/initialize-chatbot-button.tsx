"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface InitializeChatbotButtonProps {
  pdfSummaryId: string;
}

export default function InitializeChatbotButton({ pdfSummaryId }: InitializeChatbotButtonProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const router = useRouter();

  const handleInitialize = async () => {
    try {
      setIsInitializing(true);
      const response = await fetch("/api/chatbot/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pdfSummaryId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize chatbot");
      }

      toast.success("Chatbot initialized successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error initializing chatbot:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to initialize chatbot. Please try again."
      );
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <button
      onClick={handleInitialize}
      disabled={isInitializing}
      className="inline-flex items-center justify-center h-11 px-6 bg-white text-black text-sm font-medium rounded-lg hover:bg-[#e5e5e5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed gap-2"
    >
      {isInitializing ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          Initializing...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          Initialize Chatbot
        </>
      )}
    </button>
  );
}
