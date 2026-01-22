import { getDbConnection } from "./db";
import { getVersionById, getIncompleteChunks, isVersionComplete } from "./versioned-documents";

export async function replayVersion(versionId: string): Promise<{
  versionId: string;
  totalChunks: number;
  incompleteChunks: number;
  triggered: number;
}> {
  const version = await getVersionById(versionId);
  if (!version) {
    throw new Error(`Version ${versionId} not found`);
  }

  const incomplete = await getIncompleteChunks(versionId);
  const totalChunks = version.total_chunks;

  if (incomplete.length === 0) {
    return {
      versionId,
      totalChunks,
      incompleteChunks: 0,
      triggered: 0,
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const results = await Promise.allSettled(
    incomplete.map(async (chunk) => {
      const response = await fetch(`${baseUrl}/api/jobs/process-chunk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunkId: chunk.id, versionId }),
      });
      return { chunkId: chunk.id, success: response.ok };
    })
  );

  const triggered = results.filter((r) => r.status === "fulfilled").length;

  return {
    versionId,
    totalChunks,
    incompleteChunks: incomplete.length,
    triggered,
  };
}

export async function replayIncompleteChunks(versionId: string): Promise<{
  versionId: string;
  incompleteChunks: number;
  triggered: number;
}> {
  const incomplete = await getIncompleteChunks(versionId);

  if (incomplete.length === 0) {
    return {
      versionId,
      incompleteChunks: 0,
      triggered: 0,
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const results = await Promise.allSettled(
    incomplete.map(async (chunk) => {
      const response = await fetch(`${baseUrl}/api/jobs/process-chunk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunkId: chunk.id, versionId }),
      });
      return { chunkId: chunk.id, success: response.ok };
    })
  );

  const triggered = results.filter((r) => r.status === "fulfilled").length;

  return {
    versionId,
    incompleteChunks: incomplete.length,
    triggered,
  };
}
