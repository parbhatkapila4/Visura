"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import {
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
  User,
  FileText,
  Lightbulb,
  ListOrdered,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DocumentReference } from "@/lib/document-reference";
import { DOCUMENT_VIEWER_GO_TO_EVENT } from "@/lib/document-reference";
import type { ChatMessageSource } from "./chatbot-client";

interface Message {
  id: string;
  message_type: "user" | "assistant";
  message_content: string;
  created_at: string;
  sources?: ChatMessageSource[];
}

interface Session {
  id: string;
  session_name: string;
  message_count: number;
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  prompt: string;
}

interface ChatbotAnimatedViewProps {
  pdfSummaryId: string;
  pdfStoreId: string;
  pdfTitle: string;
  onSelectReference?: (ref: DocumentReference) => void;
}

const SNIPPET_MAX_LEN = 250;

function sourceToRef(s: ChatMessageSource): DocumentReference {
  return {
    document_version_id: s.document_version_id ?? "",
    page: s.page ?? null,
    snippet: s.snippet ?? "",
    pdf_summary_id: s.pdf_summary_id ?? null,
    chunk_id: s.chunk_id ?? null,
  };
}

function truncateSnippet(text: string, max: number = SNIPPET_MAX_LEN): string {
  const t = (text ?? "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trim() + "…";
}

function useAutoResizeTextarea(minHeight: number, maxHeight?: number) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );
  useEffect(() => {
    const t = textareaRef.current;
    if (t) t.style.height = `${minHeight}px`;
  }, [minHeight]);
  return { textareaRef, adjustHeight };
}

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{ boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)" }}
        />
      ))}
    </div>
  );
}

export function ChatbotAnimatedView({
  pdfSummaryId,
  pdfStoreId,
  pdfTitle,
  onSelectReference,
}: ChatbotAnimatedViewProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea(60, 200);

  const documentCommands: CommandSuggestion[] = [
    {
      icon: <FileText className="w-4 h-4" />,
      label: "Summarize key points",
      prompt: "Summarize the key points from this document",
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      label: "Explain like I'm 5",
      prompt:
        "Explain the main concepts from this document in very simple terms, like I'm 5 years old",
    },
    {
      icon: <Target className="w-4 h-4" />,
      label: "Find action items",
      prompt: "What are the actionable items or next steps mentioned in this document?",
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      label: "Create an outline",
      prompt: "Create a detailed outline of the structure and main points of this document",
    },
  ];

  const loadSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const res = await fetch(`/api/chatbot/sessions?pdfStoreId=${pdfStoreId}`);
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = await res.json();
      setSessions(data.sessions || []);
      if (data.sessions?.length > 0 && !currentSessionId) {
        setCurrentSessionId(data.sessions[0].id);
      }
    } catch {
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [pdfStoreId]);

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chatbot/messages?sessionId=${sessionId}`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    const handler = () => setCurrentSessionId(null);
    window.addEventListener("chatbot-new-chat", handler);
    return () => window.removeEventListener("chatbot-new-chat", handler);
  }, []);

  useEffect(() => {
    if (currentSessionId) loadMessages(currentSessionId);
    else setMessages([]);
  }, [currentSessionId, loadMessages]);

  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);
      const idx = documentCommands.findIndex((c) =>
        c.prompt.toLowerCase().startsWith(value.toLowerCase().slice(1))
      );
      setActiveSuggestion(idx >= 0 ? idx : -1);
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const cmdBtn = document.querySelector("[data-command-button]");
      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !cmdBtn?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const createNewSession = async (firstMessage?: string): Promise<string | null> => {
    try {
      const sessionName = firstMessage
        ? firstMessage
            .replace(/[?!.,]/g, "")
            .trim()
            .split(" ")
            .filter((w) => w.length > 2)
            .slice(0, 4)
            .join(" ")
            .slice(0, 35) || `Chat ${sessions.length + 1}`
        : `Chat ${sessions.length + 1}`;
      const res = await fetch("/api/chatbot/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfStoreId, sessionName }),
      });
      const data = await res.json();
      if (!res.ok || !data.session?.id) return null;
      setCurrentSessionId(data.session.id);
      loadSessions();
      return data.session.id;
    } catch {
      return null;
    }
  };

  const sendMessage = async (messageOverride?: string) => {
    const messageToSend = (messageOverride ?? value).trim();
    if (!messageToSend || isLoading || isSendingRef.current) return;
    isSendingRef.current = true;

    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = await createNewSession(messageToSend);
      if (!activeSessionId) {
        isSendingRef.current = false;
        return;
      }
    }

    setValue("");
    adjustHeight(true);

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      message_type: "user",
      message_content: messageToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chatbot/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId, message: messageToSend }),
      });
      if (res.ok) {
        await loadMessages(activeSessionId);
        await loadSessions();
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((p) => (p < documentCommands.length - 1 ? p + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((p) => (p > 0 ? p - 1 : documentCommands.length - 1));
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const cmd = documentCommands[activeSuggestion];
          setValue(cmd.prompt);
          setShowCommandPalette(false);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) sendMessage();
    }
  };

  const selectCommand = (index: number) => {
    const cmd = documentCommands[index];
    setValue(cmd.prompt);
    setShowCommandPalette(false);
  };

  const handleAttachFile = () => {
    setAttachments((prev) => [...prev, `file-${Date.now()}.pdf`]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const showWelcome = !currentSessionId || messages.length === 0;

  return (
    <div className="h-full min-h-0 flex flex-col w-full items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-3 sm:p-5 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full mix-blend-normal filter blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[128px]" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full mix-blend-normal filter blur-[96px]" />
      </div>

      <div className="flex-1 w-full flex flex-col items-center min-h-0 relative z-10">
        <div className="w-full max-w-4xl flex flex-col flex-1 min-h-0">
          <motion.div
            className="relative flex flex-col flex-1 min-h-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {showWelcome ? (
              <div className="flex-1 flex flex-col justify-center pb-8">
                <div className="text-center space-y-3 flex-shrink-0">
                  <motion.h1
                    className="text-3xl sm:text-4xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300 pb-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    How can I help today?
                  </motion.h1>
                  <motion.div
                    className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto max-w-xs"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                  <motion.p
                    className="text-sm sm:text-base text-slate-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Type a command or ask about &quot;{pdfTitle}&quot;
                  </motion.p>
                </div>
              </div>
            ) : (
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto min-h-0 rounded-2xl border border-slate-700/80 bg-slate-900/70 backdrop-blur-sm p-4 mb-4"
              >
                <div className="space-y-6 max-w-3xl mx-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="flex gap-4">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          message.message_type === "user"
                            ? "bg-white"
                            : "bg-white/[0.08] border border-white/10"
                        )}
                      >
                        {message.message_type === "user" ? (
                          <User className="w-4 h-4 text-black" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-white/80" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[11px] text-white/50 mb-1.5 uppercase tracking-wider">
                          {message.message_type === "user" ? "You" : "Visura"}
                        </p>
                        {message.message_type === "assistant" ? (
                          <>
                            <div className="prose prose-sm max-w-none prose-invert">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <p className="mb-3 last:mb-0 text-white/90 text-[15px] leading-relaxed">
                                      {children}
                                    </p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc pl-5 mb-3 space-y-1.5 text-white/90">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal pl-5 mb-3 space-y-1.5 text-white/90">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => <li className="text-[15px]">{children}</li>,
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-white">{children}</strong>
                                  ),
                                  code: ({ children }) => (
                                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-white/90">
                                      {children}
                                    </code>
                                  ),
                                  pre: ({ children }) => (
                                    <pre className="bg-black/30 border border-white/10 rounded-lg p-4 overflow-x-auto my-3">
                                      {children}
                                    </pre>
                                  ),
                                }}
                              >
                                {message.message_content}
                              </ReactMarkdown>
                            </div>
                            {message.sources && message.sources.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-white/10">
                                <p className="text-[11px] text-white/50 uppercase tracking-wider font-medium mb-2">
                                  Sources
                                </p>
                                <ul className="space-y-2">
                                  {message.sources.map((source, idx) => {
                                    const ref = sourceToRef(source);
                                    const handleView = () => {
                                      if (onSelectReference) onSelectReference(ref);
                                      else
                                        window.dispatchEvent(
                                          new CustomEvent(DOCUMENT_VIEWER_GO_TO_EVENT, {
                                            detail: ref,
                                          })
                                        );
                                    };
                                    const pageLabel =
                                      source.page != null ? `Page ${source.page}` : null;
                                    const snippetText = truncateSnippet(source.snippet ?? "");
                                    return (
                                      <li
                                        key={idx}
                                        className="text-sm text-white/70 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2"
                                      >
                                        {pageLabel && (
                                          <span className="text-white/50 text-xs mr-2">
                                            {pageLabel}
                                          </span>
                                        )}
                                        <p className="text-white/80 leading-relaxed mt-0.5">
                                          {snippetText}
                                        </p>
                                        <button
                                          type="button"
                                          onClick={handleView}
                                          className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                        >
                                          View in document
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-[15px] text-white/90 leading-relaxed">
                            {message.message_content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white/70" />
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-[11px] text-white/50 mb-1.5 uppercase tracking-wider">
                          Visura
                        </p>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <span>Thinking</span>
                          <TypingDots />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            <motion.div
              className="relative backdrop-blur-2xl bg-slate-900/80 rounded-2xl border border-slate-700 shadow-2xl flex-shrink-0"
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <AnimatePresence>
                {showCommandPalette && (
                  <motion.div
                    ref={commandPaletteRef}
                    className="fixed left-1/2 -translate-x-1/2 bottom-36 w-[min(44rem,calc(100vw-1.5rem))] sm:w-[min(44rem,calc(100vw-3rem))] max-h-72 overflow-y-auto backdrop-blur-xl bg-slate-900/95 rounded-xl z-[10020] shadow-2xl border border-slate-700"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="py-1 bg-slate-900/95">
                      {documentCommands.map((cmd, index) => (
                        <motion.div
                          key={cmd.label}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 text-sm transition-colors cursor-pointer",
                            activeSuggestion === index
                              ? "bg-slate-700 text-white"
                              : "text-slate-200 hover:bg-slate-800"
                          )}
                          onClick={() => selectCommand(index)}
                        >
                          <div className="w-5 h-5 flex items-center justify-center text-slate-300">
                            {cmd.icon}
                          </div>
                          <div className="font-medium">{cmd.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={`Ask a question about "${pdfTitle}"...`}
                  disabled={isLoading}
                  className={cn(
                    "w-full px-4 py-3 resize-none bg-transparent border-none text-slate-100 text-sm focus:outline-none placeholder:text-slate-400 min-h-[60px]"
                  )}
                  style={{ overflow: "hidden" }}
                  rows={1}
                />
              </div>

              <AnimatePresence>
                {attachments.length > 0 && (
                  <motion.div
                    className="px-4 pb-3 flex gap-2 flex-wrap"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {attachments.map((file, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-2 text-xs bg-slate-800 py-1.5 px-3 rounded-lg text-slate-300"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <span>{file}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-white/40 hover:text-white transition-colors"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-4 border-t border-slate-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.button
                    type="button"
                    onClick={handleAttachFile}
                    whileTap={{ scale: 0.94 }}
                    className="p-2 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    type="button"
                    data-command-button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCommandPalette((p) => !p);
                    }}
                    whileTap={{ scale: 0.94 }}
                    className={cn(
                      "p-2 text-slate-400 hover:text-slate-100 rounded-lg transition-colors",
                      showCommandPalette && "bg-slate-700 text-slate-100"
                    )}
                  >
                    <Command className="w-4 h-4" />
                  </motion.button>
                </div>
                <motion.button
                  type="button"
                  onClick={() => sendMessage()}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading || !value.trim()}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    value.trim()
                      ? "bg-slate-100 text-slate-900 shadow-lg shadow-slate-500/20"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {isLoading ? (
                    <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                  ) : (
                    <SendIcon className="w-4 h-4" />
                  )}
                  <span>Send</span>
                </motion.button>
              </div>
            </motion.div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              {documentCommands.map((cmd, index) => (
                <motion.button
                  key={cmd.label}
                  type="button"
                  onClick={() => sendMessage(cmd.prompt)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-sm text-slate-300 hover:text-slate-100 transition-all border border-slate-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {cmd.icon}
                  <span>{cmd.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 backdrop-blur-2xl bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05] z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-7 rounded-full bg-white/[0.05] flex items-center justify-center">
                <span className="text-xs font-medium text-white/90">Visura</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span>Thinking</span>
                <TypingDots />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {inputFocused && (
        <motion.div
          className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
          animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }}
        />
      )}
    </div>
  );
}
