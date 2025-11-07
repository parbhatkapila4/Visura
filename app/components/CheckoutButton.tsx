"use client";

import { useEffect, useState } from "react";
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const SYMBOL: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "$",
  AUD: "$",
  SGD: "$",
};

export const AMOUNT_BY_CURRENCY: Record<string, number> = {
  INR: 1770,
  USD: 20,
  EUR: 17,
};

export function useResolvedCurrency(defaultCurrency = "INR") {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/geo")
      .then((r) => r.json())
      .then(({ currency }) => {
        setCurrency(currency || defaultCurrency);
      })
      .finally(() => setLoading(false));
  }, [defaultCurrency]);

  return { currency, loading } as const;
}

export default function CheckoutButton({
  amount = 20,
  receiptId = `rcpt_${Date.now()}`,
  overrides,
}: {
  amount?: number;
  receiptId?: string;
  overrides?: Record<string, number>;
}) {
  const { currency, loading } = useResolvedCurrency();
  const resolvedAmount = overrides?.[currency] ?? AMOUNT_BY_CURRENCY[currency] ?? amount;

  async function pay() {
    const { orderId, key } = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: resolvedAmount, receiptId }),
    }).then((r) => r.json());

    if (!window.Razorpay) {
      await new Promise<void>((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => res();
        s.onerror = () => rej(new Error("Failed to load Razorpay"));
        document.body.appendChild(s);
      });
    }

    const rzp = new window.Razorpay({
      key,
      order_id: orderId,
      name: "Visura",
      description: "Payment",
      notes: { receiptId },
      handler: async (response: any) => {
        await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        });
      },
    });

    rzp.open();
  }

  const sym = SYMBOL[currency] ?? "";
  return (
    <button
      onClick={pay}
      disabled={loading}
      className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-[#F97316]/40 bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#F97316] px-6 py-3 text-sm font-semibold text-black shadow-[0_22px_48px_-18px_rgba(249,115,22,0.55)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070809] hover:shadow-[0_28px_60px_-18px_rgba(249,115,22,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <span className="absolute inset-0 animate-[shine_1.8s_linear_infinite] bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.6)_50%,rgba(255,255,255,0)_100%)]" />
      </span>
      <span className="relative flex items-center gap-2 text-black">
        <span className="inline-flex h-2 w-2 rounded-full bg-black/60 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
        {loading
          ? "Preparing checkout…"
          : `Pay ${sym}${resolvedAmount} (${currency})`}
      </span>
    </button>
  );
}

