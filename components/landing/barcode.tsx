import { cn } from "@/lib/utils";
import { chunkStatesFor, type ChunkState, type VersionRecord } from "./lineage-data";

export function Barcode({
  version,
  states,
  className,
  label,
}: {
  version?: VersionRecord;
  states?: ChunkState[];
  className?: string;
  label: string;
}) {
  const s = states ?? (version ? chunkStatesFor(version) : []);
  const rects: Array<{ x: number; w: number; state: ChunkState }> = [];
  let runStart = 0;
  for (let i = 1; i <= s.length; i++) {
    if (i === s.length || s[i] !== s[runStart]) {
      rects.push({ x: runStart, w: i - runStart, state: s[runStart] });
      runStart = i;
    }
  }
  const fill = (st: ChunkState) =>
    st === "new"
      ? "var(--new)"
      : st === "reused"
        ? "var(--reused)"
        : st === "replayed"
          ? "var(--replayed)"
          : st === "inflight"
            ? "var(--inflight)"
            : "var(--paper-2)";
  return (
    <svg
      className={cn("vs-barcode", className)}
      viewBox={`0 0 ${s.length} 10`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      {rects.map((r, i) => (
        <rect
          key={i}
          x={r.x}
          y={0}
          width={r.w}
          height={10}
          fill={fill(r.state)}
          fillOpacity={r.state === "inflight" ? 0.35 : 1}
        />
      ))}
    </svg>
  );
}
