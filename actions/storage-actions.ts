"use server";

import { auth } from "@clerk/nextjs/server";
import { extractTextFromDocumentUrl } from "@/lib/document-text-extractor";
import { signedFileUrl } from "@/lib/storage";
export async function extractUploadedDocumentText(path: string, fileName: string): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Sign in to upload documents.");
  }
  if (typeof path !== "string" || typeof fileName !== "string") {
    throw new Error("Upload the file again.");
  }

  const url = await signedFileUrl(path, { ownerId: userId });
  return extractTextFromDocumentUrl(url, fileName);
}
