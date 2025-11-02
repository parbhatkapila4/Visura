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
  Sparkles,
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
    loadSessions();
  }, [pdfStoreId]);

  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId);
    } else {
      setMessages([]);
    }
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

    // Prevent duplicate sends within 1 second
    const now = Date.now();
    if (lastSentMessageRef.current && 
        lastSentMessageRef.current.text === messageToSend.trim() && 
        now - lastSentMessageRef.current.timestamp < 1000) {
      console.log("Blocking duplicate message send");
      return;
    }

    // Track this message
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
        setMessages((prev) => [
          ...prev,
          data.userMessage,
          data.assistantMessage,
        ]);

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
    <div className="flex h-full gap-4 lg:gap-6">
      {/* Left Sidebar - Chat Sessions */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="h-full bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl lg:rounded-3xl border border-orange-500/20 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden relative">
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl lg:rounded-3xl pointer-events-none"></div>
          {/* Orange glow accent */}
          <div className="absolute inset-0 rounded-2xl lg:rounded-3xl pointer-events-none" style={{
            background: 'radial-gradient(circle at top left, rgba(249, 115, 22, 0.1) 0%, transparent 50%)'
          }}></div>
          
          {/* Header */}
          <div className="relative z-10 p-4 lg:p-5 border-b border-orange-500/20 flex items-center justify-between backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/50">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Chat Sessions</h3>
            </div>
            <Button
              size="sm"
              onClick={() => createNewSession()}
              className="h-9 w-9 p-0 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 rounded-xl shadow-lg shadow-orange-500/30 transition-all"
            >
              <Plus className="w-4 h-4 text-white" />
            </Button>
          </div>

          {/* Sessions List */}
          <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-3">
            {isLoadingSessions ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500/30 border-t-orange-500"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-black/40 flex items-center justify-center shadow-lg border border-orange-500/20">
                  <MessageSquare className="w-10 h-10 text-orange-500" />
                </div>
                <p className="text-sm font-medium text-gray-200 uppercase tracking-[0.35em]">No chats yet</p>
                <p className="text-xs text-gray-400 mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-[11px] tracking-wide">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                  Click + and start
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all backdrop-blur-sm ${
                      currentSessionId === session.id
                        ? "bg-gradient-to-r from-orange-500/20 via-orange-600/10 to-orange-500/20 border border-orange-500/50 shadow-lg shadow-orange-500/20"
                        : "bg-gradient-to-r from-gray-800/50 via-black/30 to-gray-800/50 border border-gray-700/30 hover:from-orange-500/10 hover:via-gray-800/40 hover:to-orange-500/10 hover:border-orange-500/30 hover:shadow-md"
                    }`}
                    onClick={() => setCurrentSessionId(session.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate mb-1">
                          {session.session_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-500/30 via-orange-600/20 to-orange-500/30 text-white border border-orange-500/40 backdrop-blur-sm">
                            {session.message_count} msgs
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(session.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            className="h-7 w-7 p-0 bg-transparent hover:bg-orange-500/20 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-900 border border-gray-700 rounded-xl p-2">
                          <DropdownMenuItem
                            onClick={() => deleteSession(session.id)}
                            className="text-red-400 hover:bg-red-500/20 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
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
      <div className="flex-1 min-w-0">
        <div className="h-full bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl lg:rounded-3xl border border-orange-500/20 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden relative">
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
              <div className="relative z-10 p-4 lg:p-5 border-b border-orange-500/20 flex items-center gap-3 backdrop-blur-sm flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/50">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{currentSession?.session_name}</h3>
                </div>
              </div>

              {/* Messages Area */}
              <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-5 lg:p-6 space-y-5">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-black/40 flex items-center justify-center shadow-lg border border-orange-500/20">
                        <Bot className="w-8 h-8 text-orange-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Start a conversation</h3>
                      <p className="text-gray-400 text-sm">
                        Ask questions about: <span className="text-orange-500 font-medium">"{pdfTitle}"</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-4 ${
                          message.message_type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${
                            message.message_type === "user" ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                            message.message_type === "user"
                              ? "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 shadow-orange-500/30"
                              : "bg-gradient-to-br from-gray-800/80 to-black/60 backdrop-blur-sm border border-gray-700/50"
                          }`}>
                            {message.message_type === "user" ? (
                              <User className="w-5 h-5 text-white" />
                            ) : (
                              <Bot className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm ${
                            message.message_type === "user"
                              ? "bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 text-white shadow-orange-500/20"
                              : "bg-gradient-to-br from-gray-800/80 via-gray-900/60 to-black/80 text-gray-200 border border-gray-700/50"
                          }`}>
                            {message.message_type === "assistant" ? (
                              <div className="prose prose-sm max-w-none prose-invert">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-200">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-gray-200">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-gray-200">{children}</ol>,
                                    li: ({ children }) => <li className="leading-relaxed text-gray-200">{children}</li>,
                                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                    code: ({ children }) => (
                                      <code className="bg-black/60 px-1.5 py-0.5 rounded text-sm font-mono text-orange-400 border border-orange-500/20">
                                        {children}
                                      </code>
                                    ),
                                  }}
                                >
                                  {message.message_content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap text-white">{message.message_content}</p>
                            )}
                            <p className={`text-xs mt-2 ${
                              message.message_type === "user" ? "text-white/70" : "text-gray-400"
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-800/80 to-black/60 backdrop-blur-sm border border-gray-700/50 flex items-center justify-center shadow-lg">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-gradient-to-br from-gray-800/80 via-gray-900/60 to-black/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-4 py-3 shadow-lg">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500/30 border-t-orange-500"></div>
                            <span className="text-gray-300 text-sm">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="relative z-10 p-4 lg:p-5 border-t border-orange-500/20 backdrop-blur-sm flex-shrink-0">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask a question about your document..."
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-gray-800/60 via-black/40 to-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-400 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 backdrop-blur-sm shadow-lg"
                    />
                  </div>
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                    className="h-12 w-12 p-0 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 rounded-xl disabled:opacity-50 shadow-lg shadow-orange-500/30 transition-all"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Welcome State */
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-8 py-8 lg:py-12 min-h-0 overflow-y-auto">
              <div className="w-full max-w-3xl mx-auto flex flex-col items-center text-center gap-8 sm:gap-10">
                {/* Welcome Message */}
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-sm sm:text-base text-gray-400">Welcome back</p>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                    How can I <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-clip-text text-transparent">assist</span> you today?
                  </h2>
                </div>

                {/* Input Area with Enhanced UI */}
                <div className="relative w-full bg-gradient-to-br from-gray-900/90 via-black/70 to-gray-900/90 backdrop-blur-2xl border-2 border-orange-500/40 rounded-3xl p-8 shadow-[0_30px_80px_-20px_rgba(249,115,22,0.5)] overflow-hidden">
                  {/* Glossy shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
                  
                  {/* Orange glow accent - top left */}
                  <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
                  
                  {/* Orange glow accent - bottom right */}
                  <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="relative z-10 flex flex-col gap-6">
                    {/* Input Row */}
                    <div className="flex items-center gap-4">
                      {/* AI Icon Button */}
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 shadow-2xl shadow-orange-500/50 border border-orange-400/30 hover:scale-105 transition-transform cursor-pointer">
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-md">
                          <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
                        </div>
                      </div>
                      
                      {/* Input Field */}
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Initiate a query or send a command to the AI..."
                        className="flex-1 h-16 px-6 bg-gradient-to-r from-black/40 via-gray-900/50 to-black/40 backdrop-blur-md border-2 border-gray-700/60 rounded-2xl text-white text-base placeholder:text-gray-400 focus:border-orange-500/60 focus:ring-4 focus:ring-orange-500/25 shadow-inner transition-all"
                      />
                      
                      {/* Send Button */}
                      <Button
                        onClick={() => sendMessage()}
                        disabled={!inputMessage.trim() || isLoading}
                        className="h-16 w-16 p-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 hover:from-orange-400 hover:via-orange-500 hover:to-orange-400 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 transition-all hover:scale-105 active:scale-95 border border-orange-400/30"
                      >
                        <Send className="w-6 h-6 text-white drop-shadow-lg" />
                      </Button>
                    </div>

                    {/* Quick Actions Section */}
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-wide text-orange-400/80 text-center">
                        Quick Actions
                      </p>
                      
                      <div className="flex justify-center gap-3">
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
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-black/60 text-gray-300 hover:text-white hover:border-orange-500/50 text-sm backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Brain className="w-4 h-4" />
                          Reasoning
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
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-black/60 text-gray-300 hover:text-white hover:border-orange-500/50 text-sm backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FileText className="w-4 h-4" />
                          Summarize Key Points
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
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-black/60 text-gray-300 hover:text-white hover:border-orange-500/50 text-sm backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Search className="w-4 h-4" />
                          Deep Research
                        </button>
                      </div>
                      
                      <div className="flex justify-end">
                        <span className="text-xs uppercase tracking-wide text-orange-300/70">
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
