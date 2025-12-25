"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Bot,
  User,
  Plus,
  MessageSquare,
  MoreVertical,
  Trash2,
  Brain,
  FileText,
  Search,
  Sparkles,
  ArrowUp,
  FileQuestion,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  message_type: "user" | "assistant";
  message_content: string;
  created_at: string;
}

interface Session {
  id: string;
  session_name: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

interface ChatbotClientProps {
  pdfSummaryId: string;
  pdfStoreId: string;
  pdfTitle: string;
}

export default function ChatbotClient({ pdfSummaryId, pdfStoreId, pdfTitle }: ChatbotClientProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isSendingRef = useRef(false);
  const lastSentMessageRef = useRef<{ text: string; timestamp: number } | null>(null);

  useEffect(() => {
    console.log("ChatbotClient mounted", { pdfSummaryId, pdfStoreId, pdfTitle });
  }, [pdfSummaryId, pdfStoreId, pdfTitle]);

  if (!pdfStoreId) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-white">Invalid document store ID</p>
        </div>
      </div>
    );
  }

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      setError(null);
      console.log("Loading sessions for pdfStoreId:", pdfStoreId);
      const response = await fetch(`/api/chatbot/sessions?pdfStoreId=${pdfStoreId}`);
      if (!response.ok) {
        throw new Error(`Failed to load sessions: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Sessions loaded:", data);
      if (response.ok) {
        setSessions(data.sessions || []);
        if (data.sessions && data.sessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(data.sessions[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
      setError(error instanceof Error ? error.message : "Failed to load chat sessions");
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        if (mounted && pdfStoreId) {
          await loadSessions();
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [pdfStoreId]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (currentSessionId && mounted) {
        await loadMessages(currentSessionId);
      } else if (mounted) {
        setMessages([]);
      }
    };
    loadData();
    return () => {
      mounted = false;
    };
  }, [currentSessionId]);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
        });
      });
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chatbot/messages?sessionId=${sessionId}`);
      const data = await response.json();
      if (response.ok) setMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const generateSessionName = (message: string): string => {
    const cleanMessage = message
      .replace(/[?!.,]/g, "")
      .trim()
      .split(" ")
      .filter((word) => word.length > 2)
      .slice(0, 4)
      .join(" ");
    return cleanMessage.length > 35
      ? cleanMessage.substring(0, 32) + "..."
      : cleanMessage || `Chat ${sessions.length + 1}`;
  };

  const createNewSession = async (firstMessage?: string): Promise<string | null> => {
    try {
      const sessionName = firstMessage
        ? generateSessionName(firstMessage)
        : `Chat ${sessions.length + 1}`;
      const response = await fetch("/api/chatbot/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfStoreId, sessionName }),
      });
      const data = await response.json();
      if (!response.ok || !data.session?.id) return null;
      setCurrentSessionId(data.session.id);
      loadSessions();
      return data.session.id;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  };

  const sendMessage = async (messageOverride?: string) => {
    const messageToSend = messageOverride || inputMessage;
    if (!messageToSend.trim() || isLoading || isSendingRef.current) return;

    const now = Date.now();
    if (
      lastSentMessageRef.current &&
      lastSentMessageRef.current.text === messageToSend.trim() &&
      now - lastSentMessageRef.current.timestamp < 1000
    )
      return;
    lastSentMessageRef.current = { text: messageToSend.trim(), timestamp: now };
    isSendingRef.current = true;

    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = await createNewSession(messageToSend);
      if (!activeSessionId) {
        isSendingRef.current = false;
        return;
      }
    }

    const messageText = messageToSend.trim();
    setInputMessage("");

    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      message_type: "user",
      message_content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, message: messageText }),
      });
      const data = await response.json();
      if (response.ok) {
        await loadMessages(activeSessionId);
        await loadSessions();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUserMessage.id));
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chatbot/sessions?sessionId=${sessionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await loadSessions();
        if (currentSessionId === sessionId) setCurrentSessionId(null);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  const quickActions = [
    {
      icon: Lightbulb,
      label: "Explain concepts",
      prompt: "Explain the main concepts from this document in simple terms",
    },
    {
      icon: ListChecks,
      label: "Key takeaways",
      prompt: "What are the key takeaways from this document?",
    },
    {
      icon: FileQuestion,
      label: "Questions",
      prompt: "Generate important questions based on this document",
    },
    {
      icon: Search,
      label: "Deep dive",
      prompt: "Do a deep analysis of the most important topics in this document",
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-full w-full p-6">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={async () => {
              setError(null);
              setIsLoadingSessions(true);
              try {
                const response = await fetch(`/api/chatbot/sessions?pdfStoreId=${pdfStoreId}`);
                if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
                const data = await response.json();
                setSessions(data.sessions || []);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load");
              } finally {
                setIsLoadingSessions(false);
              }
            }}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-[#e5e5e5] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log("ChatbotClient rendering main UI", {
    sessionsCount: sessions.length,
    currentSessionId,
    isLoadingSessions,
    error,
  });

  return (
    <div
      className="flex h-full w-full min-h-0 bg-[#0a0a0a]"
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
    >
      <aside className="w-72 flex-shrink-0 flex flex-col bg-[#0c0c0c] border-r border-[#1a1a1a]">
        <div className="p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-[#888]">Chat History</span>
          <button
            onClick={() => setCurrentSessionId(null)}
            className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-[#2a2a2a] flex items-center gap-2 text-sm text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center px-4">
              <MessageSquare className="w-8 h-8 text-[#333] mb-3" />
              <p className="text-sm text-[#555]">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={`group px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    currentSessionId === session.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-[#ccc] truncate flex-1">{session.session_name}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-[#666]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#161616] border-[#2a2a2a]">
                        <DropdownMenuItem
                          onClick={() => deleteSession(session.id)}
                          className="text-red-400 hover:text-red-400 focus:text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-[11px] text-[#555] mt-0.5">{session.message_count} messages</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[#1a1a1a]">
          <div className="px-3 py-2.5 rounded-lg bg-white/[0.03]">
            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Document</p>
            <p className="text-xs text-[#888] truncate">{pdfTitle}</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col relative">
        {currentSessionId ? (
          <>
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
                        <Bot className="w-8 h-8 text-white/60" />
                      </div>
                      <p className="text-white text-lg font-medium mb-2">Start the conversation</p>
                      <p className="text-[#666] text-sm max-w-sm">
                        Ask anything about <span className="text-[#888]">"{pdfTitle}"</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <div key={message.id} className="flex gap-4">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            message.message_type === "user"
                              ? "bg-white"
                              : "bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a]"
                          }`}
                        >
                          {message.message_type === "user" ? (
                            <User className="w-4 h-4 text-black" />
                          ) : (
                            <Sparkles className="w-4 h-4 text-white/70" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-[11px] text-[#555] mb-1.5 uppercase tracking-wider">
                            {message.message_type === "user" ? "You" : "AI Assistant"}
                          </p>
                          {message.message_type === "assistant" ? (
                            <div className="prose prose-sm max-w-none prose-invert">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <p className="mb-3 last:mb-0 text-[#ccc] text-[15px] leading-relaxed">
                                      {children}
                                    </p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc pl-5 mb-3 space-y-1.5 text-[#ccc]">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-[#ccc]">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="text-[#ccc] text-[15px]">{children}</li>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-white">{children}</strong>
                                  ),
                                  code: ({ children }) => (
                                    <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-sm font-mono text-emerald-400">
                                      {children}
                                    </code>
                                  ),
                                  pre: ({ children }) => (
                                    <pre className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-4 overflow-x-auto my-3">
                                      {children}
                                    </pre>
                                  ),
                                }}
                              >
                                {message.message_content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-[15px] text-white leading-relaxed">
                              {message.message_content}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white/70" />
                        </div>
                        <div className="flex-1 pt-1">
                          <p className="text-[11px] text-[#555] mb-1.5 uppercase tracking-wider">
                            AI Assistant
                          </p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:0.2s]" />
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#1a1a1a]">
              <div className="max-w-3xl mx-auto">
                <div className="relative bg-[#111] border border-[#2a2a2a] rounded-xl focus-within:border-[#404040] transition-colors">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your document..."
                    disabled={isLoading}
                    rows={1}
                    className="w-full px-4 py-3.5 pr-14 bg-transparent text-white text-[15px] placeholder:text-[#555] focus:outline-none resize-none disabled:opacity-50"
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-[#e5e5e5] disabled:bg-[#2a2a2a] rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                  >
                    <ArrowUp className="w-5 h-5 text-black" />
                  </button>
                </div>
                <p className="text-center text-[11px] text-[#444] mt-3">
                  AI can make mistakes. Consider checking important information.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/20 mb-6">
                  <Bot className="w-10 h-10 text-emerald-400" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-3 tracking-tight">
                  Chat with your document
                </h1>
                <p className="text-[#666] text-lg">
                  Ask questions, get insights, and explore your content
                </p>
              </div>

              <div className="relative bg-[#111] border border-[#2a2a2a] rounded-xl focus-within:border-[#404040] transition-colors mb-8">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What would you like to know?"
                  rows={1}
                  className="w-full px-5 py-4 pr-14 bg-transparent text-white text-base placeholder:text-[#555] focus:outline-none resize-none"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-[#e5e5e5] disabled:bg-[#2a2a2a] rounded-lg flex items-center justify-center transition-all disabled:opacity-50"
                >
                  <ArrowUp className="w-5 h-5 text-black" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(action.prompt)}
                    disabled={isLoading}
                    className="group p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-[#1f1f1f] hover:border-[#2a2a2a] text-left transition-all disabled:opacity-50"
                  >
                    <action.icon className="w-5 h-5 text-[#555] group-hover:text-[#888] mb-2 transition-colors" />
                    <p className="text-sm text-[#888] group-hover:text-white transition-colors">
                      {action.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
