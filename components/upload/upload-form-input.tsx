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
