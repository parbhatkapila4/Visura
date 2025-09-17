import { Sparkles, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function UploadHeader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <Badge
        variant={"secondary"}
        className="px-6 py-2 text-base font-medium bg-pink-100 text-pink-800 rounded-full border-0"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        AI-Powered Content Creation
      </Badge>
      
      <div className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Start Uploading{" "}
        <span className="text-pink-600">Your</span> PDF's
      </div>
      
      <div className="flex items-center gap-2 text-gray-600 text-lg">
        <span>Upload your PDF and let our AI do the magic!</span>
        <ArrowDown className="h-5 w-5" />
      </div>
    </div>
  );
}
