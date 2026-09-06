"use client";

import { useEffect } from "react";
import { toast } from "sonner";
export default function LandingToasts({
  showSuccess,
  showCancel,
}: {
  showSuccess: boolean;
  showCancel: boolean;
}) {
  useEffect(() => {
    if (showSuccess) {
      toast.success("Payment successful", {
        description: "Thank you — your payment went through.",
        duration: 5000,
      });
    }
    if (showCancel) {
      toast.error("Payment cancelled", {
        description: "Your payment was cancelled. You can try again anytime.",
        duration: 4000,
      });
    }
  }, [showSuccess, showCancel]);

  return null;
}
