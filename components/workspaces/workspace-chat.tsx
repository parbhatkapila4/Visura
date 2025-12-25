"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
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

  const isValidWorkspaceId = useMemo(
    () => workspaceId && typeof workspaceId === "string" && workspaceId.trim() !== "",
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
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!isValidWorkspaceId || !workspaceId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/workspaces/chat?workspaceId=${workspaceId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || "Failed to load messages";

        if (errorData.code === "TABLE_NOT_FOUND" || errorMessage.includes("migration")) {
          throw new Error(
            "Chat feature requires database setup. Please contact support or check the setup instructions."
          );
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const loadedMessages = data.messages || [];

      setMessages(loadedMessages);
      setError(null);

      if (loadedMessages.length > 0) {
        lastMessageTimeRef.current = new Date(loadedMessages[loadedMessages.length - 1].created_at);
      } else {
        lastMessageTimeRef.current = null;
      }
    } catch (err: any) {
      console.error("Error loading messages:", err);
      setError(err.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, isValidWorkspaceId]);

  const loadNewMessages = useCallback(async () => {
    if (
      !isValidWorkspaceId ||
      !workspaceId ||
      isPollingRef.current ||
      !lastMessageTimeRef.current
    ) {
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
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = data.messages.filter((m: ChatMessage) => !existingIds.has(m.id));
            if (newMessages.length > 0) {
              lastMessageTimeRef.current = new Date(newMessages[newMessages.length - 1].created_at);
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
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const poll = () => {
      if (document.visibilityState === "visible" && !isPollingRef.current) {
        loadNewMessages();
      }
    };

    pollingIntervalRef.current = setInterval(poll, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isPollingRef.current) {
        loadNewMessages();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadNewMessages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      isUserScrollingRef.current = !isNearBottom;
      shouldScrollRef.current = isNearBottom;
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => {
    if (messages.length > lastMessageCountRef.current) {
      if (shouldScrollRef.current || !isUserScrollingRef.current) {
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

      setMessages((prev) => {
        const newMessages = [...prev, data.message];
        lastMessageTimeRef.current = new Date(data.message.created_at);
        return newMessages;
      });

      setTimeout(() => {
        if (messagesContainerRef.current) {
          const container = messagesContainerRef.current;
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    } catch (err: any) {
      console.error("Error sending message:", err);
      setError(err.message || "Failed to send message");
      setInputMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  }, [inputMessage, isSending, workspaceId, scrollToBottom]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const isCurrentUser = useCallback(
    (messageUserId: string) => {
      return messageUserId === user?.id;
    },
    [user?.id]
  );

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
    <div className="flex flex-col h-full overflow-hidden max-h-full">
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Team Chat</h3>
              <p className="text-xs text-white/40">{messages.length} messages</p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500" title="Live" />
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide min-h-0 max-h-full"
        style={{ maxHeight: "100%" }}
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onScroll={(e) => {
          e.stopPropagation();
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-sm text-white/40">No messages yet</p>
            <p className="text-xs text-white/20">Start the conversation</p>
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

      {error && messages.length === 0 && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 h-10 bg-white/5 border-white/[0.06] text-white text-sm placeholder:text-white/30 rounded-lg focus:border-white/20"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/25 transition-all"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const MessageItem = React.memo(
  ({
    message,
    isOwn,
    getUserInitials,
  }: {
    message: ChatMessage;
    isOwn: boolean;
    getUserInitials: (name: string | null, email: string) => string;
  }) => {
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
      <div className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
              isOwn
                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                : "bg-white/10 text-white/80"
            }`}
          >
            {initials}
          </div>
        </div>

        <div className={`flex flex-col gap-0.5 max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
          <div className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
            <span className="text-[11px] font-medium text-white/60">{displayName}</span>
            <span className="text-[10px] text-white/30">{formattedTime}</span>
          </div>

          <div
            className={`px-3 py-2 rounded-xl text-sm ${
              isOwn
                ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-tr-sm"
                : "bg-white/5 text-white/90 rounded-tl-sm"
            }`}
          >
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {message.message_content}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

MessageItem.displayName = "MessageItem";
