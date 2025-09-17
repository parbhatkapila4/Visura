"use client";

import { FileText } from "lucide-react";

interface ProcessingNotificationProps {
  isVisible: boolean;
}

export default function ProcessingNotification({ isVisible }: ProcessingNotificationProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Processing PDF
            </h4>
            <p className="text-sm text-gray-600">
              Hang tight! Our AI is reading through your document!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
