"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Users,
  FileText,
  UserPlus,
  Sparkles,
  ArrowRight,
  Clock,
  Crown,
  CheckCircle2,
  Search,
  TrendingUp,
  Activity,
  Zap,
  Trash2,
  AlertTriangle,
  Settings,
  ChevronRight,
  Mail,
  Bell,
  LayoutGrid,
  List,
  Calendar,
  BarChart3,
  Share2,
  X,
  Home,
  MoreVertical,
  Menu,
  ChevronDown,
  MessageCircle,
  FolderOpen,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useUser } from "@clerk/nextjs";
import WorkspaceChat from "./workspace-chat";

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
  const { user } = useUser();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemovingMember, setIsRemovingMember] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
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
      const membersResponse = await fetch(`/api/workspaces/members?workspaceId=${workspaceId}`);
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setMembers(membersData);
      }

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
    if (isCreating) return;

    if (!workspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setIsCreating(true);
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
    } finally {
      setIsCreating(false);
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

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workspaces?workspaceId=${selectedWorkspace.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Workspace deleted successfully!");
        setDeleteDialogOpen(false);

        const updatedWorkspaces = workspaces.filter((w) => w.id !== selectedWorkspace.id);
        setWorkspaces(updatedWorkspaces);

        if (updatedWorkspaces.length > 0) {
          setSelectedWorkspace(updatedWorkspaces[0]);
        } else {
          setSelectedWorkspace(null);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete workspace");
      }
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast.error("Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedWorkspace || !memberToRemove) return;

    setIsRemovingMember(true);
    try {
      const response = await fetch(
        `/api/workspaces/members?workspaceId=${selectedWorkspace.id}&memberId=${memberToRemove.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Member removed successfully!");
        setRemoveMemberDialogOpen(false);
        setMemberToRemove(null);
        fetchWorkspaceDetails(selectedWorkspace.id);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    } finally {
      setIsRemovingMember(false);
    }
  };

  const filteredWorkspaces = workspaces.filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = members.length;
  const totalDocuments = documents.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030303]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-white/10 border-t-white/60 rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-white/40 text-sm">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#030303] flex min-h-screen w-full overflow-hidden md:fixed md:inset-0 md:h-screen md:w-screen md:z-50">
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-0"
        } flex-shrink-0 border-r border-white/[0.06] bg-[#0a0a0a] transition-all duration-300 overflow-hidden`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Workspaces</span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/5 border border-white/[0.06] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
            />
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors mb-4">
                <Plus className="w-4 h-4" />
                New Workspace
              </button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border border-white/10 max-w-md p-0 overflow-hidden">
              <div className="p-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Create Workspace</h2>
                    <p className="text-sm text-white/40">Set up a new team space</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label className="text-sm font-medium text-white/60 mb-2 block">Name *</Label>
                  <Input
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Marketing Team"
                    onKeyDown={(e) => e.key === "Enter" && !isCreating && handleCreateWorkspace()}
                    className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-white/60 mb-2 block">
                    Description
                  </Label>
                  <Textarea
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    placeholder="What's this workspace for?"
                    rows={3}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setCreateDialogOpen(false)}
                    className="flex-1 h-11 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateWorkspace}
                    disabled={isCreating || !workspaceName.trim()}
                    className="flex-1 h-11 bg-white text-black hover:bg-white/90 font-semibold rounded-xl"
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider px-2 mb-2">
              Your Workspaces
            </p>
            {filteredWorkspaces.length === 0 ? (
              <p className="text-sm text-white/30 px-2">No workspaces found</p>
            ) : (
              filteredWorkspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => setSelectedWorkspace(workspace)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    selectedWorkspace?.id === workspace.id
                      ? "bg-white/10 border border-white/10"
                      : "hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedWorkspace?.id === workspace.id
                        ? "bg-gradient-to-br from-violet-500 to-purple-600"
                        : "bg-white/10"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{workspace.name}</p>
                    <p className="text-xs text-white/40 truncate">
                      {workspace.description || "No description"}
                    </p>
                  </div>
                  {workspace.role === "owner" && (
                    <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-white/[0.06] space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Home</span>
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col h-full max-h-full">
        <header className="border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
              >
                <Menu className="w-4 h-4" />
              </button>
              {selectedWorkspace && (
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white">{selectedWorkspace.name}</h1>
                  {selectedWorkspace.role === "owner" && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase">
                      Owner
                    </span>
                  )}
                </div>
              )}
            </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap md:flex-nowrap justify-start md:justify-end">
            {selectedWorkspace && (
              <>
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/[0.06] text-white text-sm font-medium transition-all">
                      <UserPlus className="w-4 h-4" />
                      Invite
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0a0a0a] border border-white/10 max-w-md p-0 overflow-hidden">
                    <div className="p-6 border-b border-white/[0.06]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                          <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Invite Member</h2>
                          <p className="text-sm text-white/40">
                            Add someone to {selectedWorkspace.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-white/60 mb-2 block">
                          Email Address *
                        </Label>
                        <Input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="colleague@company.com"
                          onKeyDown={(e) => e.key === "Enter" && handleInviteMember()}
                          className="h-11 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
                        />
                      </div>
                      <Button
                        onClick={handleInviteMember}
                        className="w-full h-11 bg-white text-black hover:bg-white/90 font-semibold rounded-xl"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Invitation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {selectedWorkspace.role === "owner" && (
                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0a0a0a] border border-white/10 max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-red-400 text-xl font-bold">
                          <AlertTriangle className="w-6 h-6" />
                          Delete Workspace
                        </DialogTitle>
                        <DialogDescription className="text-white/50 mt-2">
                          This action cannot be undone. All data will be permanently deleted.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-white font-medium">
                            Workspace: {selectedWorkspace.name}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="ghost"
                            onClick={() => setDeleteDialogOpen(false)}
                            disabled={isDeleting}
                            className="flex-1 h-11 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleDeleteWorkspace}
                            disabled={isDeleting}
                            className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl"
                          >
                            {isDeleting ? "Deleting..." : "Delete Forever"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || "U"}
            </div>
          </div>
        </div>
        </header>

        <div
          className="h-[calc(100vh-64px)] overflow-y-auto p-6 overflow-x-hidden scrollbar-hide"
          style={{ maxHeight: "calc(100vh - 64px)", height: "calc(100vh - 64px)" }}
          onWheel={(e) => e.stopPropagation()}
          onScroll={(e) => e.stopPropagation()}
        >
          {workspaces.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-violet-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No workspaces yet</h2>
                <p className="text-white/40 mb-6">
                  Create your first workspace to start collaborating with your team.
                </p>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors">
                      <Plus className="w-5 h-5" />
                      Create Workspace
                    </button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          ) : selectedWorkspace ? (
            <div
              className="max-w-[1400px] mx-auto space-y-6 pb-6"
              style={{ maxHeight: "calc(100vh - 64px)" }}
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950/50 via-[#0a0a0a] to-purple-950/30 border border-violet-500/10">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl" />

                <div className="relative p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/25 flex-shrink-0">
                        <Building2 className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h1 className="text-2xl lg:text-3xl font-bold text-white">
                            {selectedWorkspace.name}
                          </h1>
                          {selectedWorkspace.role === "owner" && (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 flex items-center gap-1.5">
                              <Crown className="w-3 h-3" />
                              Owner
                            </span>
                          )}
                        </div>
                        {selectedWorkspace.description && (
                          <p className="text-white/50 text-sm mb-3">
                            {selectedWorkspace.description}
                          </p>
                        )}
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-2 text-sm">
                          <div className="flex items-center gap-1.5 text-white/40">
                            <Users className="w-4 h-4" />
                            <span>{totalMembers} members</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/40">
                            <FileText className="w-4 h-4" />
                            <span>{totalDocuments} documents</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-white/40">
                            <Clock className="w-4 h-4" />
                            <span>
                              Created {new Date(selectedWorkspace.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-950/40 via-[#0a0a0a] to-[#080808] border border-blue-500/10 p-5">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-1">
                      Team Members
                    </p>
                    <p className="text-3xl font-bold text-white">{totalMembers}</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#0a0a0a] to-[#080808] border border-emerald-500/10 p-5">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-1">
                      Documents
                    </p>
                    <p className="text-3xl font-bold text-white">{totalDocuments}</p>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-950/40 via-[#0a0a0a] to-[#080808] border border-orange-500/10 p-5">
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-1">
                      Workspaces
                    </p>
                    <p className="text-3xl font-bold text-white">{workspaces.length}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[#0a0a0a] rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="p-5 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">Team Members</h3>
                          <p className="text-xs text-white/40">{totalMembers} people</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setInviteDialogOpen(true)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {members.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-white/20" />
                        </div>
                        <p className="text-sm text-white/40">No members yet</p>
                        <p className="text-xs text-white/20">Invite your team to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center text-white font-semibold text-sm">
                                {member.user_name?.[0]?.toUpperCase() ||
                                  member.user_email[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {member.user_name || member.user_email.split("@")[0]}
                                </p>
                                <p className="text-xs text-white/40">{member.user_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {member.role === "owner" ? (
                                <Crown className="w-4 h-4 text-amber-400" />
                              ) : (
                                <span className="text-xs text-white/40 capitalize">
                                  {member.role}
                                </span>
                              )}
                              {selectedWorkspace?.role === "owner" && member.role !== "owner" && (
                                <button
                                  onClick={() => {
                                    setMemberToRemove(member);
                                    setRemoveMemberDialogOpen(true);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-transparent hover:bg-red-500/10 flex items-center justify-center text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-xl border border-white/[0.06] overflow-hidden">
                  <div className="p-5 border-b border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">Shared Documents</h3>
                          <p className="text-xs text-white/40">{totalDocuments} files</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {documents.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                          <FolderOpen className="w-6 h-6 text-white/20" />
                        </div>
                        <p className="text-sm text-white/40">No documents shared</p>
                        <p className="text-xs text-white/20">Share from your dashboard</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <button
                            key={doc.id}
                            onClick={() => router.push(`/summaries/${doc.summary_id}`)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all group text-left"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {doc.title || "Untitled"}
                                </p>
                                <p className="text-xs text-white/40 truncate">{doc.file_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/40 font-medium capitalize">
                                {doc.permission}
                              </span>
                              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-xl border border-white/[0.06] overflow-hidden h-[500px] flex flex-col max-h-[500px]">
                  {selectedWorkspace && <WorkspaceChat workspaceId={selectedWorkspace.id} />}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-white/40">Select a workspace to view details</p>
            </div>
          )}
        </div>
      </main>

      <Dialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-red-400 text-xl font-bold">
              <AlertTriangle className="w-6 h-6" />
              Remove Member
            </DialogTitle>
            <DialogDescription className="text-white/50 mt-2">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {memberToRemove && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold">
                    {memberToRemove.user_name?.[0]?.toUpperCase() ||
                      memberToRemove.user_email[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {memberToRemove.user_name || memberToRemove.user_email}
                    </p>
                    <p className="text-xs text-white/40">{memberToRemove.user_email}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setRemoveMemberDialogOpen(false);
                  setMemberToRemove(null);
                }}
                disabled={isRemovingMember}
                className="flex-1 h-11 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemoveMember}
                disabled={isRemovingMember}
                className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl"
              >
                {isRemovingMember ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
