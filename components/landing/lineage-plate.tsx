"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  VERSIONS,
  DOCUMENT_NAME,
  chunkStatesFor,
  chunkHash,
  formatChunkIndex,
  type ChunkState,
  type VersionRecord,
} from "./lineage-data";

const nf = new Intl.NumberFormat("en-US");

type Anim = { reusedOn: boolean; newLanded: number } | null;

const LEGEND: Array<{ state: ChunkState | "blocked"; label: string }> = [
  { state: "reused", label: "Reused" },
  { state: "new", label: "New" },
  { state: "inflight", label: "In flight" },
  { state: "replayed", label: "Replayed" },
  { state: "blocked", label: "Blocked" },
];

function BarcodeStrip({ version }: { version: VersionRecord }) {
  const states = chunkStatesFor(version);
  const rects: Array<{ x: number; w: number; isNew: boolean }> = [];
  let runStart = 0;
  for (let i = 1; i <= states.length; i++) {
    if (i === states.length || states[i] !== states[runStart]) {
      rects.push({ x: runStart, w: i - runStart, isNew: states[runStart] === "new" });
      runStart = i;
    }
  }
  return (
    <svg
      viewBox={`0 0 ${states.length} 6`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className="vs-lineage-strip"
    >
      {rects.map((r, i) => (
        <rect
          key={i}
          x={r.x}
          y={0}
          width={r.w}
          height={6}
          fill={r.isNew ? "var(--new)" : "var(--reused)"}
        />
      ))}
    </svg>
  );
}

function AccountRow({
  prefix,
  value,
  caption,
  color,
}: {
  prefix?: string;
  value: string;
  caption: string;
  color: string;
}) {
  return (
    <div className="vs-lineage-acct-row">
      <span className="vs-numeral vs-lineage-acct-n" style={{ color }}>
        {prefix ? `${prefix} ` : ""}
        {value}
      </span>
      <span className="vs-key">{caption}</span>
    </div>
  );
}

function versionSummary(v: VersionRecord) {
  return v.reusedChunks > 0
    ? `${v.reusedChunks} reused · ${v.newChunks} new`
    : `${v.newChunks} new`;
}

export default function LineagePlate() {
  const [selectedId, setSelectedId] = useState<VersionRecord["id"]>("v4");
  const [anim, setAnim] = useState<Anim>(null);
  const [switching, setSwitching] = useState(false);
  const [filters, setFilters] = useState<Set<ChunkState>>(new Set());
  const [pinned, setPinned] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [colCount, setColCount] = useState(24);
  const [reducedMotion, setReducedMotion] = useState(false);

  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const timersRef = useRef<number[]>([]);

  const version = VERSIONS.find((v) => v.id === selectedId) ?? VERSIONS[0];
  const baseStates = useMemo(() => chunkStatesFor(version), [version]);
  const newOrder = useMemo(() => {
    const m = new Map<number, number>();
    let k = 0;
    baseStates.forEach((s, i) => {
      if (s === "new") m.set(i, k++);
    });
    return m;
  }, [baseStates]);

  useEffect(() => {
    const mdQ = window.matchMedia("(min-width: 768px)");
    const xlQ = window.matchMedia("(min-width: 1280px)");
    const rmQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setColCount(xlQ.matches ? 24 : mdQ.matches ? 16 : 12);
      setReducedMotion(rmQ.matches);
    };
    update();
    mdQ.addEventListener("change", update);
    xlQ.addEventListener("change", update);
    rmQ.addEventListener("change", update);
    return () => {
      mdQ.removeEventListener("change", update);
      xlQ.removeEventListener("change", update);
      rmQ.removeEventListener("change", update);
    };
  }, []);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) window.clearTimeout(t);
    timersRef.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const cellState = useCallback(
    (i: number): ChunkState => {
      const s = baseStates[i];
      if (!anim) return s;
      if (s === "reused") return anim.reusedOn ? "reused" : "unresolved";
      const order = newOrder.get(i) ?? 0;
      return order < anim.newLanded ? "new" : "unresolved";
    },
    [anim, baseStates, newOrder]
  );

  const replay = useCallback(() => {
    if (anim) return;
    if (reducedMotion) {
      setSelectedId((id) => (id === "v3" ? "v4" : "v3"));
      return;
    }
    clearTimers();
    setSelectedId("v4");
    setPinned(null);
    const v4 = VERSIONS[0];
    setAnim({ reusedOn: false, newLanded: 0 });
    timersRef.current.push(window.setTimeout(() => setAnim({ reusedOn: true, newLanded: 0 }), 80));
    const batches = Math.ceil(v4.newChunks / 2);
    for (let b = 1; b <= batches; b++) {
      timersRef.current.push(
        window.setTimeout(
          () => setAnim({ reusedOn: true, newLanded: Math.min(b * 2, v4.newChunks) }),
          440 + b * 60
        )
      );
    }
    timersRef.current.push(window.setTimeout(() => setAnim(null), 440 + batches * 60 + 320));
  }, [anim, reducedMotion, clearTimers]);

  const switchVersion = useCallback(
    (id: VersionRecord["id"]) => {
      if (anim || id === selectedId) return;
      clearTimers();
      setSwitching(true);
      setSelectedId(id);
      setPinned(null);
      setHovered(null);
      timersRef.current.push(window.setTimeout(() => setSwitching(false), 260));
    },
    [anim, selectedId, clearTimers]
  );

  const toggleFilter = useCallback((s: ChunkState) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }, []);

  const onGridKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const active = document.activeElement;
      const idx = cellRefs.current.findIndex((el) => el === active);
      if (idx < 0) return;
      let next = -1;
      const total = version.totalChunks;
      if (e.key === "ArrowRight") next = Math.min(idx + 1, total - 1);
      else if (e.key === "ArrowLeft") next = Math.max(idx - 1, 0);
      else if (e.key === "ArrowDown") next = Math.min(idx + colCount, total - 1);
      else if (e.key === "ArrowUp") next = Math.max(idx - colCount, 0);
      else if (e.key === "Home") next = Math.floor(idx / colCount) * colCount;
      else if (e.key === "End")
        next = Math.min(Math.floor(idx / colCount) * colCount + colCount - 1, total - 1);
      else return;
      e.preventDefault();
      setFocused(next);
      cellRefs.current[next]?.focus();
    },
    [colCount, version.totalChunks]
  );

  const readoutIndex = pinned ?? hovered ?? focused;
  const readout: React.ReactNode = anim ? (
    <>Replaying version 3 → version 4 …</>
  ) : readoutIndex !== null && readoutIndex < version.totalChunks ? (
    <>
      Section {formatChunkIndex(readoutIndex)}
      <span className="vs-lineage-sep">·</span>
      <span className="vs-mono">{chunkHash(version.number, readoutIndex)}…</span>
      <span className="vs-lineage-sep">·</span>
      {baseStates[readoutIndex] === "new"
        ? `new — summarized in ${version.id}`
        : `reused from v${version.number - 1}`}
    </>
  ) : (
    <>
      {version.totalChunks} sections
      <span className="vs-lineage-sep">·</span>
      ~1,000 characters each
      <span className="vs-lineage-sep">·</span>
      SHA-256
    </>
  );

  const reusedShown = anim ? (anim.reusedOn ? version.reusedChunks : 0) : version.reusedChunks;
  const newShown = anim ? anim.newLanded : version.newChunks;
  const savedShown = reusedShown * 1000;

  const rows = Math.ceil(version.totalChunks / colCount);
  const legendCount = (s: ChunkState | "blocked") =>
    s === "reused" ? version.reusedChunks : s === "new" ? version.newChunks : 0;

  const focusTarget = focused !== null && focused < version.totalChunks ? focused : 0;

  return (
    <div
      className={cn("vs-lineage vs-cellset-paper", (anim || switching) && "vs-plate--animating")}
    >
      <div className="vs-lineage-head">
        <div className="min-w-0">
          <p className="vs-name truncate">{DOCUMENT_NAME}</p>
          <p className="vs-key mt-0.5" style={{ fontWeight: 400 }}>
            Version {version.number} of {VERSIONS.length}
            <span className="vs-lineage-sep">·</span>
            {version.totalChunks} sections
            <span className="vs-lineage-sep">·</span>
            sample data
          </p>
        </div>
        <button
          type="button"
          onClick={replay}
          disabled={Boolean(anim)}
          aria-label="Replay the version 3 to version 4 processing sequence"
          className="vs-btn vs-btn-primary vs-btn-label vs-btn-sm vs-t"
        >
          {anim ? "Replaying…" : "Replay v3 → v4"}
        </button>
      </div>

      <div className="vs-lineage-body">
        <div className="vs-lineage-rail" role="group" aria-label="Versions">
          {VERSIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => switchVersion(v.id)}
              aria-current={v.id === selectedId ? "true" : undefined}
              aria-label={`Version ${v.number}${v.id === "v4" ? ", current" : ""}: ${v.totalChunks} sections, ${v.reusedChunks} reused, ${v.newChunks} new`}
              className="vs-lineage-row vs-t"
            >
              <span className="flex items-baseline gap-2">
                <span className="vs-name" style={{ fontSize: 14 }}>
                  {v.id}
                </span>
                <span className="vs-mono" style={{ color: "var(--ink-3)" }}>
                  {v.hash}
                </span>
                {v.id === "v4" ? (
                  <span className="vs-key ml-auto" style={{ fontWeight: 400 }}>
                    current
                  </span>
                ) : null}
              </span>
              <span className="vs-key mt-0.5 block" style={{ fontWeight: 400 }}>
                {versionSummary(v)}
              </span>
              <span className="mt-2 block">
                <BarcodeStrip version={v} />
              </span>
            </button>
          ))}
        </div>

        <div className="vs-lineage-chips" role="group" aria-label="Versions">
          {VERSIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => switchVersion(v.id)}
              aria-current={v.id === selectedId ? "true" : undefined}
              className="vs-lineage-chip vs-key vs-t"
            >
              {v.id}
              {v.id === "v4" ? " · current" : ""}
            </button>
          ))}
        </div>

        <div className="vs-lineage-mapblock">
          <p className="vs-key vs-lineage-maplabel" style={{ fontWeight: 400 }}>
            Sections {formatChunkIndex(0)}–{formatChunkIndex(version.totalChunks - 1)}, in reading
            order
          </p>
          <div className="flex gap-2.5">
            <div className="vs-lineage-gutter" aria-hidden="true">
              {Array.from({ length: rows }, (_, r) => (
                <span key={r} className="vs-lineage-gutter-n">
                  {formatChunkIndex(r * colCount)}
                </span>
              ))}
            </div>

            <div
              className="vs-map"
              role="group"
              aria-label={`Section map for ${version.id}: ${version.totalChunks} sections in reading order`}
              onKeyDown={onGridKeyDown}
            >
              {baseStates.map((s, i) => {
                const shown = cellState(i);
                const dimmed = filters.size > 0 && !filters.has(s);
                const row = Math.floor(i / colCount);
                return (
                  <button
                    key={i}
                    ref={(el) => {
                      cellRefs.current[i] = el;
                    }}
                    type="button"
                    tabIndex={i === focusTarget ? 0 : -1}
                    aria-label={
                      s === "new"
                        ? `Section ${formatChunkIndex(i)}, new in version ${version.number}`
                        : `Section ${formatChunkIndex(i)}, reused from version ${version.number - 1}`
                    }
                    data-pinned={pinned === i ? "true" : undefined}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                    onFocus={() => setFocused(i)}
                    onBlur={() => setFocused((f) => (f === i ? null : f))}
                    onClick={() => setPinned((p) => (p === i ? null : i))}
                    className={cn(
                      "vs-cell vs-cell-btn",
                      `vs-cell--${shown}`,
                      dimmed && "vs-cell--dim"
                    )}
                    style={
                      anim && baseStates[i] === "reused"
                        ? ({ "--cell-delay": `${row * 8}ms` } as React.CSSProperties)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>

          <div className="vs-lineage-scale">
            <span className="vs-scalebar-line" aria-hidden="true" />
            <span className="vs-key mt-1 block" style={{ fontWeight: 400 }}>
              10 sections ≈ 10,000 characters
            </span>
          </div>
        </div>

        <div className="vs-lineage-side">
          <div role="group" aria-label="Processing account">
            <AccountRow value={String(reusedShown)} caption="reused" color="var(--reused)" />
            <AccountRow prefix="+" value={String(newShown)} caption="new" color="var(--new)" />
            <div className="vs-lineage-rule vs-sum-top--paper" />
            <AccountRow value={String(version.totalChunks)} caption="sections" color="var(--ink)" />
            <div className="vs-lineage-saved">
              <span className="vs-numeral vs-lineage-saved-n">{nf.format(savedShown)}</span>
              <span className="vs-key">est. tokens saved</span>
            </div>
            <div className="vs-lineage-rule vs-sum-close--paper" />
          </div>

          <div className="vs-lineage-legend" role="group" aria-label="Legend and filters">
            {LEGEND.map(({ state, label }) => {
              const count = legendCount(state);
              return (
                <button
                  key={state}
                  type="button"
                  aria-pressed={state !== "blocked" && filters.has(state as ChunkState)}
                  onClick={() => state !== "blocked" && toggleFilter(state as ChunkState)}
                  className="vs-lineage-key vs-t"
                  disabled={state === "blocked"}
                >
                  {state === "blocked" ? (
                    <span
                      aria-hidden="true"
                      className="inline-block shrink-0"
                      style={{ width: 12, height: 3, backgroundColor: "var(--blocked)" }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={cn("vs-cell shrink-0", `vs-cell--${state}`)}
                      style={{ width: 12, height: 12 }}
                    />
                  )}
                  <span className="vs-key vs-lineage-key-label">{label}</span>
                  {state !== "blocked" ? (
                    <span
                      className="vs-mono"
                      style={{ color: count ? "var(--ink-2)" : "var(--ink-3)" }}
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="vs-lineage-foot">
        <span aria-live="polite" className="vs-key" style={{ fontWeight: 400 }}>
          {readout}
        </span>
      </div>
    </div>
  );
}
