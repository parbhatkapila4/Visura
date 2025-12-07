"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";

interface Collaborator {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  cursor_position: any;
  last_seen: string;
}

interface CollaborationPresenceProps {
  pdfSummaryId: string;
  currentUserId: string;
}

export default function CollaborationPresence({
  pdfSummaryId,
  currentUserId,
}: CollaborationPresenceProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  useEffect(() => {
    if (!pdfSummaryId) return;

    // Poll for active collaborators every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/workspaces/collaboration?pdfSummaryId=${pdfSummaryId}`
        );
        if (response.ok) {
          const data = await response.json();
          setCollaborators(data);
        }
      } catch (error) {
        console.error("Error fetching collaborators:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pdfSummaryId]);

  if (collaborators.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-800 shadow-lg">
        <div className="flex -space-x-2">
          {collaborators.slice(0, 3).map((collaborator) => (
            <div
              key={collaborator.id}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-900"
              title={collaborator.user_name || collaborator.user_email}
            >
              {collaborator.user_name?.[0]?.toUpperCase() ||
                collaborator.user_email[0]?.toUpperCase()}
            </div>
          ))}
          {collaborators.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-900">
              +{collaborators.length - 3}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 ml-2">
          {collaborators.length} {collaborators.length === 1 ? "person" : "people"} viewing
        </span>
      </div>
    </div>
  );
}





