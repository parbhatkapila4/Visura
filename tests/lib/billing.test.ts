import { describe, it, expect } from "vitest";
import {
  FREE_DOCUMENT_LIMIT,
  PLANS,
  amountFor,
  documentLimitFor,
  isPaidPlan,
  isUpgrade,
  paymentCoversPlan,
  subunitsFor,
} from "@/lib/billing";
import { AMOUNT_BY_CURRENCY, STARTER_AMOUNT_BY_CURRENCY } from "@/app/components/CheckoutButton";
describe("plan pricing", () => {
  it("charges the published prices", () => {
    expect(amountFor("pro", "INR")).toBe(1770);
    expect(amountFor("pro", "EUR")).toBe(17);
    expect(amountFor("pro", "USD")).toBe(20);
    expect(amountFor("starter", "INR")).toBe(880);
    expect(amountFor("starter", "EUR")).toBe(9);
    expect(amountFor("starter", "USD")).toBe(10);
  });

  it("refuses a currency it has no price for, rather than guessing one", () => {
    expect(amountFor("pro", "JPY")).toBeNull();
    expect(amountFor("starter", "GBP")).toBeNull();
  });

  it("never prices Starter above Pro", () => {
    for (const currency of Object.keys(PLANS.pro.amounts)) {
      const starter = amountFor("starter", currency);
      const pro = amountFor("pro", currency);
      expect(starter).not.toBeNull();
      expect(pro).not.toBeNull();
      expect(starter!).toBeLessThan(pro!);
    }
  });
});

describe("isPaidPlan", () => {
  it("accepts only the two purchasable plans", () => {
    expect(isPaidPlan("starter")).toBe(true);
    expect(isPaidPlan("pro")).toBe(true);
  });

  it("rejects free, and anything else a request body might carry", () => {
    expect(isPaidPlan("free")).toBe(false);
    expect(isPaidPlan("PRO")).toBe(false);
    expect(isPaidPlan("")).toBe(false);
    expect(isPaidPlan(null)).toBe(false);
    expect(isPaidPlan(undefined)).toBe(false);
    expect(isPaidPlan(1770)).toBe(false);
    expect(isPaidPlan({ id: "pro" })).toBe(false);
    expect(isPaidPlan(["pro"])).toBe(false);
  });
});

describe("documentLimitFor", () => {
  it("gives paid accounts what they paid for", () => {
    expect(documentLimitFor("starter")).toBe(10);
    expect(documentLimitFor("pro")).toBe(1000);
  });

  it("falls back to the free limit for anything it does not recognise", () => {
    expect(documentLimitFor("free")).toBe(FREE_DOCUMENT_LIMIT);
    expect(documentLimitFor(null)).toBe(FREE_DOCUMENT_LIMIT);
    expect(documentLimitFor(undefined)).toBe(FREE_DOCUMENT_LIMIT);
    expect(documentLimitFor("price_1S82BQIDKmPOE5aTwhecvlb9")).toBe(FREE_DOCUMENT_LIMIT);
  });
});

describe("the prices shown on checkout", () => {
  it("match what the server will actually charge", () => {
    for (const [currency, shown] of Object.entries(AMOUNT_BY_CURRENCY)) {
      expect(amountFor("pro", currency)).toBe(shown);
    }
    for (const [currency, shown] of Object.entries(STARTER_AMOUNT_BY_CURRENCY)) {
      expect(amountFor("starter", currency)).toBe(shown);
    }
  });

  it("quote every currency the server prices, so nobody sees a wrong default", () => {
    expect(Object.keys(AMOUNT_BY_CURRENCY).sort()).toEqual(Object.keys(PLANS.pro.amounts).sort());
    expect(Object.keys(STARTER_AMOUNT_BY_CURRENCY).sort()).toEqual(
      Object.keys(PLANS.starter.amounts).sort()
    );
  });
});

describe("subunitsFor", () => {
  it("prices in the smallest unit, which is what Razorpay charges and reports", () => {
    expect(subunitsFor("pro", "INR")).toBe(177000);
    expect(subunitsFor("starter", "INR")).toBe(88000);
    expect(subunitsFor("pro", "USD")).toBe(2000);
    expect(subunitsFor("starter", "EUR")).toBe(900);
  });

  it("has no price where the plan table has none", () => {
    expect(subunitsFor("pro", "GBP")).toBeNull();
    expect(subunitsFor("starter", "SGD")).toBeNull();
  });
});

describe("paymentCoversPlan", () => {
  it("accepts a payment of the plan's price in a priced currency", () => {
    expect(paymentCoversPlan("pro", { amount: 177000, currency: "INR" })).toBe(true);
    expect(paymentCoversPlan("starter", { amount: 1000, currency: "USD" })).toBe(true);
    expect(paymentCoversPlan("pro", { amount: "1700", currency: "EUR" })).toBe(true);
  });

  it("refuses less than the price, which a partial payment or a hand-made order could be", () => {
    expect(paymentCoversPlan("pro", { amount: 176999, currency: "INR" })).toBe(false);
    expect(paymentCoversPlan("pro", { amount: 100, currency: "INR" })).toBe(false);
    expect(paymentCoversPlan("pro", { amount: 88000, currency: "INR" })).toBe(false);
  });

  it("refuses a currency the plan is not priced in, whatever the number", () => {
    expect(paymentCoversPlan("pro", { amount: 999999, currency: "GBP" })).toBe(false);
    expect(paymentCoversPlan("pro", { amount: 177000, currency: undefined })).toBe(false);
  });

  it("refuses an amount that is not a number", () => {
    expect(paymentCoversPlan("pro", { amount: "lots", currency: "INR" })).toBe(false);
    expect(paymentCoversPlan("pro", { amount: undefined, currency: "INR" })).toBe(false);
  });
});

describe("isUpgrade", () => {
  it("lets a free account buy either plan, and Starter buy Pro", () => {
    expect(isUpgrade("free", "starter")).toBe(true);
    expect(isUpgrade("free", "pro")).toBe(true);
    expect(isUpgrade("starter", "pro")).toBe(true);
  });

  it("never sells a plan that would change nothing", () => {
    expect(isUpgrade("pro", "starter")).toBe(false);
    expect(isUpgrade("pro", "pro")).toBe(false);
    expect(isUpgrade("starter", "starter")).toBe(false);
  });
});
