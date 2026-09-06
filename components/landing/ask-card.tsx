"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Ask = {
  q: string;
  scope: string;
  tone: "doc" | "insight";
};

const ASKS: Ask[] = [
  {
    q: "What changed between version 3 and version 4?",
    scope: "employment-agreement.pdf",
    tone: "doc",
  },
  { q: "Which sections kept their summaries?", scope: "Processing insights", tone: "insight" },
  {
    q: "What is the termination notice period?",
    scope: "employment-agreement.pdf",
    tone: "doc",
  },
];

const TYPE_MS = 34;
const SPACE_MS = 66;
const HOLD_MS = 2600;
const SELECT_MS = 620;

type Phase = "hold" | "select" | "type";

function DocIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <path d="M14 2v5h5" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

function InsightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 3 7.5l9 4.5 9-4.5z" />
      <path d="M3 12.5 12 17l9-4.5" />
      <path d="M3 17.5 12 22l9-4.5" />
    </svg>
  );
}

export default function AskCard() {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(ASKS[0].q.length);
  const [phase, setPhase] = useState<Phase>("hold");
  const [running, setRunning] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => setRunning(entries.some((e) => e.isIntersecting)),
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const ask = ASKS[index];
    let t: number;
    if (phase === "hold") {
      t = window.setTimeout(() => setPhase("select"), HOLD_MS);
    } else if (phase === "select") {
      t = window.setTimeout(() => {
        setIndex((i) => (i + 1) % ASKS.length);
        setShown(0);
        setPhase("type");
      }, SELECT_MS);
    } else if (shown < ask.q.length) {
      t = window.setTimeout(
        () => setShown((n) => n + 1),
        ask.q[shown] === " " ? SPACE_MS : TYPE_MS
      );
    } else {
      t = window.setTimeout(() => setPhase("hold"), 240);
    }
    return () => window.clearTimeout(t);
  }, [running, phase, index, shown]);

  const ask = ASKS[index];
  const text = ask.q.slice(0, shown);
  const settled = phase === "hold" || phase === "select";

  return (
    <div ref={cardRef} className="vs-ask-card">
      <p className="vs-ask-text">
        <span className="sr-only">{ask.q}</span>
        <span
          aria-hidden="true"
          className={cn("vs-ask-chars", phase === "select" && "vs-ask-chars--sel")}
        >
          {text.split("").map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
        <span aria-hidden="true" className="vs-ask-caret" />
      </p>

      <div className="vs-ask-chip" data-on={settled ? "true" : "false"} aria-hidden="true">
        <span className={cn("vs-ask-tile", `vs-ask-tile--${ask.tone}`)}>
          {ask.tone === "doc" ? <DocIcon /> : <InsightIcon />}
        </span>
        <span className="vs-ask-label">{ask.scope}</span>
      </div>

      <div className="vs-ask-icons" aria-hidden="true">
        <span className="vs-ask-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </span>
        <span className="vs-ask-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="21" x2="14" y1="4" y2="4" />
            <line x1="10" x2="3" y1="4" y2="4" />
            <line x1="21" x2="12" y1="12" y2="12" />
            <line x1="8" x2="3" y1="12" y2="12" />
            <line x1="21" x2="16" y1="20" y2="20" />
            <line x1="12" x2="3" y1="20" y2="20" />
            <line x1="14" x2="14" y1="2" y2="6" />
            <line x1="8" x2="8" y1="10" y2="14" />
            <line x1="16" x2="16" y1="18" y2="22" />
          </svg>
        </span>
      </div>
    </div>
  );
}
