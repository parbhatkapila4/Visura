import { getDbConnection } from "./db";
import { hashContent } from "./versioned-documents";
import { logger } from "./logger";
import { generateEmbedding } from "./embeddings";

export interface StoredEmbedding {
  id: string;
  text_hash: string;
  text: string;
  embedding: number[];
  model: string;
  created_at: Date;
}

export async function getOrCreateEmbedding(
  text: string,
  model: string = "text-embedding-3-small"
): Promise<number[]> {
  const sql = await getDbConnection();
  const textHash = hashContent(text);

  const [existing] = await sql`
    SELECT embedding, model FROM document_embeddings
    WHERE text_hash = ${textHash} AND model = ${model}
    LIMIT 1
  `;

  if (existing && existing.embedding) {
    logger.info("Embedding retrieved from database", {
      textHash,
      model,
      embeddingLength: existing.embedding.length,
    });
    return existing.embedding as number[];
  }

  logger.info("Generating new embedding", { textHash, model });
  const embedding = await generateEmbedding(text);

  sql`
    INSERT INTO document_embeddings (text_hash, text, embedding, model)
    VALUES (${textHash}, ${text.substring(0, 10000)}, ${JSON.stringify(embedding)}, ${model})
    ON CONFLICT (text_hash, model) DO NOTHING
  `.catch((error) => {
    logger.warn("Failed to store embedding in database (non-fatal)", {
      textHash,
      model,
      error: error instanceof Error ? error.message : String(error),
    });
  });

  return embedding;
}

export async function getOrCreateEmbeddingsBatch(
  texts: string[],
  model: string = "text-embedding-3-small"
): Promise<number[][]> {
  const sql = await getDbConnection();
  const textHashes = texts.map((text) => hashContent(text));

  const existing = await sql`
    SELECT text_hash, embedding FROM document_embeddings
    WHERE text_hash = ANY(${textHashes}) AND model = ${model}
  `;

  const existingMap = new Map<string, number[]>();
  for (const row of existing) {
    existingMap.set(row.text_hash as string, row.embedding as number[]);
  }

  const textsToGenerate: Array<{ text: string; hash: string; index: number }> = [];
  texts.forEach((text, index) => {
    const hash = textHashes[index];
    if (!existingMap.has(hash)) {
      textsToGenerate.push({ text, hash, index });
    }
  });

  const newEmbeddings = await Promise.all(
    textsToGenerate.map(({ text }) => generateEmbedding(text))
  );

  if (textsToGenerate.length > 0) {
    const insertPromises = textsToGenerate.map(({ text, hash }, i) =>
      sql`
        INSERT INTO document_embeddings (text_hash, text, embedding, model)
        VALUES (${hash}, ${text.substring(0, 10000)}, ${JSON.stringify(newEmbeddings[i])}, ${model})
        ON CONFLICT (text_hash, model) DO NOTHING
      `.catch((error) => {
        logger.warn("Failed to store embedding in database (non-fatal)", {
          textHash: hash,
          model,
          error: error instanceof Error ? error.message : String(error),
        });
      })
    );

    Promise.all(insertPromises).catch(() => {
    });
  }

  const allEmbeddings: number[][] = [];
  texts.forEach((text, index) => {
    const hash = textHashes[index];
    const existing = existingMap.get(hash);
    if (existing) {
      allEmbeddings.push(existing);
    } else {
      const generateIndex = textsToGenerate.findIndex((t) => t.index === index);
      allEmbeddings.push(newEmbeddings[generateIndex]);
    }
  });

  logger.info("Batch embeddings retrieved/generated", {
    total: texts.length,
    fromCache: existingMap.size,
    generated: textsToGenerate.length,
  });

  return allEmbeddings;
}
