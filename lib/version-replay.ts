import { getVersionById, getIncompleteChunks } from "./versioned-documents";
import { processChunkInternal } from "./chunk-processor";

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

  const results = await Promise.allSettled(
    incomplete.map(async (chunk) => {
      const result = await processChunkInternal(chunk.id, versionId);
      return { chunkId: chunk.id, success: result.success };
    })
  );

  const triggered = results.filter((r) => r.status === "fulfilled" && r.value.success).length;

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

  const results = await Promise.allSettled(
    incomplete.map(async (chunk) => {
      const result = await processChunkInternal(chunk.id, versionId);
      return { chunkId: chunk.id, success: result.success };
    })
  );

  const triggered = results.filter((r) => r.status === "fulfilled" && r.value.success).length;

  return {
    versionId,
    incompleteChunks: incomplete.length,
    triggered,
  };
}
