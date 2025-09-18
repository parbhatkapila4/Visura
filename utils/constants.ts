import { isDevelopment } from "./helpers";

export const pricingPlans = [
  {
    name: "Basic",
    price: "10",
    description: "For beginners and casual users",
    items: [
      "5 PDF summaries per month",
      "Standard processing",
      "Export as text",
    ],
    id: "basic",
    paymentLink: "",
    priceId: isDevelopment
      ? "price_1S82BQIDKmPOE5aT0N1VCGT4"
      : "price_1S82BQIDKmPOE5aT0N1VCGT4",
  },
  {
    name: "Pro",
    price: "20",
    description: "For advanced users and businesses",
    items: [
      "Unlimited PDF summaries",
      "Advanced processing",
      "Priority support",
      "Export as text",
    ],
    id: "pro",
    paymentLink: "",
    priceId: isDevelopment
      ? "price_1S82BQIDKmPOE5aTwhecvlb9"
      : "price_1S82BQIDKmPOE5aTwhecvlb9",
  },
];
