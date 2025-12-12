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
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const router = useRouter();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceDetails(selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

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
        
        const updatedWorkspaces = workspaces.filter(w => w.id !== selectedWorkspace.id);
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

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/60 text-sm font-medium">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  const totalMembers = members.length;
  const totalDocuments = documents.length;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-[#0f0f0f] border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Navigation */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Workspaces</span>
              </Link>
              
              {/* Workspace Selector Dropdown */}
              {workspaces.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Select Workspace</span>
                    <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                      {filteredWorkspaces.map((workspace) => (
                        <button
                          key={workspace.id}
                          onClick={() => {
                            setSelectedWorkspace(workspace);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${
                            selectedWorkspace?.id === workspace.id ? 'bg-white/10' : ''
                          }`}
                        >
                          <Building2 className="w-4 h-4 text-white/60" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{workspace.name}</p>
                            {workspace.description && (
                              <p className="text-white/40 text-xs truncate">{workspace.description}</p>
                            )}
                          </div>
                          {workspace.role === 'owner' && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
                          {selectedWorkspace?.id === workspace.id && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Center: Home Button */}
            <div className="flex items-center">
              <Link href="/">
                <Button className="bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl h-9 px-4">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>

            {/* Right: Actions & User */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm rounded-lg"
                />
              </div>

              {/* Create Button */}
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white text-black hover:bg-white/90 font-semibold h-9 px-4 rounded-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    New Workspace
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0f0f0f] border-0 max-w-md p-0 gap-0 overflow-hidden shadow-none [&>button]:hidden">
                  <div className="relative">
                    {/* Decorative top accent */}
                    <div className="h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    <div className="p-8 space-y-6">
                      {/* Inline title with icon */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h2 className="text-xl font-bold text-white mb-1">New Workspace</h2>
                          <p className="text-sm text-white/50">Create a space for your team</p>
                        </div>
                        <button
                          onClick={() => setCreateDialogOpen(false)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Form fields with modern styling */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium text-white/80 mb-2 block">
                            Name <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            placeholder="Enter workspace name"
                            onKeyDown={(e) => e.key === 'Enter' && !isCreating && handleCreateWorkspace()}
                            className="h-11 border-0 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/25 rounded-xl text-sm transition-all"
                            autoFocus
                          />
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-sm font-medium text-white/80 mb-2 block">
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={workspaceDescription}
                            onChange={(e) => setWorkspaceDescription(e.target.value)}
                            placeholder="Add a description (optional)"
                            rows={3}
                            className="border-0 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/25 rounded-xl resize-none text-sm transition-all"
                          />
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          variant="ghost"
                          onClick={() => setCreateDialogOpen(false)}
                          className="flex-1 h-10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateWorkspace} 
                          className="flex-1 h-10 bg-white text-black hover:bg-white/90 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed" 
                          disabled={isCreating || !workspaceName.trim()}
                        >
                          {isCreating ? (
                            <>
                              <motion.div
                                className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Create
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* User Avatar */}
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || "U"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Dashboard Style */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {workspaces.length === 0 ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="text-center max-w-md">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8"
              >
                <Building2 className="w-12 h-12 text-white/40" />
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-3">No workspaces yet</h3>
              <p className="text-white/50 text-base mb-8">
                Create your first workspace to start collaborating
              </p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    className="bg-white text-black hover:bg-white/90 font-bold px-8 py-4 rounded-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5 mr-2 inline" />
                    Create Workspace
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="bg-[#0f0f0f] border-0 max-w-md p-0 gap-0 overflow-hidden shadow-none [&>button]:hidden">
                  <div className="relative">
                    {/* Decorative top accent */}
                    <div className="h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    <div className="p-8 space-y-6">
                      {/* Inline title with icon */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 pt-1">
                          <h2 className="text-xl font-bold text-white mb-1">New Workspace</h2>
                          <p className="text-sm text-white/50">Create a space for your team</p>
                        </div>
                        <button
                          onClick={() => setCreateDialogOpen(false)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Form fields with modern styling */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name-empty" className="text-sm font-medium text-white/80 mb-2 block">
                            Name <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="name-empty"
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            placeholder="Enter workspace name"
                            onKeyDown={(e) => e.key === 'Enter' && !isCreating && handleCreateWorkspace()}
                            className="h-11 border-0 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/25 rounded-xl text-sm transition-all"
                            autoFocus
                          />
                        </div>
                        <div>
                          <Label htmlFor="description-empty" className="text-sm font-medium text-white/80 mb-2 block">
                            Description
                          </Label>
                          <Textarea
                            id="description-empty"
                            value={workspaceDescription}
                            onChange={(e) => setWorkspaceDescription(e.target.value)}
                            placeholder="Add a description (optional)"
                            rows={3}
                            className="border-0 bg-white/5 focus:bg-white/10 focus:ring-2 focus:ring-white/20 text-white placeholder:text-white/25 rounded-xl resize-none text-sm transition-all"
                          />
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          variant="ghost"
                          onClick={() => setCreateDialogOpen(false)}
                          className="flex-1 h-10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateWorkspace} 
                          className="flex-1 h-10 bg-white text-black hover:bg-white/90 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed" 
                          disabled={isCreating || !workspaceName.trim()}
                        >
                          {isCreating ? (
                            <>
                              <motion.div
                                className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Create
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : selectedWorkspace ? (
          <div className="space-y-8">
            {/* Workspace Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white/80" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">
                        {selectedWorkspace.name}
                      </h1>
                      {selectedWorkspace.role === 'owner' && (
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10">
                          <Crown className="w-3.5 h-3.5 text-yellow-400" />
                          Owner
                        </span>
                      )}
                    </div>
                    {selectedWorkspace.description && (
                      <p className="text-white/50 text-sm mb-4">{selectedWorkspace.description}</p>
                    )}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/60">{totalMembers} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/60">{totalDocuments} documents</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl h-10 px-4">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0f0f0f] border-white/10 max-w-md p-0 gap-0 overflow-hidden [&>button]:text-white/60 [&>button]:hover:text-white [&>button]:right-4 [&>button]:top-4">
                      <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 border-b border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                            <UserPlus className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Invite Member</h2>
                            <p className="text-white/50 text-sm">Add someone to this workspace</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-8 space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-sm font-semibold text-white/90">
                            Email Address <span className="text-red-400">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            onKeyDown={(e) => e.key === 'Enter' && handleInviteMember()}
                            className="h-12 border-white/10 bg-white/5 focus:border-white/20 text-white placeholder:text-white/30 rounded-xl"
                            autoFocus
                          />
                        </div>
                        <Button 
                          onClick={handleInviteMember} 
                          className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-xl"
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Send Invitation
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {selectedWorkspace.role === 'owner' && (
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-xl h-10 px-4">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#0f0f0f] border-white/10">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-3 text-red-400 text-xl font-bold">
                            <AlertTriangle className="w-6 h-6" />
                            Delete Workspace
                          </DialogTitle>
                          <DialogDescription className="text-white/50 mt-2">
                            This action cannot be undone. This will permanently delete the workspace and all associated data.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-6">
                          <div className="p-5 rounded-xl bg-red-500/5 border border-red-500/20">
                            <p className="text-sm text-white font-semibold mb-2">Are you absolutely sure?</p>
                            <p className="text-sm text-white/50">
                              The workspace &quot;{selectedWorkspace.name}&quot; will be permanently deleted.
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setDeleteDialogOpen(false)}
                              disabled={isDeleting}
                              className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl h-11"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleDeleteWorkspace}
                              disabled={isDeleting}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-semibold"
                            >
                              {isDeleting ? "Deleting..." : "Delete Forever"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f0f] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-white/70" />
                  </div>
                </div>
                <p className="text-white/40 text-xs font-medium mb-1 uppercase tracking-wider">Team Members</p>
                <p className="text-4xl font-bold text-white">{totalMembers}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#0f0f0f] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white/70" />
                  </div>
                </div>
                <p className="text-white/40 text-xs font-medium mb-1 uppercase tracking-wider">Documents</p>
                <p className="text-4xl font-bold text-white">{totalDocuments}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0f0f0f] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white/70" />
                  </div>
                </div>
                <p className="text-white/40 text-xs font-medium mb-1 uppercase tracking-wider">Workspaces</p>
                <p className="text-4xl font-bold text-white">{workspaces.length}</p>
              </motion.div>
            </div>

            {/* Three Column Layout - Members, Documents, Chat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Members Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Team Members</h3>
                        <p className="text-xs text-white/40">{totalMembers} total</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {members.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-white/30" />
                      </div>
                      <p className="text-white/50 text-sm mb-1">No members yet</p>
                      <p className="text-xs text-white/30">Invite team members to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {members.map((member) => (
                        <motion.div
                          key={member.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {member.user_name?.[0]?.toUpperCase() || member.user_email[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white text-sm truncate">
                                {member.user_name || member.user_email}
                              </p>
                              <p className="text-xs text-white/40 truncate">{member.user_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              member.role === 'owner'
                                ? "bg-white/10 text-white border border-white/20"
                                : "bg-white/5 text-white/60 border border-white/10"
                            }`}>
                              {member.role}
                            </span>
                            {selectedWorkspace?.role === 'owner' && member.role !== 'owner' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setMemberToRemove(member);
                                  setRemoveMemberDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Documents Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Shared Documents</h3>
                        <p className="text-xs text-white/40">{totalDocuments} total</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  {documents.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-white/30" />
                      </div>
                      <p className="text-white/50 text-sm mb-1">No documents shared yet</p>
                      <p className="text-xs text-white/30">Share documents from your dashboard</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => router.push(`/summaries/${doc.summary_id}`)}
                          className="flex items-center justify-between p-4 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                              <FileText className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white text-sm truncate">
                                {doc.title || "Untitled Document"}
                              </p>
                              <p className="text-xs text-white/40 truncate">{doc.file_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 font-semibold">
                              {doc.permission}
                            </span>
                            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Chat Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden lg:col-span-2 xl:col-span-1"
                style={{ minHeight: "500px" }}
              >
                {selectedWorkspace && (
                  <WorkspaceChat workspaceId={selectedWorkspace.id} />
                )}
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-white/50 text-lg">Select a workspace to view details</p>
            </div>
          </div>
        )}

        {/* Remove Member Dialog */}
        <Dialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
          <DialogContent className="bg-[#0f0f0f] border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-red-400 text-xl font-bold">
                <AlertTriangle className="w-6 h-6" />
                Remove Member
              </DialogTitle>
              <DialogDescription className="text-white/50 mt-2">
                Are you sure you want to remove this member? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-6">
              {memberToRemove && (
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-lg">
                      {memberToRemove.user_name?.[0]?.toUpperCase() || memberToRemove.user_email[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {memberToRemove.user_name || memberToRemove.user_email}
                      </p>
                      <p className="text-sm text-white/50">{memberToRemove.user_email}</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRemoveMemberDialogOpen(false);
                    setMemberToRemove(null);
                  }}
                  disabled={isRemovingMember}
                  className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRemoveMember}
                  disabled={isRemovingMember}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 font-semibold"
                >
                  {isRemovingMember ? "Removing..." : "Remove Member"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
