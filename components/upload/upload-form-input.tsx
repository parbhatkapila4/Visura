"use client";

import { cn } from "@/lib/utils";
import { isFileTypeSupported } from "@/lib/document-extractor";
import {
  Upload,
  FileText,
  Loader2,
  Check,
  Shield,
  Zap,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";

interface UploadFormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  hasReachedLimit: boolean;
  uploadLimit: number;
}

export const UploadFormInput = forwardRef<HTMLFormElement, UploadFormInputProps>(
  ({ onSubmit, isLoading, hasReachedLimit, uploadLimit }, ref) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const processingRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (isLoading && processingRef.current) {
        try {
          processingRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {}
      }
    }, [isLoading]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      console.log(
        "File selected:",
        file ? { name: file.name, size: file.size, type: file.type } : "null"
      );
      setSelectedFile(file || null);

      if (file && fileInputRef.current) {
        if (fileInputRef.current.files?.length === 0) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
        }
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!isLoading && !hasReachedLimit) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (isLoading || hasReachedLimit) return;

      const file = e.dataTransfer.files?.[0];
      if (file && isFileTypeSupported(file)) {
        setSelectedFile(file);
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
        }
      } else if (file) {
      }
    };

    return (
      <div className="w-full max-w-xl mx-auto">
        <form ref={ref} onSubmit={onSubmit}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button")) {
                return;
              }
              if (!isLoading && !hasReachedLimit && !selectedFile && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className={cn(
              "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer backdrop-blur-sm",
              isDragging
                ? "border-white bg-white/5"
                : selectedFile
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-[#2a2a2a] bg-transparent hover:border-[#3a3a3a] hover:bg-white/5",
              (isLoading || hasReachedLimit) && "opacity-50 cursor-not-allowed"
            )}
          >
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              name="file"
              accept=".pdf,.docx,.doc,.txt,.md,.xlsx,.xls,.pptx,.ppt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint"
              required
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || hasReachedLimit}
            />

            <div className="p-8 sm:p-12 text-center">
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium truncate max-w-xs mx-auto">
                      {selectedFile.name}
                    </p>
                    <p className="text-[#666] text-sm mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-[#666] hover:text-white transition-colors bg-transparent border-none"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#1a1a1a] border border-[#252525] flex items-center justify-center">
                    <Upload className="w-7 h-7 text-[#666]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      Drop your document here or{" "}
                      <span className="text-white underline underline-offset-2">browse</span>
                    </p>
                    <p className="text-[#555] text-sm mt-1">
                      PDF, Word, Text, Markdown, Excel, PowerPoint • Max 32MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || hasReachedLimit || !selectedFile}
            className={cn(
              "w-full mt-4 h-12 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2",
              isLoading || hasReachedLimit || !selectedFile
                ? "bg-[#1a1a1a] text-[#555] cursor-not-allowed"
                : "bg-white text-black hover:bg-[#e5e5e5]"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : hasReachedLimit ? (
              <>
                <AlertCircle className="w-4 h-4" />
                Upload limit reached
              </>
            ) : selectedFile ? (
              <>
                <Upload className="w-4 h-4" />
                Upload and Analyze
              </>
            ) : (
              "Select a document to continue"
            )}
          </button>

          {hasReachedLimit && (
            <p className="text-center text-[#666] text-sm mt-3">
              You've reached your limit of {uploadLimit} uploads.{" "}
              <a href="/checkout" className="text-white underline underline-offset-2">
                Upgrade to Pro
              </a>
            </p>
          )}
        </form>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: Zap, label: "AI Summary", desc: "Instant analysis" },
            { icon: MessageSquare, label: "Chat", desc: "Ask questions" },
            { icon: Shield, label: "Secure", desc: "Private & encrypted" },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="p-4 rounded-xl bg-transparent backdrop-blur-sm border border-[#1f1f1f] text-center"
            >
              <div className="w-9 h-9 mx-auto rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center mb-2">
                <Icon className="w-4 h-4 text-[#666]" />
              </div>
              <p className="text-white text-sm font-medium">{label}</p>
              <p className="text-[#555] text-xs mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-transparent backdrop-blur-sm border border-[#1f1f1f]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1a1a1a] border border-[#252525] flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-[#666]" />
            </div>
            <div className="text-sm">
              <p className="text-[#888]">
                <span className="text-white">Text-based documents</span> work best for AI chat.
                Scanned documents will be summarized but chat may be limited.
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <div ref={processingRef} className="mt-8">
            <div className="p-6 rounded-xl bg-transparent backdrop-blur-sm border border-[#1f1f1f]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white font-medium">Processing your document</span>
                </div>
                <span className="text-[#555] text-sm">Please wait...</span>
              </div>

              <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700 animate-pulse"
                  style={{ width: "40%" }}
                />
              </div>

              <div className="space-y-3">
                {[
                  { label: "Uploading to secure storage", done: true },
                  { label: "Extracting text content", done: true },
                  { label: "Analyzing with AI", done: false },
                  { label: "Generating summary", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                        step.done
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-[#1a1a1a] text-[#555]"
                      )}
                    >
                      {step.done ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className={cn("text-sm", step.done ? "text-[#888]" : "text-[#555]")}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
UploadFormInput.displayName = "UploadFormInput";

export default UploadFormInput;
