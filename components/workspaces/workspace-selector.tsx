"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Users, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  role: string;
  member_status: string;
}

export default function WorkspaceSelector() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces");
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        if (data.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(data[0]);
          // Store in localStorage
          localStorage.setItem("selectedWorkspaceId", data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load selected workspace from localStorage
    const savedWorkspaceId = localStorage.getItem("selectedWorkspaceId");
    if (savedWorkspaceId && workspaces.length > 0) {
      const workspace = workspaces.find((w) => w.id === savedWorkspaceId);
      if (workspace) {
        setSelectedWorkspace(workspace);
      }
    }
  }, [workspaces]);

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    localStorage.setItem("selectedWorkspaceId", workspace.id);
    router.refresh();
  };

  const handleCreateWorkspace = () => {
    router.push("/workspaces/new");
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50">
        <Building2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <Button
        onClick={handleCreateWorkspace}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Workspace
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span className="truncate">
              {selectedWorkspace?.name || "Select Workspace"}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {workspaces.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => handleWorkspaceSelect(workspace)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{workspace.name}</div>
              <div className="text-xs text-gray-400 capitalize">
                {workspace.role}
              </div>
            </div>
            {selectedWorkspace?.id === workspace.id && (
              <span className="text-xs text-orange-500">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreateWorkspace}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Workspace
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push("/workspaces")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Users className="w-4 h-4" />
          Manage Workspaces
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}










