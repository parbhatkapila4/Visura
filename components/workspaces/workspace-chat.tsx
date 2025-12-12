"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

interface ChatMessage {
  id: string;
  workspace_id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  message_content: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceChatProps {
  workspaceId: string;
}

export default function WorkspaceChat({ workspaceId }: WorkspaceChatProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safety check for invalid workspaceId - memoized to avoid recreation
  const isValidWorkspaceId = useMemo(
    () => workspaceId && typeof workspaceId === 'string' && workspaceId.trim() !== '',
    [workspaceId]
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageTimeRef = useRef<Date | null>(null);
  const isPollingRef = useRef(false);
  const lastMessageCountRef = useRef(0);
  const shouldScrollRef = useRef(true);
  const isUserScrollingRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!isValidWorkspaceId || !workspaceId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `/api/workspaces/chat?workspaceId=${workspaceId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to load messages";
        
        // Check if it's a table not found error
        if (errorData.code === "TABLE_NOT_FOUND" || errorMessage.includes("migration")) {
          throw new Error("Chat feature requires database setup. Please contact support or check the setup instructions.");
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const loadedMessages = data.messages || [];
      
      // Successfully loaded - empty array means no messages, not an error
      setMessages(loadedMessages);
      setError(null); // Clear any previous errors
      
      if (loadedMessages.length > 0) {
        lastMessageTimeRef.current = new Date(loadedMessages[loadedMessages.length - 1].created_at);
      } else {
        lastMessageTimeRef.current = null; // Reset when no messages
      }
    } catch (err: any) {
      console.error("Error loading messages:", err);
      // Only set error if it's an actual error, not just empty messages
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, isValidWorkspaceId]);

  const loadNewMessages = useCallback(async () => {
    if (!isValidWorkspaceId || !workspaceId || isPollingRef.current || !lastMessageTimeRef.current) {
      return;
    }

    isPollingRef.current = true;
    try {
      const response = await fetch(
        `/api/workspaces/chat?workspaceId=${workspaceId}&since=${lastMessageTimeRef.current.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages((prev) => {
            // Prevent duplicates
            const existingIds = new Set(prev.map(m => m.id));
            const newMessages = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newMessages.length > 0) {
              lastMessageTimeRef.current = new Date(
                newMessages[newMessages.length - 1].created_at
              );
              return [...prev, ...newMessages];
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error("Error loading new messages:", err);
    } finally {
      isPollingRef.current = false;
    }
  }, [workspaceId]);

  const startPolling = useCallback(() => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll for new messages every 5 seconds (reduced from 2 seconds)
    // Only poll when tab is visible
    const poll = () => {
      if (document.visibilityState === 'visible' && !isPollingRef.current) {
        loadNewMessages();
      }
    };

    pollingIntervalRef.current = setInterval(poll, 5000);
    
    // Also listen for visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isPollingRef.current) {
        loadNewMessages();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadNewMessages]);

  // Track user scroll to prevent auto-scroll when reading old messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      isUserScrollingRef.current = !isNearBottom;
      shouldScrollRef.current = isNearBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Load initial messages
  useEffect(() => {
    if (!isValidWorkspaceId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    let cleanup: (() => void) | undefined;
    let mounted = true;
    
    const initialize = async () => {
      try {
        await loadMessages();
        if (mounted) {
          cleanup = startPolling();
        }
      } catch (err) {
        console.error("Error initializing chat:", err);
      }
    };
    
    initialize();
    
    return () => {
      mounted = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (cleanup) {
        cleanup();
      }
    };
  }, [isValidWorkspaceId ? workspaceId : null, loadMessages, startPolling]);

  // Scroll to bottom only when new messages arrive and user is at bottom
  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      // Only auto-scroll if user is near bottom or sent the message
      if (shouldScrollRef.current || !isUserScrollingRef.current) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length, scrollToBottom]);


  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isSending) return;

    const messageToSend = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);
    setError(null);
    shouldScrollRef.current = true;

    try {
      const response = await fetch("/api/workspaces/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          messageContent: messageToSend,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const data = await response.json();
      
      // Add the new message to the list
      setMessages((prev) => {
        const newMessages = [...prev, data.message];
        lastMessageTimeRef.current = new Date(data.message.created_at);
        return newMessages;
      });
      
      // Scroll to bottom after state update
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
      setInputMessage(messageToSend); // Restore message on error
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isSending, workspaceId, scrollToBottom]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const isCurrentUser = useCallback((messageUserId: string) => {
    return messageUserId === user?.id;
  }, [user?.id]);

  const getUserInitials = useCallback((name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0]?.toUpperCase() || "U";
  }, []);

  // Early return for invalid workspace
  if (!isValidWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <MessageCircle className="w-6 h-6 text-white/40" />
          <p className="text-white/40 text-sm">Invalid workspace</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
          <p className="text-white/40 text-sm">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] border border-white/10 rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white/70" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Team Chat</h3>
            <p className="text-xs text-white/40">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
        style={{ maxHeight: "calc(100vh - 300px)" }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-white/30" />
            </div>
            <p className="text-white/50 text-sm mb-1">No messages found</p>
            <p className="text-xs text-white/30">
              Start the conversation with your team
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = isCurrentUser(message.user_id);
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  getUserInitials={getUserInitials}
                />
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message - Only show if there's an actual error, not just empty messages */}
      {error && messages.length === 0 && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
        <div className="flex items-center gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/25 rounded-xl focus:bg-white/10 focus:ring-2 focus:ring-white/20"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="h-11 px-4 bg-white text-black hover:bg-white/90 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Memoized message item component to prevent unnecessary re-renders
const MessageItem = React.memo(({
  message,
  isOwn,
  getUserInitials,
}: {
  message: ChatMessage;
  isOwn: boolean;
  getUserInitials: (name: string | null, email: string) => string;
}) => {
  // Memoize formatted time to avoid recalculating on every render
  const formattedTime = useMemo(
    () =>
      formatDistanceToNow(new Date(message.created_at), {
        addSuffix: true,
      }),
    [message.created_at]
  );

  const displayName = useMemo(
    () => message.user_name || message.user_email.split("@")[0],
    [message.user_name, message.user_email]
  );

  const initials = useMemo(
    () => getUserInitials(message.user_name, message.user_email),
    [message.user_name, message.user_email, getUserInitials]
  );

  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
            isOwn
              ? "bg-white text-black"
              : "bg-white/10 border border-white/10"
          }`}
        >
          {initials}
        </div>
      </div>

      {/* Message Content */}
      <div
        className={`flex flex-col gap-1 max-w-[70%] ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        {/* User Name and Time */}
        <div
          className={`flex items-center gap-2 ${
            isOwn ? "flex-row-reverse" : ""
          }`}
        >
          <span className="text-xs font-semibold text-white/80">
            {displayName}
          </span>
          <span className="text-xs text-white/30">{formattedTime}</span>
        </div>

        {/* Message Bubble */}
        <div
          className={`px-4 py-2.5 rounded-xl ${
            isOwn
              ? "bg-white text-black rounded-br-sm"
              : "bg-white/5 border border-white/10 text-white rounded-bl-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message_content}
          </p>
        </div>
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

