"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export const STARTER_AMOUNT_BY_CURRENCY: Record<string, number> = {
  INR: 880,
  USD: 10,
  EUR: 9,
};

export function useResolvedCurrency(defaultCurrency = "INR") {
  const [currency, setCurrency] = useState(defaultCurrency);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetch("/api/geo")
      .then((r) => r.json())
      .then(({ currency }) => {
        if (live) setCurrency(currency || defaultCurrency);
      })
      .catch(() => {})
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [defaultCurrency]);

  return { currency, loading } as const;
}

const PRO_CLASS =
  "group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-[#F97316]/40 bg-gradient-to-r from-[#F97316] via-[#FB923C] to-[#F97316] px-6 py-3 text-sm font-semibold text-black shadow-[0_22px_48px_-18px_rgba(249,115,22,0.55)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070809] hover:shadow-[0_28px_60px_-18px_rgba(249,115,22,0.6)] disabled:cursor-not-allowed disabled:opacity-60";

type Stage = "idle" | "opening" | "confirming" | "done";

const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2 };
const PLAN_LABEL: Record<string, string> = { starter: "Starter", pro: "Pro" };
const CONFIRM_ATTEMPTS = 6;
const CONFIRM_INTERVAL_MS = 2000;
function useAccountPlan() {
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/user/plan")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (live && typeof data?.plan === "string") setPlan(data.plan);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return plan;
}
export default function CheckoutButton({
  plan = "pro",
  amount,
  receiptId = `rcpt_${Date.now()}`,
  overrides,
  className,
}: {
  plan?: "starter" | "pro";
  amount?: number;
  receiptId?: string;
  overrides?: Record<string, number>;
  className?: string;
}) {
  const { currency, loading } = useResolvedCurrency();
  const accountPlan = useAccountPlan();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const table = plan === "starter" ? STARTER_AMOUNT_BY_CURRENCY : AMOUNT_BY_CURRENCY;
  const resolvedAmount = overrides?.[currency] ?? table[currency] ?? amount;
  const priced = table[currency] !== undefined;
  const ownedLabel =
    accountPlan !== null && (PLAN_RANK[accountPlan] ?? 0) >= (PLAN_RANK[plan] ?? 0)
      ? (PLAN_LABEL[accountPlan] ?? accountPlan)
      : null;

  async function pay() {
    setError(null);
    setStage("opening");
    try {
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, receiptId }),
      });

      if (res.status === 401) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      const order = await res.json();
      if (!res.ok || !order?.orderId) {
        throw new Error(
          order?.error || "Could not start the payment. Try again, or email parbhat@parbhat.dev."
        );
      }

      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = () =>
            reject(
              new Error("Could not load Razorpay checkout. Check your connection and try again.")
            );
          document.body.appendChild(s);
        });
      }

      const rzp = new window.Razorpay({
        key: order.key,
        order_id: order.orderId,
        name: "Visura",
        description: plan === "pro" ? "Visura Pro" : "Visura Starter",
        notes: { receiptId },
        handler: async (response: any) => {
          setStage("confirming");
          try {
            let applied: { applied?: boolean; pending?: boolean } | null = null;
            for (let attempt = 1; attempt <= CONFIRM_ATTEMPTS; attempt++) {
              applied = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }).then((r) => r.json());
              if (!applied?.pending || attempt === CONFIRM_ATTEMPTS) break;
              await new Promise((resolve) => setTimeout(resolve, CONFIRM_INTERVAL_MS));
            }

            setStage("done");
            if (!applied?.applied) {
              setError(
                "Payment received, but this page could not confirm your new plan. Refresh to check. If your limit has not changed, email parbhat@parbhat.dev with the date you paid."
              );
            }
            router.refresh();
          } catch {
            setStage("done");
            setError(
              "Payment received, but this page could not confirm your new plan. Refresh to check. If your limit has not changed, email parbhat@parbhat.dev with the date you paid."
            );
          }
        },
        modal: {
          ondismiss: () => setStage("idle"),
        },
      });

      rzp.open();
      setStage("idle");
    } catch (e) {
      setStage("idle");
      setError(
        e instanceof Error
          ? e.message
          : "Could not start the payment. Try again, or email parbhat@parbhat.dev."
      );
    }
  }

  const sym = SYMBOL[currency] ?? "";
  const label = loading
    ? "Preparing checkout…"
    : stage === "opening"
      ? "Opening checkout…"
      : stage === "confirming"
        ? "Confirming payment…"
        : stage === "done"
          ? "Payment received"
          : ownedLabel
            ? `Your account has ${ownedLabel}`
            : !priced || resolvedAmount === undefined
              ? `Checkout can't take ${currency}`
              : `Pay ${sym}${resolvedAmount} (${currency})`;

  return (
    <>
      <button
        onClick={pay}
        disabled={loading || stage !== "idle" || !priced || ownedLabel !== null}
        className={className ?? PRO_CLASS}
      >
        <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
          <span className="absolute inset-0 animate-[shine_1.8s_linear_infinite] bg-[linear-gradient(120deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.6)_50%,rgba(255,255,255,0)_100%)]" />
        </span>
        <span className="relative flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-current opacity-60 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
          {label}
        </span>
      </button>
      {error && (
        <p className="mt-2 text-[11px] text-center text-amber-300/90 leading-relaxed" role="status">
          {error}
        </p>
      )}
    </>
  );
}
