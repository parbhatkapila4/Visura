"use client";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { forwardRef, useState } from "react";

interface UploadFormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  hasReachedLimit: boolean;
  uploadLimit: number;
}

export const UploadFormInput = forwardRef<
  HTMLFormElement,
  UploadFormInputProps
>(({ onSubmit, isLoading, hasReachedLimit, uploadLimit }, ref) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <form ref={ref} className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-full sm:flex-1 sm:max-w-xs">
                <div className="relative">
                  <input
                    id="file"
                    type="file"
                    name="file"
                    accept="application/pdf"
                    required
                    onChange={handleFileChange}
                    className={cn(
                      "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
                      (isLoading || hasReachedLimit) && "cursor-not-allowed"
                    )}
                    disabled={isLoading || hasReachedLimit}
                  />
                  <div
                    className={cn(
                      "h-12 border-2 border-r-sidebar-accent-foreground border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors px-4",
                      selectedFile && "border-[#f97316] bg-white/70",
                      (isLoading || hasReachedLimit) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {selectedFile ? (
                      <span className="text-[#f97316] font-medium text-sm truncate">
                        {selectedFile.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Select PDF File
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || hasReachedLimit}
                className="h-12 px-6 sm:px-8 bg-[#f97316] text-white font-semibold rounded-lg hover:bg-[#ea580c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-50 w-full sm:w-auto"
                style={{ color: "#ffffff" }}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">Processing</span>
                  </>
                ) : hasReachedLimit ? (
                  "Limit Reached"
                ) : selectedFile ? (
                  <>
                    <span className="hidden sm:inline">
                      Upload {selectedFile.name}
                    </span>
                    <span className="sm:hidden">Upload PDF</span>
                  </>
                ) : (
                  "Upload Your PDF"
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Chatbot Compatibility Card */}
        <div className="mt-8">
          <div className="relative mx-auto max-w-3xl">
            {/* soft glow */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-orange-600/15 via-amber-500/10 to-red-500/15 blur opacity-70" />

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-6 sm:p-8 shadow-xl">
              {/* subtle grid */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-orange-500/10 blur-2xl" />

              {/* badge */}
              <div className="flex items-center gap-2 text-xs font-medium text-orange-300/90 bg-orange-500/10 border border-orange-400/20 rounded-full w-max px-3 py-1 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                Compatibility
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l4 4-4 4-4-4 4-4z"/><path d="M12 22l4-4-4-4-4 4 4 4z"/></svg>
                </div>
                <h4 className="text-xl font-semibold text-white/90 tracking-tight">Chatbot Feature Compatibility</h4>
              </div>

              {/* feature chips */}
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  "AI chat",
                  "Instant summary",
                  "PDF support",
                  "Secure",
                ].map((chip) => (
                  <span key={chip} className="text-[11px] tracking-wide uppercase text-white/70 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                    {chip}
                  </span>
                ))}
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <span className="text-emerald-300 text-sm">✓</span>
                  </div>
                  <p className="text-sm text-white/85">Text-based PDFs fully support AI chat functionality</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-amber-500/15 border border-amber-400/30 flex items-center justify-center">
                    <span className="text-amber-300 text-sm">!</span>
                  </div>
                  <p className="text-sm text-white/70">Scanned documents will be uploaded and summarized, but chat is not available</p>
                </div>
              </div>

              {/* footer note */}
              <div className="mt-5 flex items-center gap-2 text-[12px] text-white/60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Your files remain private and are processed securely.
              </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="mt-8 sm:mt-10">
            <div className="relative mx-auto max-w-3xl">
              {/* Glow ring */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-orange-600/20 via-amber-500/10 to-red-500/20 blur opacity-60" />

              {/* Card */}
              <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-8 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                    <h3 className="text-base sm:text-lg font-semibold text-white/90 tracking-tight">Processing your PDF</h3>
                  </div>
                  <span className="text-xs sm:text-sm text-white/60">This may take a moment</span>
                </div>

                {/* Progress bar */}
                <div className="relative w-full h-2 rounded-full bg-white/10 overflow-hidden mb-6">
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent)] animate-[shimmer_1.5s_linear_infinite]" />
                  <div className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 rounded-full transition-all duration-700" style={{ width: "38%" }} />
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 gap-3">
                  {[
                    "Uploading file to secure storage",
                    "Extracting text and structure",
                    "Analyzing content with AI",
                    "Generating concise summary",
                    "Saving result for you",
                  ].map((label, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="relative">
                        <span className="block h-2 w-2 rounded-full bg-orange-500" />
                        {i === 0 && <span className="absolute inset-0 -m-1 rounded-full bg-orange-500/40 blur-sm" />}
                      </div>
                      <div className="flex-1 h-3 rounded-md bg-white/10 overflow-hidden">
                        <div className="h-full w-3/4 bg-white/15">
                          <div className="h-full w-full bg-white/10 animate-pulse" />
                        </div>
                      </div>
                      <span className="hidden sm:block text-xs text-white/70 whitespace-nowrap">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes shimmer { 
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
          </div>
        )}
      </div>
    </>
  );
});
UploadFormInput.displayName = "UploadFormInput";

export default UploadFormInput;
