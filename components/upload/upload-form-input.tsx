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
                      selectedFile && "border-[#625EC3] bg-white/70",
                      (isLoading || hasReachedLimit) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {selectedFile ? (
                      <span className="text-[#625EC3] font-medium text-sm truncate">
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
                className="h-12 px-6 sm:px-8 bg-[#625EC3] text-white font-semibold rounded-lg hover:bg-[#625EC3]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-50 w-full sm:w-auto"
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

        {/* PDF Compatibility Notice */}
        <div className="mt-6 relative group">
          <div className="bg-gradient-to-r from-slate-800/40 to-gray-800/40 backdrop-blur-sm border border-slate-600/40 rounded-xl p-6 shadow-lg transition-all duration-500 hover:shadow-slate-500/20 hover:shadow-2xl hover:scale-[1.02] hover:border-slate-500/60">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600/10 to-gray-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-700/5 to-gray-700/5 rounded-xl animate-pulse"></div>
            <div className="relative flex flex-col items-center text-center">
              <div className="mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-gray-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-slate-500/50 group-hover:shadow-lg">
                  <svg className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="w-full">
                <h4 className="text-lg font-semibold text-white/90 mb-4 transition-colors duration-300 group-hover:text-white">
                  Chatbot Feature Compatibility
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-center">
                    <span className="text-emerald-400 animate-pulse mr-2 text-lg">✓</span>
                    <span className="text-sm text-white/70 transition-colors duration-300 group-hover:text-white/80">
                      Text-based PDFs support AI chat functionality
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-amber-400 animate-bounce mr-2 text-lg">⚠</span>
                    <span className="text-sm text-white/70 transition-colors duration-300 group-hover:text-white/80">
                      Scanned documents will be uploaded and summarized but won't have chatbot access
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Animated border effect */}
            <div className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-r from-slate-500/20 via-gray-500/20 to-slate-500/20 bg-clip-border opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-white/70 mb-4">
                Processing
              </h3>

              <div className="w-full bg-white/20 rounded-full h-2 mb-4 sm:mb-6">
                <div
                  className="bg-[#625EC3] h-2 rounded-full animate-pulse"
                  style={{ width: "35%" }}
                ></div>
              </div>

              <div className="bg-white/20 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="bg-white/20 rounded-lg h-6 sm:h-8 w-full animate-pulse"></div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-[#625EC3] rounded-full flex-shrink-0"></div>
                    <div className="bg-white/20 rounded h-3 sm:h-4 w-3/4 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-[#625EC3] rounded-full flex-shrink-0"></div>
                    <div className="bg-white/20 rounded h-3 sm:h-4 w-2/3 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-[#625EC3] rounded-full flex-shrink-0"></div>
                    <div className="bg-white/20 rounded h-3 sm:h-4 w-4/5 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-[#625EC3] rounded-full flex-shrink-0"></div>
                    <div className="bg-white/20 rounded h-3 sm:h-4 w-1/2 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-2 h-2 bg-[#625EC3] rounded-full flex-shrink-0"></div>
                    <div className="bg-white/20 rounded h-3 sm:h-4 w-3/5 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
});
UploadFormInput.displayName = "UploadFormInput";

export default UploadFormInput;
