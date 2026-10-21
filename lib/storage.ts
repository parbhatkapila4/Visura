import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { logger } from "./logger";
export const FILE_BUCKET = "pdf";
const SIGNED_URL_SECONDS = 300;

let admin: SupabaseClient | null | undefined;
function adminClient(): SupabaseClient | null {
  if (admin !== undefined) return admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  admin =
    url && key
      ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
      : null;
  return admin;
}

export function storagePathFrom(
  stored: string | null | undefined,
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
): string | null {
  if (!stored) return null;

  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(stored)) {
    const path = stored.replace(/^\/+/, "");
    return path || null;
  }

  let url: URL;
  try {
    url = new URL(stored);
    if (supabaseUrl && url.host !== new URL(supabaseUrl).host) return null;
  } catch {
    return null;
  }

  const match = url.pathname.match(
    /^\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/
  );
  if (!match || match[1] !== FILE_BUCKET) return null;
  try {
    return decodeURI(match[2]);
  } catch {
    return null;
  }
}
export function isOwnStoredFile(stored: string | null | undefined, userId: string): boolean {
  const path = storagePathFrom(stored);
  return Boolean(
    path && userId && path.startsWith(`${userId}/`) && !path.split("/").includes("..")
  );
}
export async function signedFileUrl(
  stored: string,
  { ownerId, expiresInSeconds = SIGNED_URL_SECONDS }: { ownerId: string; expiresInSeconds?: number }
): Promise<string> {
  if (!isOwnStoredFile(stored, ownerId)) {
    throw new Error("That file is not in this account's uploads.");
  }
  const path = storagePathFrom(stored)!;

  const client = adminClient();
  if (!client) {
    logger.warn("SUPABASE_SERVICE_ROLE_KEY is not set; reading a stored file by its public URL");
    return supabasePublicUrl(path);
  }

  const { data, error } = await client.storage
    .from(FILE_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error || !data?.signedUrl) {
    throw new Error(`Could not open a stored file: ${error?.message ?? "no signed URL returned"}`);
  }
  return data.signedUrl;
}

function supabasePublicUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/+$/, "");
  return encodeURI(`${base}/storage/v1/object/public/${FILE_BUCKET}/${path}`);
}
