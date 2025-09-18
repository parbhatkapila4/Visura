"use client";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { forwardRef, useState } from "react";

interface UploadFormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export const UploadFormInput = forwardRef<
  HTMLFormElement,
  UploadFormInputProps
>(({ onSubmit, isLoading }, ref) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <form ref={ref} className="flex flex-col gap-1" onSubmit={onSubmit}>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-4">
              <div className="flex-1 max-w-xs ml-10">
                <div className="relative">
                  <input
                    id="file"
                    type="file"
                    name="file"
                    accept="application/pdf"
                    required
                    onChange={handleFileChange}
                    className={cn(
                      "absolute inset-0 w-40 h-full opacity-0 cursor-pointer z-10",
                      isLoading && "cursor-not-allowed"
                    )}
                    disabled={isLoading}
                  />
                  <div
                    className={cn(
                      "h-12 border-2 border-r-sidebar-accent-foreground border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors",
                      selectedFile && "border-[#625EC3] bg-white/70",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {selectedFile ? (
                      <span className="text-[#625EC3] font-medium">
                        {selectedFile.name}
                      </span>
                    ) : (
                      <span className="text-gray-500">Select PDF File</span>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-8 bg-[#625EC3] text-white font-semibold rounded-lg hover:bg-[#625EC3]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: "#ffffff" }}
              >
                {isLoading ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : selectedFile ? (
                  `Upload ${selectedFile.name}`
                ) : (
                  "Upload Your PDF"
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Processing State Visualization */}
        {isLoading && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Processing
              </h3>

              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mb-6">
                <div
                  className="bg-green-600 h-2 rounded-full animate-pulse"
                  style={{ width: "35%" }}
                ></div>
              </div>

              {/* Placeholder Content Blocks */}
              <div className="bg-white/20 rounded-lg p-6 space-y-4">
                <div className="bg-white/20 rounded-lg h-8 w-full animate-pulse"></div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="bg-white/20 rounded h-4 w-3/4 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="bg-white/20 rounded h-4 w-2/3 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="bg-white/20 rounded h-4 w-4/5 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="bg-white/20 rounded h-4 w-1/2 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div className="bg-white/20 rounded h-4 w-3/5 animate-pulse"></div>
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
