import { createHmac, timingSafeEqual } from "crypto";
import { logger } from "./logger";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

export function signInternalRequest(
  method: string,
  path: string,
  body: string,
  timestamp: number
): string {
  if (!INTERNAL_API_SECRET) {
    throw new Error("INTERNAL_API_SECRET environment variable not set");
  }

  const payload = `${method}:${path}:${body}:${timestamp}`;
  const signature = createHmac("sha256", INTERNAL_API_SECRET)
    .update(payload)
    .digest("hex");

  return signature;
}


export function verifyInternalRequest(
  method: string,
  path: string,
  body: string,
  timestamp: number,
  providedSignature: string
): boolean {
  if (!INTERNAL_API_SECRET) {
    logger.warn("INTERNAL_API_SECRET not configured, rejecting internal request");
    return false;
  }

 
  const now = Date.now();
  const timeDiff = Math.abs(now - timestamp);
  const maxAge = 5 * 60 * 1000;

  if (timeDiff > maxAge) {
    logger.warn("Internal request timestamp too old or too far in future", {
      timestamp,
      now,
      timeDiff,
    });
    return false;
  }

  const expectedSignature = signInternalRequest(method, path, body, timestamp);

  
  if (expectedSignature.length !== providedSignature.length) {
    return false;
  }

  try {
    return timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature)
    );
  } catch {
    return false;
  }
}


export async function requireInternalAuth(request: Request): Promise<boolean> {
  const signature = request.headers.get("X-Internal-Signature");
  const timestamp = request.headers.get("X-Internal-Timestamp");

  if (!signature || !timestamp) {
    logger.warn("Internal request missing required headers", {
      hasSignature: !!signature,
      hasTimestamp: !!timestamp,
    });
    return false;
  }

  const timestampNum = parseInt(timestamp, 10);
  if (isNaN(timestampNum)) {
    logger.warn("Invalid timestamp in internal request", { timestamp });
    return false;
  }

  const method = request.method;
  const url = new URL(request.url);
  const path = url.pathname + url.search;

  
  let body = "";
  try {
    const clonedRequest = request.clone();
    body = await clonedRequest.text();
  } catch (error) {
    logger.warn("Failed to read request body for internal auth", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const isValid = verifyInternalRequest(
    method,
    path,
    body,
    timestampNum,
    signature
  );

  if (!isValid) {
    logger.warn("Internal request signature verification failed", {
      method,
      path,
      timestamp: timestampNum,
    });
  }

  return isValid;
}


export function createInternalRequestOptions(
  method: string,
  path: string,
  body?: string
): { headers: HeadersInit } {
  const timestamp = Date.now();
  const signature = signInternalRequest(method, path, body || "", timestamp);

  return {
    headers: {
      "X-Internal-Signature": signature,
      "X-Internal-Timestamp": timestamp.toString(),
      "Content-Type": "application/json",
    },
  };
}
