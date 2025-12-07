"use client";

import { useState, useEffect } from "react";
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
  Home
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    if (isCreating) return; // Prevent multiple submissions
    
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-300/20 border-t-slate-500 rounded-full animate-spin"></div>
          <p className="text-slate-500">Loading workspaces...</p>
        </div>
      </div>
    );
  }

  const totalMembers = members.length;
  const totalDocuments = documents.length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? "80px" : "280px" }}
        className="bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col h-full relative"
      >
        {/* User Profile Section */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress?.[0] || "U"}
            </div>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-white font-medium text-sm truncate">
                  {user?.fullName || "User"}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {user?.emailAddresses[0]?.emailAddress || ""}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Home Button */}
          <Link href="/">
            <motion.button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-300 hover:bg-slate-700/30 hover:text-slate-100 mb-2"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 text-left truncate"
                >
                  Home
                </motion.span>
              )}
            </motion.button>
          </Link>

          {!sidebarCollapsed && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-slate-700/30 border-slate-600/50 text-slate-100 placeholder:text-slate-400 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            {filteredWorkspaces.map((workspace) => (
              <motion.button
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  selectedWorkspace?.id === workspace.id
                    ? "bg-slate-600/30 text-slate-200 border border-slate-500/40"
                    : "text-slate-300 hover:bg-slate-700/30 hover:text-slate-100"
                }`}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Building2 className="w-4 h-4 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 text-left truncate"
                  >
                    {workspace.name}
                  </motion.span>
                )}
                {selectedWorkspace?.id === workspace.id && !sidebarCollapsed && (
                  <CheckCircle2 className="w-4 h-4 text-slate-300 flex-shrink-0" />
                )}
              </motion.button>
            ))}
          </div>

          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-slate-700/50"
            >
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white h-9 text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Workspace
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md p-0 gap-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:right-4 [&>button]:top-4">
                  {/* Gradient Header */}
                  <div className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-6 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">Create New Workspace</h2>
                        <p className="text-slate-200 text-sm">
                          Start collaborating with your team
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Workspace Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="e.g., Marketing Team, Engineering"
                        onKeyDown={(e) => e.key === 'Enter' && !isCreating && handleCreateWorkspace()}
                        className="h-11 border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Description <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                      </Label>
                      <Textarea
                        id="description"
                        value={workspaceDescription}
                        onChange={(e) => setWorkspaceDescription(e.target.value)}
                        placeholder="What is this workspace for?"
                        rows={3}
                        className="border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none"
                      />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button 
                        onClick={handleCreateWorkspace} 
                        className="w-full h-11 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold shadow-lg shadow-slate-500/20 hover:shadow-slate-500/30 transition-all duration-300" 
                        disabled={isCreating || !workspaceName.trim()}
                      >
                        {isCreating ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Workspace
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-gray-800">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full text-slate-400 hover:text-slate-100 hover:bg-slate-700/30"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {workspaces.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-400/20 to-slate-500/20 border border-slate-400/30 flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">No workspaces yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Create your first workspace to start collaborating with your team
              </p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workspace
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md p-0 gap-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:right-4 [&>button]:top-4">
                  {/* Gradient Header */}
                  <div className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-6 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-1">Create New Workspace</h2>
                        <p className="text-slate-200 text-sm">
                          Start collaborating with your team
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name-empty" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Workspace Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name-empty"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="e.g., Marketing Team, Engineering"
                        onKeyDown={(e) => e.key === 'Enter' && !isCreating && handleCreateWorkspace()}
                        className="h-11 border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description-empty" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                      </Label>
                      <Textarea
                        id="description-empty"
                        value={workspaceDescription}
                        onChange={(e) => setWorkspaceDescription(e.target.value)}
                        placeholder="What is this workspace for?"
                        rows={3}
                        className="border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none"
                      />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button 
                        onClick={handleCreateWorkspace} 
                        className="w-full h-11 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold shadow-lg shadow-slate-500/20 hover:shadow-slate-500/30 transition-all duration-300" 
                        disabled={isCreating || !workspaceName.trim()}
                      >
                        {isCreating ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Workspace
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ) : selectedWorkspace ? (
          <>
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {selectedWorkspace.name}
                  </h1>
                  {selectedWorkspace.role === 'owner' && (
                    <span className="px-2 py-1 rounded-full bg-slate-500/10 text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Owner
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Team Members</p>
                          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalMembers}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
                          <Users className="w-6 h-6 text-slate-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Documents</p>
                          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalDocuments}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-slate-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Workspaces</p>
                          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{workspaces.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-slate-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Quick Actions</h2>
                  <div className="flex items-center gap-2">
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md p-0 gap-0 overflow-hidden [&>button]:text-white [&>button]:hover:text-white/80 [&>button]:right-4 [&>button]:top-4">
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-6 relative">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                              <UserPlus className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold text-white mb-1">Invite Team Member</h2>
                              <p className="text-slate-200 text-sm">
                                Invite someone to join this workspace
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-5">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                              placeholder="colleague@example.com"
                              onKeyDown={(e) => e.key === 'Enter' && handleInviteMember()}
                              className="h-11 border-slate-300 dark:border-slate-700 focus:border-slate-500 focus:ring-slate-500/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                              autoFocus
                            />
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <Button 
                              onClick={handleInviteMember} 
                              className="w-full h-11 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold shadow-lg shadow-slate-500/20 hover:shadow-slate-500/30 transition-all duration-300"
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Send Invitation
                            </Button>
                          </motion.div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {selectedWorkspace.role === 'owner' && (
                      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-slate-900">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                              <AlertTriangle className="w-5 h-5" />
                              Delete Workspace
                            </DialogTitle>
                            <DialogDescription>
                              This action cannot be undone. This will permanently delete the workspace and all associated data.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                              <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                                Are you absolutely sure?
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                The workspace &quot;{selectedWorkspace.name}&quot; will be permanently deleted along with all members, documents, and activities.
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => setDeleteDialogOpen(false)}
                                disabled={isDeleting}
                                className="flex-1 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleDeleteWorkspace}
                                disabled={isDeleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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

                {/* Remove Member Dialog */}
                <Dialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
                  <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-5 h-5" />
                        Remove Member
                      </DialogTitle>
                      <DialogDescription>
                        Are you sure you want to remove this member from the workspace? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {memberToRemove && (
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white font-semibold text-sm">
                              {memberToRemove.user_name?.[0]?.toUpperCase() || memberToRemove.user_email[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {memberToRemove.user_name || memberToRemove.user_email}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{memberToRemove.user_email}</p>
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
                          className="flex-1 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleRemoveMember}
                          disabled={isRemovingMember}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          {isRemovingMember ? "Removing..." : "Remove Member"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Members Section */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-500" />
                        Team Members ({totalMembers})
                      </h3>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {members.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-600 dark:text-slate-400 mb-2">No members yet</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">Invite team members to get started</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {members.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-white font-semibold text-sm">
                                {member.user_name?.[0]?.toUpperCase() || member.user_email[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {member.user_name || member.user_email}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{member.user_email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                member.role === 'owner'
                                  ? "bg-slate-500/10 text-slate-600 dark:text-slate-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
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
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Documents Section */}
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-500" />
                      Shared Documents ({totalDocuments})
                    </h3>
                  </CardHeader>
                  <CardContent>
                    {documents.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-600 dark:text-slate-400 mb-2">No documents shared yet</p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">Share documents from your dashboard</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => router.push(`/summaries/${doc.summary_id}`)}
                            className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-400/50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-slate-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                  {doc.title || "Untitled Document"}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{doc.file_name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                {doc.permission}
                              </span>
                              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-500 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
