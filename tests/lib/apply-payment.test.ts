import { describe, it, expect, vi, beforeEach } from "vitest";

const { paymentsFetch, ordersFetch, grantPlan } = vi.hoisted(() => ({
  paymentsFetch: vi.fn(),
  ordersFetch: vi.fn(),
  grantPlan: vi.fn(),
}));

vi.mock("@/src/lib/razorpay", () => ({
  rzp: { payments: { fetch: paymentsFetch }, orders: { fetch: ordersFetch } },
}));

vi.mock("@/lib/billing", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/billing")>()),
  grantPlan,
}));

import { applyPayment } from "@/lib/apply-payment";


const ORDER = "order_123";
const PAYMENT = "pay_456";

function capturedPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: PAYMENT,
    order_id: ORDER,
    status: "captured",
    amount: 177000,
    currency: "INR",
    notes: { receiptId: "rcpt_1" },
    ...overrides,
  };
}

const proOrder = {
  id: ORDER,
  notes: { email: "buyer@example.com", userId: "user_1", plan: "pro" },
};

beforeEach(() => {
  paymentsFetch.mockReset();
  ordersFetch.mockReset();
  grantPlan.mockReset();
  grantPlan.mockImplementation(async ({ plan }) => ({ changed: true, plan }));
});

describe("applyPayment", () => {
  it("grants the plan named on the order to the account named on the order", async () => {
    ordersFetch.mockResolvedValue(proOrder);

    const result = await applyPayment({
      paymentId: PAYMENT,
      orderId: ORDER,
      payment: capturedPayment(),
    });

    expect(result).toEqual({
      kind: "applied",
      plan: "pro",
      email: "buyer@example.com",
      changed: true,
    });
    expect(grantPlan).toHaveBeenCalledWith({
      email: "buyer@example.com",
      plan: "pro",
      orderId: ORDER,
      paymentId: PAYMENT,
    });
  });

  it("uses the order from an order.paid payload without fetching it", async () => {
    await applyPayment({
      paymentId: PAYMENT,
      orderId: ORDER,
      payment: capturedPayment(),
      order: proOrder,
    });

    expect(ordersFetch).not.toHaveBeenCalled();
    expect(grantPlan).toHaveBeenCalledTimes(1);
  });

  it("ignores an account and plan in the payment's notes, which the browser controls", async () => {
    ordersFetch.mockResolvedValue({ id: ORDER, notes: [] });

    const result = await applyPayment({
      paymentId: PAYMENT,
      orderId: ORDER,
      payment: capturedPayment({ notes: { email: "attacker@example.com", plan: "pro" } }),
    });

    expect(result.kind).toBe("rejected");
    expect(grantPlan).not.toHaveBeenCalled();
  });

  it("waits for capture: an authorized payment can still be released", async () => {
    const result = await applyPayment({
      paymentId: PAYMENT,
      orderId: ORDER,
      payment: capturedPayment({ status: "authorized" }),
    });

    expect(result).toEqual({ kind: "pending", paymentStatus: "authorized" });
    expect(ordersFetch).not.toHaveBeenCalled();
    expect(grantPlan).not.toHaveBeenCalled();
  });

  it("rejects a payment that failed or was refunded", async () => {
    for (const status of ["failed", "refunded"]) {
      const result = await applyPayment({
        paymentId: PAYMENT,
        orderId: ORDER,
        payment: capturedPayment({ status }),
      });
      expect(result.kind).toBe("rejected");
    }
    expect(grantPlan).not.toHaveBeenCalled();
  });

  it("rejects a payment for less than the plan costs", async () => {
    ordersFetch.mockResolvedValue(proOrder);
    const result = await applyPayment({
      paymentId: PAYMENT,
      orderId: ORDER,
      payment: capturedPayment({ amount: 88000 }),
    });

    expect(result.kind).toBe("rejected");
    expect(grantPlan).not.toHaveBeenCalled();
  });

  it("rejects a currency the plan is not priced in", async () => {
    ordersFetch.mockResolvedValue(proOrder);

    const result = await applyPayment({
      paymentId: PAYMENT,
      orderId: ORDER,
      payment: capturedPayment({ amount: 2000, currency: "GBP" }),
    });

    expect(result.kind).toBe("rejected");
    expect(grantPlan).not.toHaveBeenCalled();
  });

  it("rejects a payment that belongs to another order", async () => {
    const result = await applyPayment({
      paymentId: PAYMENT,
      orderId: ORDER,
      payment: capturedPayment({ order_id: "order_other" }),
    });

    expect(result.kind).toBe("rejected");
    expect(grantPlan).not.toHaveBeenCalled();
  });

  it("fetches both from Razorpay when the browser only has ids", async () => {
    paymentsFetch.mockResolvedValue(capturedPayment());
    ordersFetch.mockResolvedValue(proOrder);

    const result = await applyPayment({ paymentId: PAYMENT, orderId: ORDER });

    expect(paymentsFetch).toHaveBeenCalledWith(PAYMENT);
    expect(ordersFetch).toHaveBeenCalledWith(ORDER);
    expect(result.kind).toBe("applied");
  });

  it("reports the plan the account ends up with when it already had more", async () => {
    ordersFetch.mockResolvedValue({ id: ORDER, notes: { ...proOrder.notes, plan: "starter" } });
    grantPlan.mockResolvedValue({ changed: false, plan: "pro" });

    const result = await applyPayment({
      paymentId: PAYMENT,
      orderId: ORDER,
      payment: capturedPayment({ amount: 88000 }),
    });

    expect(result).toEqual({
      kind: "applied",
      plan: "pro",
      email: "buyer@example.com",
      changed: false,
    });
  });

  it("lets a database failure propagate, so the webhook answers 500 and is retried", async () => {
    ordersFetch.mockResolvedValue(proOrder);
    grantPlan.mockRejectedValue(new Error("connection refused"));

    await expect(
      applyPayment({ paymentId: PAYMENT, orderId: ORDER, payment: capturedPayment() })
    ).rejects.toThrow("connection refused");
  });
});
