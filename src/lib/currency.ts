export function currencyFromCountry(country: string | null | undefined) {
  const c = (country || "").toUpperCase();

  if (c === "IN") return "INR";
  if (c === "US") return "USD";

  const EUR = new Set([
    "AT",
    "BE",
    "CY",
    "EE",
    "FI",
    "FR",
    "DE",
    "GR",
    "IE",
    "IT",
    "LV",
    "LT",
    "LU",
    "MT",
    "NL",
    "PT",
    "SK",
    "SI",
    "ES",
  ]);
  if (EUR.has(c)) return "EUR";

  if (c === "GB") return "GBP";
  if (c === "CA") return "CAD";
  if (c === "AU") return "AUD";
  if (c === "SG") return "SGD";

  return "INR";
}
