"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Zap } from "lucide-react";
const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export default function PlanBadge() {
  const { user, isLoaded } = useUser();
  const [planName, setPlanName] = useState("Free");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user?.id) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    fetch("/api/user/plan")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setPlanName(PLAN_LABELS[data.plan] ?? "Free");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error fetching plan:", error);
        setPlanName("Free");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, isLoaded]);

  if (!isLoaded || !user?.id || isLoading) return null;

  const isPro = planName === "Pro";
  const isPaid = planName === "Starter";
  const isFree = planName === "Free";

  return (
    <Badge
      variant="outline"
      className={cn(
        "hidden lg:flex flex-row items-center rounded-full px-3 py-1 border",
        isPro && "bg-purple-100 border-orange-300 text-black",
        isPaid && "bg-white/60  text-black",
        isFree && "bg-gray-100 border-gray-300 text-gray-700"
      )}
    >
      {isPro ? (
        <Crown className="w-3 h-3 mr-1 text-purple-600" />
      ) : isPaid ? (
        <Zap className="w-3 h-3 mr-1 text-blue-600" />
      ) : (
        <Crown className="w-3 h-3 mr-1 text-gray-500" />
      )}
      {planName}
    </Badge>
  );
}
