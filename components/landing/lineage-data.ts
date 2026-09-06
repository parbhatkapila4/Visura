export type ChunkState = "reused" | "new" | "inflight" | "replayed" | "unresolved";

export interface VersionRecord {
  id: "v1" | "v2" | "v3" | "v4";
  number: 1 | 2 | 3 | 4;
  hash: string;
  totalChunks: number;
  reusedChunks: number;
  newChunks: number;
  newBands: Array<[number, number]>;
}

export const VERSIONS: VersionRecord[] = [
  {
    id: "v4",
    number: 4,
    hash: "fce188a2",
    totalChunks: 94,
    reusedChunks: 68,
    newChunks: 26,
    newBands: [
      [41, 60],
      [83, 88],
    ],
  },
  {
    id: "v3",
    number: 3,
    hash: "a91f3c07",
    totalChunks: 91,
    reusedChunks: 83,
    newChunks: 8,
    newBands: [
      [54, 58],
      [88, 90],
    ],
  },
  {
    id: "v2",
    number: 2,
    hash: "6b03e9d4",
    totalChunks: 88,
    reusedChunks: 79,
    newChunks: 9,
    newBands: [[40, 48]],
  },
  {
    id: "v1",
    number: 1,
    hash: "2f8d11ca",
    totalChunks: 84,
    reusedChunks: 0,
    newChunks: 84,
    newBands: [[0, 83]],
  },
];

export const CURRENT_VERSION = VERSIONS[0];
export const DOCUMENT_NAME = "employment-agreement.pdf";
export const EST_TOKENS_SAVED = CURRENT_VERSION.reusedChunks * 1000;

export function chunkStatesFor(v: VersionRecord): ChunkState[] {
  const states: ChunkState[] = Array.from({ length: v.totalChunks }, () => "reused" as ChunkState);
  for (const [start, end] of v.newBands) {
    for (let i = start; i <= end && i < v.totalChunks; i++) states[i] = "new";
  }
  return states;
}

const NAMED_HASHES: Record<number, string> = {
  1: "9c41f2ab",
  12: "8b41d0c2",
  40: "a3f29c81",
  42: "e0d17b44",
  47: "5b9e02cd",
  55: "1f6a8c3e",
  60: "77c04b9a",
  62: "c8925ef1",
  84: "b41c09f2",
  90: "4de6a10b",
};

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function chunkHash(versionNumber: number, index: number): string {
  if (versionNumber === 4 && NAMED_HASHES[index]) return NAMED_HASHES[index];
  const rnd = mulberry32(versionNumber * 7919 + index * 104729 + 13);
  let s = "";
  for (let i = 0; i < 8; i++) s += Math.floor(rnd() * 16).toString(16);
  return s;
}

export function formatChunkIndex(i: number): string {
  return String(i).padStart(2, "0");
}

export const MINI_STRIP = {
  startIndex: 54,
  states: chunkStatesFor(CURRENT_VERSION).slice(54, 74),
};

export const REPLAY_EXHIBIT: { startIndex: number; states: ChunkState[] } = {
  startIndex: 35,
  states: [
    "reused",
    "reused",
    "reused",
    "reused",
    "reused",
    "replayed",
    "replayed",
    "replayed",
    "inflight",
    "inflight",
    "inflight",
    "inflight",
    "inflight",
    "inflight",
    "reused",
    "reused",
    "reused",
    "reused",
    "reused",
    "reused",
  ],
};

export const GUARDRAIL_MESSAGE =
  "You've reached today's processing limit. Please try again tomorrow.";

export const PIPELINE_STAGES = [
  "Uploading",
  "Extracting text",
  "Chunking document",
  "Generating embeddings",
  "Detecting sections",
  "Extracting insights",
  "Building knowledge graph",
  "Finalizing",
] as const;

export const PROCESSING_EVENTS = [
  "upload_started",
  "chunking_started",
  "chunking_completed",
  "hash_diff_started",
  "reuse_calculated",
  "llm_processing_started",
  "embeddings_started",
  "indexing_started",
  "version_completed",
  "version_failed",
] as const;

export const CHANGE_TYPES = [
  "added",
  "removed",
  "modified",
  "policy_shift",
  "risk_added",
  "risk_removed",
  "assumption_added",
  "assumption_removed",
  "clarification",
  "scope_change",
] as const;
