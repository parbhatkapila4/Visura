
import { logger } from "./logger";
import { cached } from "./cache";
import { hashContent } from "./versioned-documents";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const APP_REFERER = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_TITLE = "Visura";

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const textHash = hashContent(text);
  const cacheKey = `embedding:${textHash}`;

  return cached(
    cacheKey,
    async () => {
      try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": APP_REFERER,
            "X-Title": APP_TITLE,
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: text,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error("Embedding generation failed", undefined, {
            status: response.status,
            error: errorText.substring(0, 200),
          });
          throw new Error(`Embedding API failed: ${response.status}`);
        }

        const data = await response.json();
        const embedding = data.data?.[0]?.embedding;

        if (!embedding || !Array.isArray(embedding)) {
          throw new Error("Invalid embedding response");
        }

        return embedding as number[];
      } catch (error) {
        logger.error("Error generating embedding", error);
        throw error;
      }
    },
    30 * 24 * 60 * 60
  );
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

export function chunkTextForEmbedding(
  text: string,
  chunkSize: number = 500,
  overlap: number = 50
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

export async function findRelevantChunks(
  query: string,
  chunks: Array<{ text: string; index: number }>,
  topK: number = 5
): Promise<Array<{ text: string; index: number; similarity: number }>> {
  try {
    const { getOrCreateEmbedding, getOrCreateEmbeddingsBatch } = await import("./embeddings-storage");

    const queryEmbedding = await getOrCreateEmbedding(query);

    const chunkTexts = chunks.map((chunk) => chunk.text);
    const chunkEmbeddings = await getOrCreateEmbeddingsBatch(chunkTexts);

    const similarities = chunkEmbeddings.map((embedding, i) => ({
      text: chunks[i].text,
      index: chunks[i].index,
      similarity: cosineSimilarity(queryEmbedding, embedding),
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    logger.error("Error finding relevant chunks", error);
    return chunks.slice(0, topK).map((chunk) => ({
      ...chunk,
      similarity: 0,
    }));
  }
}
