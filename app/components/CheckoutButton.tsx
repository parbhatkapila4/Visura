"use client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const USD_TO_INR = 83;

export default function CheckoutButton({
  amountInUSD,
  receiptId,
}: {
  amountInUSD: number;
  receiptId: string;
}) {
  async function pay() {
    const { orderId, key } = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountInUSD, receiptId }),
    }).then((r) => r.json());

    if (!window.Razorpay) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(s);
      });
    }

    const rzp = new window.Razorpay({
      key,
      amount: Math.round(amountInUSD * USD_TO_INR * 100),
      currency: "INR",
      name: "YourApp",
      description: "Order payment",
      order_id: orderId,
      notes: { receiptId },
      handler: async (response: any) => {
        const verify = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response),
        }).then((r) => r.json());
        // TODO: success/failure UX based on verify.ok
      },
      modal: { ondismiss: () => {} },
    });

    rzp.open();
  }

  return (
    <button
      onClick={pay}
      className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl border border-[#F97316]/40 bg-gradient-to-r from-[#F97316] via-[#FB7185] to-[#7C3AED] px-6 py-3 text-sm font-semibold text-white shadow-[0_22px_48px_-18px_rgba(124,58,237,0.55)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black hover:shadow-[0_28px_60px_-18px_rgba(249,115,22,0.55)]"
    >
      <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <span className="absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,rgba(255,255,255,0.35),rgba(255,255,255,0)_45%,rgba(255,255,255,0.35))]" />
      </span>
      <span className="relative flex items-center gap-2">
        <span className="inline-flex h-2 w-2 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
        Pay ${amountInUSD}
      </span>
    </button>
  );
}

