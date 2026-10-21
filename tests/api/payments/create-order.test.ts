import { describe, it, expect, vi, beforeEach } from "vitest";

const { authMock, currentUserMock, ordersCreate, headersMock, sqlMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  currentUserMock: vi.fn(),
  ordersCreate: vi.fn(),
  headersMock: vi.fn(),
  sqlMock: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({ auth: authMock, currentUser: currentUserMock }));
vi.mock("next/headers", () => ({ headers: headersMock }));
vi.mock("@/src/lib/razorpay", () => ({ rzp: { orders: { create: ordersCreate } } }));
vi.mock("@/lib/db", () => ({ getDbConnection: async () => sqlMock }));
vi.mock("@/lib/logger", () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

import { POST } from "@/app/api/payments/create-order/route";
import { PLANS } from "@/lib/billing";

const EMAIL = "buyer@example.com";

function post(body: unknown) {
  return new Request("http://localhost/api/payments/create-order", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  authMock.mockReset();
  currentUserMock.mockReset();
  ordersCreate.mockReset();
  headersMock.mockReset();
  sqlMock.mockReset();

  authMock.mockResolvedValue({ userId: "user_1" });
  currentUserMock.mockResolvedValue({ emailAddresses: [{ emailAddress: EMAIL }] });
  headersMock.mockResolvedValue(new Headers());
  sqlMock.mockResolvedValue([]);
  ordersCreate.mockResolvedValue({ id: "order_test" });
});

describe("POST /api/payments/create-order", () => {
  it("refuses an unauthenticated caller, and opens no order", async () => {
    authMock.mockResolvedValue({ userId: null });

    const res = await POST(post({ plan: "pro" }));
    expect(res.status).toBe(401);
    expect(ordersCreate).not.toHaveBeenCalled();
  });

  it("charges the table's price and ignores an amount in the body", async () => {
    const res = await POST(post({ plan: "pro", amount: 100 }));

    expect(res.status).toBe(200);
    expect(ordersCreate).toHaveBeenCalledTimes(1);

    const order = ordersCreate.mock.calls[0][0];
    expect(order.amount).toBe(PLANS.pro.amounts.INR * 100);
    expect(order.amount).not.toBe(100);
    expect(order.currency).toBe("INR");
    expect(order.notes).toMatchObject({ email: EMAIL, userId: "user_1", plan: "pro" });

    await expect(res.json()).resolves.toMatchObject({
      amount: PLANS.pro.amounts.INR,
      plan: "pro",
    });
  });

  it("refuses a plan that is not in the table, and opens no order", async () => {
    const res = await POST(post({ plan: "enterprise", amount: 1 }));

    expect(res.status).toBe(400);
    expect(ordersCreate).not.toHaveBeenCalled();
  });
});
