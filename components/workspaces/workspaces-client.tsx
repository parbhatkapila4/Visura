"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Users, FileText, Activity, UserPlus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  role: string;
  member_status: string;
  created_at: string;
}

interface WorkspaceMember {
  id: string;
  user_email: string;
  user_name: string | null;
  role: string;
  joined_at: string;
}

export default function WorkspacesClient() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceDetails(selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("/api/workspaces");
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        if (data.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceDetails = async (workspaceId: string) => {
    try {
      // Fetch members
      const membersResponse = await fetch(`/api/workspaces/members?workspaceId=${workspaceId}`);
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData);
      }

      // Fetch documents
      const docsResponse = await fetch(`/api/workspaces/documents?workspaceId=${workspaceId}`);
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setDocuments(docsData);
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName,
          description: workspaceDescription,
        }),
      });

      if (response.ok) {
        const newWorkspace = await response.json();
        toast.success("Workspace created successfully!");
        setCreateDialogOpen(false);
        setWorkspaceName("");
        setWorkspaceDescription("");
        fetchWorkspaces();
        setSelectedWorkspace(newWorkspace);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create workspace");
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast.error("Failed to create workspace");
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !selectedWorkspace) {
      toast.error("Email is required");
      return;
    }

    try {
      const response = await fetch("/api/workspaces/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: selectedWorkspace.id,
          userEmail: inviteEmail,
          role: "member",
        }),
      });

      if (response.ok) {
        toast.success("Member invited successfully!");
        setInviteDialogOpen(false);
        setInviteEmail("");
        fetchWorkspaceDetails(selectedWorkspace.id);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to invite member");
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error("Failed to invite member");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading workspaces...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Workspaces</h1>
          <p className="text-gray-400">Collaborate with your team on documents</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Workspace
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a workspace to collaborate with your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Workspace Name</Label>
                <Input
                  id="name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  placeholder="Describe your workspace..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Button onClick={handleCreateWorkspace} className="w-full">
                Create Workspace
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workspaces Grid */}
      {workspaces.length === 0 ? (
        <Card className="p-12 text-center bg-gray-900/50 border-gray-800">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No workspaces yet</h3>
          <p className="text-gray-400 mb-6">Create your first workspace to start collaborating</p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Workspace
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workspace List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-lg font-semibold text-white mb-4">Your Workspaces</h2>
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedWorkspace?.id === workspace.id
                    ? "bg-orange-500/10 border-orange-500/50"
                    : "bg-gray-900/50 border-gray-800 hover:border-gray-700"
                }`}
                onClick={() => setSelectedWorkspace(workspace)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-orange-400" />
                      <h3 className="font-semibold text-white">{workspace.name}</h3>
                    </div>
                    {workspace.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">{workspace.description}</p>
                    )}
                    {workspace.role !== 'owner' && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 capitalize">
                          {workspace.role}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Workspace Details */}
          {selectedWorkspace && (
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 bg-gray-900/50 border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedWorkspace.name}</h2>
                    {selectedWorkspace.description && (
                      <p className="text-gray-400">{selectedWorkspace.description}</p>
                    )}
                  </div>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2 border-gray-700 text-white hover:bg-gray-800 hover:text-white hover:border-gray-600">
                        <UserPlus className="w-4 h-4" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-800 text-white">
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Invite someone to join this workspace
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            className="bg-gray-800 border-gray-700 text-white"
                          />
                        </div>
                        <Button onClick={handleInviteMember} className="w-full">
                          Send Invitation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Members Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-400" />
                    Members ({members.length})
                  </h3>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                            {member.user_name?.[0]?.toUpperCase() || member.user_email[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {member.user_name || member.user_email}
                            </div>
                            <div className="text-xs text-gray-400">{member.user_email}</div>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300 capitalize">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Documents Section */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400" />
                    Shared Documents ({documents.length})
                  </h3>
                  {documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No documents shared in this workspace yet</p>
                      <p className="text-sm mt-2">Share documents from your dashboard</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-orange-500/50 transition-colors cursor-pointer"
                          onClick={() => router.push(`/summaries/${doc.summary_id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-orange-400" />
                            <div>
                              <div className="text-white font-medium">{doc.title || "Untitled"}</div>
                              <div className="text-xs text-gray-400">{doc.file_name}</div>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300 capitalize">
                            {doc.permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

