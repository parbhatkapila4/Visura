import { describe, it, expect, afterEach } from "vitest";
import { hasCronSecret } from "@/lib/cron-auth";

const call = (authorization?: string) =>
  new Request("https://visura.test/api/cron/recover-versions", {
    headers: authorization ? { authorization } : {},
  });

describe("hasCronSecret", () => {
  const original = process.env.CRON_SECRET;
  afterEach(() => {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  });

  it("refuses everything when CRON_SECRET is unset, including the old bypass", () => {
    delete process.env.CRON_SECRET;
    expect(hasCronSecret(call("Bearer undefined"))).toBe(false);
    expect(hasCronSecret(call("Bearer "))).toBe(false);
    expect(hasCronSecret(call())).toBe(false);
  });

  it("refuses when CRON_SECRET is blank", () => {
    process.env.CRON_SECRET = "   ";
    expect(hasCronSecret(call("Bearer    "))).toBe(false);
  });

  it("accepts exactly the configured secret", () => {
    process.env.CRON_SECRET = "s3cret-value";
    expect(hasCronSecret(call("Bearer s3cret-value"))).toBe(true);
    expect(hasCronSecret(call("Bearer s3cret-valu"))).toBe(false);
    expect(hasCronSecret(call("bearer s3cret-value"))).toBe(false);
    expect(hasCronSecret(call())).toBe(false);
  });
});
