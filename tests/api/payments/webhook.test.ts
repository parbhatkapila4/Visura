import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";

const { paymentsFetch, ordersFetch, sqlMock } = vi.hoisted(() => ({
  paymentsFetch: vi.fn(),
  ordersFetch: vi.fn(),
  sqlMock: vi.fn(),
}));

vi.mock("@/src/lib/razorpay", () => ({
  rzp: { payments: { fetch: paymentsFetch }, orders: { fetch: ordersFetch } },
}));
vi.mock("@/lib/db", () => ({ getDbConnection: async () => sqlMock }));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { POST } from "@/app/api/payments/webhook/route";


const SECRET = "whsec_test";
const ORDER = "order_abc";
const PAYMENT = "pay_xyz";
const EMAIL = "buyer@example.com";
function capturedEvent() {
  return {
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: PAYMENT,
          order_id: ORDER,
          status: "captured",
          amount: 177000,
          currency: "INR",
          notes: { receiptId: "rcpt_1" },
        },
      },
      order: {
        entity: { id: ORDER, notes: { email: EMAIL, userId: "user_1", plan: "pro" } },
      },
    },
  };
}

function sign(raw: string) {
  return crypto.createHmac("sha256", SECRET).update(raw).digest("hex");
}

function post(raw: string, signature: string) {
  return new Request("http://localhost/api/payments/webhook", {
    method: "POST",
    headers: { "content-type": "application/json", "x-razorpay-signature": signature },
    body: raw,
  });
}
function sqlCall(index: number) {
  const [strings, ...values] = sqlMock.mock.calls[index];
  return { text: (strings as string[]).join(" ? ").replace(/\s+/g, " ").trim(), values };
}

beforeEach(() => {
  process.env.RAZORPAY_WEBHOOK_SECRET = SECRET;
  paymentsFetch.mockReset();
  ordersFetch.mockReset();
  sqlMock.mockReset();
  sqlMock.mockResolvedValue([{ plan: "pro" }]);
});

describe("POST /api/payments/webhook", () => {
  it("rejects a body whose signature does not match, and writes nothing", async () => {
    const raw = JSON.stringify(capturedEvent());
    const res = await POST(post(raw, "0".repeat(64)));

    expect(res.status).toBe(400);
    await expect(res.text()).resolves.toBe("Invalid signature");
    expect(sqlMock).not.toHaveBeenCalled();
    expect(paymentsFetch).not.toHaveBeenCalled();
    expect(ordersFetch).not.toHaveBeenCalled();
  });

  it("grants the plan when the signature is valid", async () => {
    const raw = JSON.stringify(capturedEvent());

    const res = await POST(post(raw, sign(raw)));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({
      received: true,
      applied: true,
      changed: true,
    });
    const insert = sqlCall(0);
    expect(insert.text).toContain("INSERT INTO users");
    expect(insert.values).toContain(EMAIL);
    expect(insert.values).toContain("pro");
    expect(insert.values).toContain(PAYMENT);
    expect(paymentsFetch).not.toHaveBeenCalled();
    expect(ordersFetch).not.toHaveBeenCalled();
  });
});
