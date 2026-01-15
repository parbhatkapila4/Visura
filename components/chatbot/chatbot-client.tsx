"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  User,
  Plus,
  MessageSquare,
  MoreVertical,
  Trash2,
  FileText,
  Sparkles,
  ArrowUp,
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
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isSendingRef = useRef(false);
  const lastSentMessageRef = useRef<{ text: string; timestamp: number } | null>(null);

  useEffect(() => {
    console.log("ChatbotClient mounted", { pdfSummaryId, pdfStoreId, pdfTitle });
  }, [pdfSummaryId, pdfStoreId, pdfTitle]);

  useEffect(() => {
    const handler = () => {
      setCurrentSessionId(null);
    };
    window.addEventListener("chatbot-new-chat", handler);
    return () => {
      window.removeEventListener("chatbot-new-chat", handler);
    };
  }, []);

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

  const allPromptSets = [
    [
      {
        label: "Get fresh perspectives on tricky problems",
        prompt:
          "Give me fresh perspectives and insights on the key problems discussed in this document",
      },
      {
        label: "Brainstorm creative ideas",
        prompt: "Help me brainstorm creative ideas based on this document",
      },
      {
        label: "Rewrite message for maximum impact",
        prompt: "Help me rewrite the key messages from this document for maximum impact",
      },
      { label: "Summarize key points", prompt: "Summarize the key points from this document" },
    ],
    [
      {
        label: "Explain this like I'm 5",
        prompt:
          "Explain the main concepts from this document in very simple terms, like I'm 5 years old",
      },
      {
        label: "Find action items",
        prompt: "What are the actionable items or next steps mentioned in this document?",
      },
      {
        label: "Compare and contrast",
        prompt:
          "Identify and compare the different viewpoints or arguments presented in this document",
      },
      {
        label: "Create a study guide",
        prompt: "Create a comprehensive study guide based on this document",
      },
    ],
    [
      {
        label: "Generate quiz questions",
        prompt: "Generate 10 quiz questions with answers based on this document",
      },
      {
        label: "Extract key quotes",
        prompt: "Extract the most important and impactful quotes from this document",
      },
      {
        label: "Identify gaps or weaknesses",
        prompt: "What are the potential gaps, weaknesses, or missing information in this document?",
      },
      {
        label: "Create an outline",
        prompt: "Create a detailed outline of the structure and main points of this document",
      },
    ],
    [
      {
        label: "What's the main argument?",
        prompt: "What is the central argument or thesis of this document?",
      },
      {
        label: "List all definitions",
        prompt: "List and explain all key terms and definitions mentioned in this document",
      },
      {
        label: "Suggest related topics",
        prompt: "Based on this document, what related topics should I explore next?",
      },
      {
        label: "Write an executive summary",
        prompt: "Write a professional executive summary of this document",
      },
    ],
  ];

  const [promptSetIndex, setPromptSetIndex] = useState(0);

  const refreshPrompts = () => {
    setPromptSetIndex((prev) => (prev + 1) % allPromptSets.length);
  };

  const quickActions = allPromptSets[promptSetIndex];

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
      className="relative flex flex-col md:flex-row h-full w-full min-h-0 bg-[#0a0a0a] overflow-x-hidden overflow-y-auto md:overflow-y-hidden"
      style={{ height: "100%", width: "100%", minHeight: "400px" }}
    >
      <aside className="hidden md:flex md:w-52 flex-shrink-0 flex-col bg-gradient-to-b from-[#0c0c0c] to-[#080808] border-r border-[#191919] scrollbar-hide">
        <div className="p-3">
          <button
            onClick={() => setCurrentSessionId(null)}
            className="w-full h-9 rounded-lg bg-[#161616] hover:bg-[#1a1a1a] border border-[#252525] hover:border-[#333] flex items-center justify-center gap-2 text-sm font-medium text-white transition-all"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-hide">
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-emerald-400/60 rounded-full animate-bounce" />
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <MessageSquare className="w-6 h-6 text-[#333] mb-2" />
              <p className="text-xs text-[#555]">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="px-2 py-1.5 text-[10px] font-medium text-[#444] uppercase tracking-wider">
                Recent
              </p>
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={`group flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-all ${
                    currentSessionId === session.id ? "bg-[#1a1a1a]" : "hover:bg-[#141414]"
                  }`}
                >
                  <MessageSquare
                    className={`w-4 h-4 flex-shrink-0 ${
                      currentSessionId === session.id ? "text-emerald-400" : "text-[#555]"
                    }`}
                  />

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        currentSessionId === session.id ? "text-white" : "text-[#888]"
                      }`}
                    >
                      {session.session_name}
                    </p>
                    <p className="text-[10px] text-[#555]">{session.message_count} messages</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-3.5 h-3.5 text-[#555]" />
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
              ))}
            </div>
          )}
        </div>

        <div className="p-2 border-t border-[#191919]">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#111]">
            <FileText className="w-4 h-4 text-[#555] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] text-emerald-400/70 uppercase tracking-wider">
                Active Document
              </p>
              <p className="text-xs text-[#888] truncate">{pdfTitle}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col relative">
        {currentSessionId ? (
          <>
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="max-w-full md:max-w-3xl mx-auto px-4 py-6">
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
              <div className="max-w-full md:max-w-3xl mx-auto">
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
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-medium text-white">Visura</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-sm font-medium text-white/80">
                V
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-8">
              <div className="w-full max-w-3xl flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-b from-emerald-300 via-emerald-400 to-teal-600" />
                  <div className="absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-b from-emerald-300 to-teal-500 blur-xl opacity-50" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-medium text-white mb-1">Hello there</h1>
                <h2 className="text-2xl sm:text-3xl font-medium text-white mb-4">
                  Can I help you with anything?
                </h2>
                <p className="text-sm text-[#666] mb-8">
                  Choose a prompt below or write your own to start
                  <br className="hidden sm:block" /> chatting with Visura
                </p>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full mb-3">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(action.prompt)}
                      disabled={isLoading}
                      className="group px-4 py-3 rounded-xl bg-[#161616] hover:bg-[#1a1a1a] border border-[#262626] hover:border-[#333] text-left transition-all disabled:opacity-50"
                    >
                      <p className="text-sm text-[#888] group-hover:text-white transition-colors leading-snug">
                        {action.label}
                      </p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={refreshPrompts}
                  className="flex items-center gap-1.5 text-[#555] hover:text-[#888] text-xs mb-8 transition-colors group bg-transparent border-none outline-none"
                >
                  <svg
                    className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh prompts
                </button>

                <div className="w-full">
                  <div className="relative rounded-xl bg-[#161616] border border-[#262626] focus-within:border-[#404040] transition-colors">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="How can Visura help you today?"
                      rows={2}
                      className="w-full resize-none bg-transparent px-4 py-4 pr-14 text-base text-white placeholder:text-[#555] focus:outline-none"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!inputMessage.trim() || isLoading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white hover:bg-[#e5e5e5] disabled:bg-[#2a2a2a] text-black transition-all disabled:opacity-50"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 text-center text-[11px] text-[#555]">
                    <p>Visura can make mistakes. Please double-check responses.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
