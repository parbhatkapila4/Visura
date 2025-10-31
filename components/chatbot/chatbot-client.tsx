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

  const createNewSession = async () => {
    try {
      const response = await fetch("/api/chatbot/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfStoreId,
          sessionName: `Chat ${sessions.length + 1}`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await loadSessions();
        setCurrentSessionId(data.session.id);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    if (!currentSessionId) {
      await createNewSession();
      setTimeout(sendMessage, 100);
      return;
    }

    const messageText = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
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
    <div className="flex h-full gap-4 lg:gap-6 overflow-hidden">
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
              onClick={createNewSession}
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
                <p className="text-sm font-medium text-gray-400 mb-1">No chats yet</p>
                <p className="text-xs text-gray-500">Start a new conversation</p>
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
      <div className="flex-1 min-w-0 h-full overflow-hidden">
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
                    onClick={sendMessage}
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

                {/* Input Area with Glossy Glass Effect */}
                <div className="relative w-full bg-gradient-to-br from-gray-900/85 via-black/60 to-gray-900/85 backdrop-blur-xl border border-orange-500/35 rounded-3xl p-5 sm:p-6 lg:p-8 shadow-[0_25px_60px_-25px_rgba(249,115,22,0.45)] overflow-hidden">
                  {/* Glossy shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent rounded-3xl pointer-events-none"></div>
                  {/* Orange glow accent */}
                  <div className="absolute inset-0 rounded-3xl" style={{
                    background: 'radial-gradient(circle at 25% 20%, rgba(249, 115, 22, 0.18) 0%, transparent 55%)'
                  }}></div>
                  
                  <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center justify-center w-full sm:w-auto h-12 sm:h-14 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 shadow-lg shadow-orange-500/40">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Initiate a query or send a command to the AI..."
                        className="flex-1 h-12 sm:h-14 bg-black/30 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder:text-gray-400 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 text-sm sm:text-base"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="h-12 sm:h-14 w-full sm:w-14 p-0 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 rounded-xl disabled:opacity-50 shadow-lg shadow-orange-500/30 transition-all"
                      >
                        <Send className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-orange-400/80">
                        Quick Actions
                      </p>
                      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Help me reason through this document")}
                          className="rounded-full border-orange-500/30 bg-gradient-to-r from-black/60 via-gray-900/40 to-black/60 text-gray-300 hover:from-orange-500/20 hover:via-gray-900/60 hover:to-orange-500/20 hover:text-white hover:border-orange-500/50 text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          Reasoning
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Create an illustrative image for this document")}
                          className="rounded-full border-orange-500/30 bg-gradient-to-r from-black/60 via-gray-900/40 to-black/60 text-gray-300 hover:from-orange-500/20 hover:via-gray-900/60 hover:to-orange-500/20 hover:text-white hover:border-orange-500/50 text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          Create Image
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInputMessage("Do deep research on the key topics in this document")}
                          className="rounded-full border-orange-500/30 bg-gradient-to-r from-black/60 via-gray-900/40 to-black/60 text-gray-300 hover:from-orange-500/20 hover:via-gray-900/60 hover:to-orange-500/20 hover:text-white hover:border-orange-500/50 text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 sm:py-2 backdrop-blur-sm transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          Deep Research
                        </Button>
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
