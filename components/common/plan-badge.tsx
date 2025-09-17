"use client";

import { useUser } from "@clerk/nextjs";
import { pricingPlans } from "@/utils/constants";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown, Zap } from "lucide-react";

export default function PlanBadge() {
  const { user, isLoaded } = useUser();
  const [planName, setPlanName] = useState("Free");
  const [priceId, setPriceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user?.id) {
      setIsLoading(false);
      return;
    }

    const email = user?.emailAddresses?.[0]?.emailAddress;

    if (email) {
      fetch(`/api/user/price-id?email=${encodeURIComponent(email)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.priceId) {
            setPriceId(data.priceId);
            const plan = pricingPlans.find(
              (plan) => plan.priceId === data.priceId
            );
            if (plan) {
              setPlanName(plan.name);
            }
          } else {
            setPlanName("Free");
            setPriceId(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching price ID:", error);
          setPlanName("Free");
          setPriceId(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user, isLoaded]);

  if (!isLoaded || !user?.id || isLoading) return null;

  const isPro = planName === "Pro";
  const isBasic = planName === "Basic";
  const isFree = planName === "Free";

  return (
    <Badge
      variant="outline"
      className={cn(
        "hidden lg:flex flex-row items-center rounded-full px-3 py-1 border",
        isPro && "bg-purple-100 border-purple-300 text-purple-800",
        isBasic && "bg-blue-100 border-blue-300 text-blue-800",
        isFree && "bg-gray-100 border-gray-300 text-gray-700"
      )}
    >
      {isPro ? (
        <Crown className="w-3 h-3 mr-1 text-purple-600" />
      ) : isBasic ? (
        <Zap className="w-3 h-3 mr-1 text-blue-600" />
      ) : (
        <Crown className="w-3 h-3 mr-1 text-gray-500" />
      )}
      {planName}
    </Badge>
  );
}
