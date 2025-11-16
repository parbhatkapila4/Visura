"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Bot,
  User,
  Plus,
  MessageSquare,
  MoreVertical,
  Trash2,
  ScanSearch,
  Brain,
  FileText,
  Search,
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

export default function ChatbotClient({
  pdfSummaryId,
  pdfStoreId,
  pdfTitle,
}: ChatbotClientProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);
  const lastSentMessageRef = useRef<{text: string, timestamp: number} | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) {
        await loadSessions();
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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await fetch(
        `/api/chatbot/sessions?pdfStoreId=${pdfStoreId}`
      );
      const data = await response.json();

      if (response.ok) {
        setSessions(data.sessions);

        if (data.sessions.length > 0 && !currentSessionId) {
          setCurrentSessionId(data.sessions[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/chatbot/messages?sessionId=${sessionId}`
      );
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages || []);
      } else {
        console.error("Error loading messages:", data);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const generateSessionName = (message: string): string => {
    // Extract meaningful words, limit length
    const cleanMessage = message
      .replace(/[?!.,]/g, '')
      .trim()
      .split(' ')
      .filter(word => word.length > 2) // Skip short words like "me", "my", "the"
      .slice(0, 4) // Take first 4 meaningful words
      .join(' ');
    
    // Limit to 35 characters
    return cleanMessage.length > 35 
      ? cleanMessage.substring(0, 32) + '...' 
      : cleanMessage || `Chat ${sessions.length + 1}`;
  };

  const createNewSession = async (firstMessage?: string): Promise<string | null> => {
    try {
      const sessionName = firstMessage 
        ? generateSessionName(firstMessage)
        : `Chat ${sessions.length + 1}`;
        
      const response = await fetch("/api/chatbot/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfStoreId,
          sessionName: sessionName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.session?.id) {
        console.error("Error creating session:", data);
        return null;
      }

      const newSessionId: string = data.session.id;
      setCurrentSessionId(newSessionId);

      // refresh sessions list but don't block the return
      loadSessions();

      return newSessionId;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  };

  const sendMessage = async (messageOverride?: string) => {
    const messageToSend = messageOverride || inputMessage;
    if (!messageToSend.trim() || isLoading || isSendingRef.current) return;

    const now = Date.now();
    if (lastSentMessageRef.current && 
        lastSentMessageRef.current.text === messageToSend.trim() && 
        now - lastSentMessageRef.current.timestamp < 1000) {
      console.log("Blocking duplicate message send");
      return;
    }

    lastSentMessageRef.current = { text: messageToSend.trim(), timestamp: now };
    
    // Prevent duplicate sends
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
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: messageText,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Always refresh messages from the server to avoid any duplication,
        // especially for the first message in a new session.
        await loadMessages(activeSessionId);
        // Refresh sessions list (message counts, timestamps, etc.)
        await loadSessions();
      } else {
        console.error("API Error:", data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/chatbot/sessions?sessionId=${sessionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await loadSessions();
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-2 sm:gap-3 md:gap-4 lg:gap-6">
      {/* Left Sidebar - Chat Sessions */}
      <div className="w-full lg:w-80 h-48 lg:h-full flex-shrink-0">
        <div className="h-full bg-gradient-to-br from-black via-gray-900 to-black rounded-xl sm:rounded-2xl lg:rounded-3xl border border-orange-500/20 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden relative">
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl lg:rounded-3xl pointer-events-none"></div>
          {/* Orange glow accent */}
          <div className="absolute inset-0 rounded-2xl lg:rounded-3xl pointer-events-none" style={{
            background: 'radial-gradient(circle at top left, rgba(249, 115, 22, 0.1) 0%, transparent 50%)'
          }}></div>
          
          {/* Header */}
          <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-5 border-b border-orange-500/20 flex items-center justify-between backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/50">
                <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">Chat Sessions</h3>
            </div>
            <Button
              size="sm"
              onClick={() => createNewSession()}
              className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 rounded-lg sm:rounded-xl shadow-lg shadow-orange-500/30 transition-all"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
            </Button>
          </div>

          {/* Sessions List */}
          <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-2 sm:p-3">
            {isLoadingSessions ? (
              <div className="flex items-center justify-center py-6 sm:py-8 md:py-12">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-orange-500/30 border-t-orange-500"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-6 sm:py-8 md:py-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-3 sm:mb-4 md:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-black/40 flex items-center justify-center shadow-lg border border-orange-500/20">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-orange-500" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-200 uppercase tracking-[0.25em] sm:tracking-[0.35em]">No chats yet</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-orange-500/30 bg-orange-500/10 tracking-wide">
                  <span className="inline-flex h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                  Click + and start
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl cursor-pointer transition-all backdrop-blur-sm ${
                      currentSessionId === session.id
                        ? "bg-gradient-to-r from-orange-500/20 via-orange-600/10 to-orange-500/20 border border-orange-500/50 shadow-lg shadow-orange-500/20"
                        : "bg-gradient-to-r from-gray-800/50 via-black/30 to-gray-800/50 border border-gray-700/30 hover:from-orange-500/10 hover:via-gray-800/40 hover:to-orange-500/10 hover:border-orange-500/30 hover:shadow-md"
                    }`}
                    onClick={() => setCurrentSessionId(session.id)}
                  >
                    <div className="flex items-start justify-between gap-1.5 sm:gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-white truncate mb-0.5 sm:mb-1">
                          {session.session_name}
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs bg-gradient-to-r from-orange-500/30 via-orange-600/20 to-orange-500/30 text-white border border-orange-500/40 backdrop-blur-sm px-1.5 sm:px-2 py-0 sm:py-0.5">
                            {session.message_count} msgs
                          </Badge>
                          <span className="text-[10px] sm:text-xs text-gray-400">
                            {new Date(session.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0 bg-transparent hover:bg-orange-500/20 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border border-gray-700 rounded-lg sm:rounded-xl p-1.5 sm:p-2">
                          <DropdownMenuItem
                            onClick={() => deleteSession(session.id)}
                            className="text-red-400 hover:bg-red-500/20 rounded-md sm:rounded-lg text-xs sm:text-sm"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Main Chat Area */}
      <div className="flex-1 min-w-0 min-h-0">
        <div className="h-full bg-gradient-to-br from-black via-gray-900 to-black rounded-xl sm:rounded-2xl lg:rounded-3xl border border-orange-500/20 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden relative">
          {/* Radial gradient overlay for depth */}
          <div className="absolute inset-0 rounded-2xl lg:rounded-3xl pointer-events-none" style={{
            background: 'radial-gradient(circle at center, rgba(249, 115, 22, 0.08) 0%, transparent 70%)'
          }}></div>
          {/* Glossy top shine */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/10 via-white/5 to-transparent rounded-t-2xl lg:rounded-t-3xl pointer-events-none"></div>
          {/* Orange accent glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          {currentSessionId ? (
            <>
              {/* Chat Header */}
              <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-5 border-b border-orange-500/20 flex items-center gap-2 sm:gap-3 backdrop-blur-sm flex-shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/50">
                  <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">{currentSession?.session_name}</h3>
                </div>
              </div>

              {/* Messages Area */}
              <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-5">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center px-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-black/40 flex items-center justify-center shadow-lg border border-orange-500/20">
                        <Bot className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-500" />
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-1.5 sm:mb-2">Start a conversation</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Ask questions about: <span className="text-orange-500 font-medium">"{pdfTitle}"</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 sm:gap-3 md:gap-4 ${
                          message.message_type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-2 sm:gap-2.5 md:gap-3 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] ${
                            message.message_type === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                            message.message_type === "user"
                              ? "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 shadow-orange-500/30"
                              : "bg-gradient-to-br from-gray-800/80 to-black/60 backdrop-blur-sm border border-gray-700/50"
                          }`}>
                            {message.message_type === "user" ? (
                              <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
                            )}
                          </div>
                          <div className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg backdrop-blur-sm ${
                            message.message_type === "user"
                              ? "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 text-white shadow-orange-500/20"
                              : "bg-gradient-to-br from-gray-800/80 via-gray-900/60 to-black/80 text-gray-200 border border-gray-700/50"
                          }`}>
                            {message.message_type === "assistant" ? (
                              <div className="prose prose-sm max-w-none prose-invert">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-1.5 sm:mb-2 last:mb-0 text-gray-200 text-xs sm:text-sm leading-relaxed">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-3 sm:pl-4 mb-1.5 sm:mb-2 space-y-0.5 sm:space-y-1 text-gray-200">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-3 sm:pl-4 mb-1.5 sm:mb-2 space-y-0.5 sm:space-y-1 text-gray-200">{children}</ol>,
                                    li: ({ children }) => <li className="leading-relaxed text-gray-200 text-xs sm:text-sm">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-white text-xs sm:text-sm">{children}</strong>,
                                    code: ({ children }) => (
                                      <code className="bg-black/60 px-1 sm:px-1.5 py-0.5 rounded text-[11px] sm:text-sm font-mono text-orange-400 border border-orange-500/20 break-all">
                                        {children}
                                      </code>
                                    ),
                                  }}
                                >
                                  {message.message_content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap text-white text-xs sm:text-sm break-words">{message.message_content}</p>
                            )}
                            <p className={`text-[10px] sm:text-xs mt-1.5 sm:mt-2 ${
                              message.message_type === "user" ? "text-white/70" : "text-gray-400"
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2 sm:gap-2.5 md:gap-3 justify-start">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-800/80 to-black/60 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center shadow-lg">
                          <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
                        </div>
                        <div className="bg-gradient-to-br from-gray-800/80 via-gray-900/60 to-black/80 backdrop-blur-sm border border-gray-700/50 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-lg">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-orange-500/30 border-t-orange-500"></div>
                            <span className="text-gray-300 text-xs sm:text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="relative z-10 p-2 sm:p-3 md:p-4 lg:p-5 border-t border-orange-500/20 backdrop-blur-sm flex-shrink-0">
                <div className="flex gap-2 sm:gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask a question about your document..."
                      disabled={isLoading}
                      className="w-full h-10 sm:h-11 md:h-12 px-3 sm:px-4 bg-gradient-to-r from-gray-800/60 via-black/40 to-gray-800/60 border border-gray-700/50 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm placeholder:text-gray-400 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm shadow-lg"
                    />
                  </div>
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 p-0 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 rounded-lg sm:rounded-xl disabled:opacity-50 shadow-lg shadow-orange-500/30 transition-all flex-shrink-0"
                  >
                    <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-white" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Welcome State */
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 min-h-0 overflow-y-auto">
              <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                {/* Welcome Message */}
                <div className="space-y-1 sm:space-y-2 md:space-y-3">
                  <p className="text-xs sm:text-sm md:text-base text-gray-400">Welcome back</p>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight px-4">
                    How can I <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-clip-text text-transparent">assist</span> you today?
                  </h2>
                </div>

                {/* Input Area with Enhanced UI */}
                <div className="relative w-full bg-gradient-to-br from-gray-900/90 via-black/70 to-gray-900/90 backdrop-blur-2xl border border-orange-500/30 sm:border-2 sm:border-orange-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-[0_20px_60px_-15px_rgba(249,115,22,0.4)] sm:shadow-[0_30px_80px_-20px_rgba(249,115,22,0.5)] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 sm:from-white/15 via-transparent to-transparent rounded-2xl sm:rounded-3xl pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-orange-500/15 sm:bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-amber-500/10 sm:bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                    {/* Input Row */}
                    <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                      {/* AI Icon Button */}
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 shadow-xl sm:shadow-2xl shadow-orange-500/40 sm:shadow-orange-500/50 border border-orange-400/30 hover:scale-105 transition-transform cursor-pointer flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md">
                          <ScanSearch className="w-5 h-5 sm:w-6 sm:h-6 md:w-6.5 md:h-6.5 lg:w-7 lg:h-7 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      
                      {/* Input Field */}
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Initiate a query or send a command to the AI..."
                        className="flex-1 h-10 sm:h-12 md:h-14 lg:h-16 px-3 sm:px-4 md:px-5 lg:px-6 bg-gradient-to-r from-black/40 via-gray-900/50 to-black/40 backdrop-blur-md border border-gray-700/50 sm:border-2 sm:border-gray-700/60 rounded-xl sm:rounded-2xl text-white text-xs sm:text-sm md:text-base placeholder:text-gray-400 focus:border-orange-500/60 focus:ring-2 sm:focus:ring-4 focus:ring-orange-500/25 shadow-inner transition-all"
                      />
                      
                      {/* Send Button */}
                      <Button
                        onClick={() => sendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 p-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 hover:from-orange-400 hover:via-orange-500 hover:to-orange-400 rounded-xl sm:rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed shadow-xl sm:shadow-2xl shadow-orange-500/30 sm:shadow-orange-500/40 hover:shadow-orange-500/60 transition-all hover:scale-105 active:scale-95 border border-orange-400/30 flex-shrink-0"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-white drop-shadow-lg" />
                      </Button>
                    </div>

                    {/* Quick Actions Section */}
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-orange-400/80 text-center">
                        Quick Actions
                      </p>
                      
                      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isLoading && !isSendingRef.current) {
                              sendMessage("Help me reason through this document");
                            }
                          }}
                          disabled={isLoading}
                          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-orange-500/30 bg-black/60 text-gray-300 hover:text-white hover:border-orange-500/50 text-xs sm:text-sm backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Reasoning</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isLoading && !isSendingRef.current) {
                              sendMessage("Summarize the key points from this document");
                            }
                          }}
                          disabled={isLoading}
                          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-orange-500/30 bg-black/60 text-gray-300 hover:text-white hover:border-orange-500/50 text-xs sm:text-sm backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Summarize Key Points</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isLoading && !isSendingRef.current) {
                              sendMessage("Do deep research on the key topics in this document");
                            }
                          }}
                          disabled={isLoading}
                          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-orange-500/30 bg-black/60 text-gray-300 hover:text-white hover:border-orange-500/50 text-xs sm:text-sm backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>Deep Research</span>
                        </button>
                      </div>
                      
                      <div className="flex justify-end pt-1 sm:pt-2">
                        <span className="text-[10px] sm:text-xs uppercase tracking-wide text-orange-300/70">
                          Under Building
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
