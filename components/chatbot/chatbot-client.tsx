"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Edit2,
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

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, [pdfStoreId]);

  // Load messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId);
    } else {
      setMessages([]);
    }
  }, [currentSessionId]);

  // Scroll to bottom when messages change
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
        // Auto-select first session if available
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
    if (!inputMessage.trim() || !currentSessionId || isLoading) return;

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
        // Add both user and assistant messages to the state
        setMessages((prev) => [
          ...prev,
          data.userMessage,
          data.assistantMessage,
        ]);

        // Reload sessions to update message count
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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[700px] max-h-[800px]">
      {/* Sessions Sidebar */}
      <div className="lg:col-span-1 min-h-[400px]">
        <div className="relative p-6 bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 h-full flex flex-col min-h-0 transition-all duration-500 hover:shadow-3xl hover:from-white/25 hover:via-white/15 hover:to-white/10 hover:scale-[1.02] group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#484593]/20 via-[#484593]/10 to-transparent opacity-60 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-3xl" />

          <div className="relative flex flex-col h-full min-h-0 z-10">
            <div className="pb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#484593] to-[#484593]/80 flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Chat Sessions
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  onClick={createNewSession}
                  className="h-10 w-10 p-0 bg-gradient-to-br from-[#484593] to-[#484593]/90 hover:from-[#484593]/90 hover:to-[#484593] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 rounded-xl"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-0 flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-[#484593]/30 scrollbar-track-transparent hover:scrollbar-thumb-[#484593]/50">
              <div className="space-y-3 px-2 py-2 pb-4">
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#484593]/20"></div>
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#484593] absolute top-0 left-0"></div>
                    </div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#484593]/20 to-[#484593]/10 flex items-center justify-center">
                      <MessageSquare className="h-8 w-8 text-[#484593]/60" />
                    </div>
                    <p className="text-sm font-medium mb-1">No chats yet</p>
                    <p className="text-xs text-gray-500">
                      Start a new conversation
                    </p>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group relative p-4 rounded-2xl w-full cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        currentSessionId === session.id
                          ? "bg-gradient-to-r from-[#484593]/20 to-[#484593]/10 border-2 border-[#484593]/50 shadow-lg"
                          : "bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 hover:shadow-md"
                      }`}
                      onClick={() => setCurrentSessionId(session.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate text-gray-900 mb-2">
                            {session.session_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-xs bg-gradient-to-r from-[#484593]/20 to-[#484593]/10 text-[#484593] border-0 px-2 py-1 rounded-lg"
                            >
                              {session.message_count} messages
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                session.updated_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-gray-700 hover:text-gray-900 border border-white/30 hover:border-white/40 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 backdrop-blur-sm shadow-lg hover:shadow-xl"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-2"
                          >
                            <DropdownMenuItem
                              onClick={() => deleteSession(session.id)}
                              className="text-red-600 hover:bg-red-50/80 rounded-xl px-3 py-2 transition-all duration-200 hover:scale-105"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-3">
        <div className="relative p-6 bg-gradient-to-br from-white/20 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 h-full flex flex-col min-h-0 transition-all duration-500 hover:shadow-3xl hover:from-white/25 hover:via-white/15 hover:to-white/10 hover:scale-[1.01] group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#484593]/20 via-[#484593]/10 to-transparent opacity-60 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-3xl" />

          <div className="relative flex flex-col h-full min-h-0 z-10">
            <div className="pb-4 flex-shrink-0 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#484593] to-[#484593]/80 flex items-center justify-center shadow-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {currentSession
                    ? currentSession.session_name
                    : "Select a chat session"}
                </CardTitle>
              </div>
            </div>
            <div className="flex-1 flex flex-col p-0 min-h-0">
              {currentSessionId ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 max-h-[calc(100vh-190px)] scrollbar-thin scrollbar-thumb-[#484593]/30 scrollbar-track-transparent hover:scrollbar-thumb-[#484593]/50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#484593]/20 to-[#484593]/10 flex items-center justify-center">
                            <Bot className="h-10 w-10 text-[#484593]/70" />
                          </div>
                          <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Start a conversation
                          </h3>
                          <p className="text-gray-600 max-w-md">
                            Ask questions about your document:{" "}
                            <span className="font-semibold text-[#484593]">
                              "{pdfTitle}"
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-4 ${
                            message.message_type === "user"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex gap-4 max-w-[85%] ${
                              message.message_type === "user"
                                ? "flex-row-reverse"
                                : "flex-row"
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                                message.message_type === "user"
                                  ? "bg-gradient-to-br from-[#484593] to-[#484593]/90 text-white"
                                  : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700"
                              }`}
                            >
                              {message.message_type === "user" ? (
                                <User className="h-5 w-5" />
                              ) : (
                                <Bot className="h-5 w-5" />
                              )}
                            </div>
                            <div
                              className={`rounded-2xl px-5 py-4 shadow-lg ${
                                message.message_type === "user"
                                  ? "bg-gradient-to-br from-[#484593] to-[#484593]/90 text-white"
                                  : "bg-white/90 text-gray-900 border border-white/20 backdrop-blur-sm"
                              }`}
                            >
                              {message.message_type === "assistant" ? (
                                <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown
                                    components={{
                                      p: ({ children }) => (
                                        <p className="mb-2 last:mb-0">
                                          {children}
                                        </p>
                                      ),
                                      ul: ({ children }) => (
                                        <ul className="list-disc pl-4 mb-2 space-y-1">
                                          {children}
                                        </ul>
                                      ),
                                      ol: ({ children }) => (
                                        <ol className="list-decimal pl-4 mb-2 space-y-1">
                                          {children}
                                        </ol>
                                      ),
                                      li: ({ children }) => (
                                        <li className="leading-relaxed">
                                          {children}
                                        </li>
                                      ),
                                      strong: ({ children }) => (
                                        <strong className="font-semibold text-gray-900">
                                          {children}
                                        </strong>
                                      ),
                                      code: ({ children }) => (
                                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                                          {children}
                                        </code>
                                      ),
                                      h1: ({ children }) => (
                                        <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0">
                                          {children}
                                        </h1>
                                      ),
                                      h2: ({ children }) => (
                                        <h2 className="text-base font-bold mb-2 mt-3 first:mt-0">
                                          {children}
                                        </h2>
                                      ),
                                      h3: ({ children }) => (
                                        <h3 className="text-sm font-bold mb-1 mt-2 first:mt-0">
                                          {children}
                                        </h3>
                                      ),
                                    }}
                                  >
                                    {message.message_content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">
                                  {message.message_content}
                                </p>
                              )}
                              <p
                                className={`text-xs mt-1 ${
                                  message.message_type === "user"
                                    ? "text-[#484593]/80"
                                    : "text-gray-500"
                                }`}
                              >
                                {new Date(
                                  message.created_at
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex gap-4 justify-start">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 flex items-center justify-center shadow-lg">
                            <Bot className="h-5 w-5" />
                          </div>
                          <div className="bg-white/90 border border-white/20 backdrop-blur-sm rounded-2xl px-5 py-4 shadow-lg">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#484593]/20"></div>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-[#484593] absolute top-0 left-0"></div>
                              </div>
                              <span className="text-gray-700 font-medium">
                                Thinking...
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} className="pb-4" />
                  </div>

                  {/* Input */}
                  <div className="border-t border-white/20 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl p-6 flex-shrink-0 bottom-0 w-full">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Input
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask a question about your document..."
                          disabled={isLoading}
                          className="w-full h-12 px-4 bg-white/90 border border-white/30 rounded-2xl focus:border-[#484593] focus:ring-2 focus:ring-[#484593]/20 placeholder:text-gray-500 text-black shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl focus:shadow-xl"
                        />
                      </div>
                      <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        size="sm"
                        className="h-12 w-12 p-0 bg-gradient-to-br from-[#484593] to-[#484593]/90 hover:from-[#484593]/90 hover:to-[#484593] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#484593]/20 to-[#484593]/10 flex items-center justify-center">
                      <MessageSquare className="h-10 w-10 text-[#484593]/70" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      No chat selected
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Create a new chat session to start asking questions about
                      your document.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
