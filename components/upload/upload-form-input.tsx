"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LoaderCircle, FileText } from "lucide-react";
import { forwardRef, useState } from "react";
import ProcessingNotification from "./processing-notification";

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
      <ProcessingNotification isVisible={isLoading} />
      <div className="w-full max-w-2xl mx-auto">
        <form ref={ref} className="flex flex-col gap-8" onSubmit={onSubmit}>
        <div className="space-y-4">
          <label htmlFor="file" className="text-lg font-medium text-gray-900">
            Upload PDF
          </label>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                id="file"
                type="file"
                name="file"
                accept="application/pdf"
                required
                onChange={handleFileChange}
                className={cn(
                  "h-12 text-base",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                disabled={isLoading}
              />
              {selectedFile && (
                <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Selected: {selectedFile.name}</span>
                </div>
              )}
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading || !selectedFile}
              className="h-12 px-8 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-medium"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Processing</h3>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div className="bg-red-600 h-2 rounded-full animate-pulse" style={{ width: '35%' }}></div>
            </div>
            
            {/* Placeholder Content Blocks */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="bg-pink-100 rounded-lg h-8 w-full animate-pulse"></div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <div className="bg-pink-100 rounded h-4 w-3/4 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <div className="bg-pink-100 rounded h-4 w-2/3 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <div className="bg-pink-100 rounded h-4 w-4/5 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <div className="bg-pink-100 rounded h-4 w-1/2 animate-pulse"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <div className="bg-pink-100 rounded h-4 w-3/5 animate-pulse"></div>
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
