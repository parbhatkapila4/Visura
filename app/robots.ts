import type { MetadataRoute } from "next";
import { BASE_URL } from "./sitemap";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/upload",
        "/summaries/",
        "/chatbot/",
        "/workspaces",
        "/checkout",
        "/sign-in",
        "/sign-up",
      ],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
