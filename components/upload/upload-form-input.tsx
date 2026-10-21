"use client";

import { cn } from "@/lib/utils";
import { isFileTypeSupported } from "@/lib/document-extractor";
import { Upload, FileText, Loader2, Zap, MessageSquare, AlertCircle } from "lucide-react";
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setSelectedFile(file || null);
    };

    useEffect(() => {
      if (selectedFile && fileInputRef.current) {
        if (
          !fileInputRef.current.files ||
          fileInputRef.current.files.length === 0 ||
          fileInputRef.current.files[0]?.name !== selectedFile.name
        ) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(selectedFile);
          fileInputRef.current.files = dataTransfer.files;
        }
      }
    }, [selectedFile]);

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
              const target = e.target as HTMLElement;
              if (target.tagName === "BUTTON") {
                return;
              }

              if (!isLoading && !hasReachedLimit && !selectedFile) {
                console.log("Drag zone clicked, opening file picker", {
                  hasInputRef: !!fileInputRef.current,
                  isLoading,
                  hasReachedLimit,
                  selectedFile: !!selectedFile,
                });
                e.stopPropagation();
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                } else {
                  console.error("File input ref is null!");
                }
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
                      <span
                        className="text-white underline underline-offset-2 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLoading && !hasReachedLimit && fileInputRef.current) {
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        browse
                      </span>
                    </p>
                    <p className="text-[#555] text-sm mt-1">
                      PDF, DOCX, TXT, MD, XLSX, XLS, PPTX • Max 32MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || hasReachedLimit || !selectedFile}
            onClick={(e) => {
              if (isLoading || hasReachedLimit || !selectedFile) {
                e.preventDefault();
                return;
              }
            }}
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
                Upload and summarize
              </>
            ) : (
              "Select a document to continue"
            )}
          </button>

          {hasReachedLimit && (
            <p className="text-center text-[#666] text-sm mt-3">
              You've used all {uploadLimit} documents your plan allows, and each new version of a
              document counts as one. Delete one from the dashboard to free a slot, or{" "}
              <a href="/checkout" className="text-white underline underline-offset-2">
                see plans
              </a>
              .
            </p>
          )}
        </form>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {[
            { icon: Zap, label: "AI summary", desc: "Written in English" },
            { icon: MessageSquare, label: "Chat", desc: "Ask questions" },
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
                <span className="text-white">PDFs</span> over 50 pages can be cut off at page 50. A
                fully scanned PDF is read with English OCR, first 10 pages only.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
UploadFormInput.displayName = "UploadFormInput";

export default UploadFormInput;
