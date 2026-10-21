import { timingSafeEqual } from "crypto";
import { logger } from "./logger";

export function hasCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    logger.error("CRON_SECRET is not set; refusing the scheduled call");
    return false;
  }

  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
