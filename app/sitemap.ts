import type { MetadataRoute } from "next";
const PAGES: Array<{ path: string; priority: number; changeFrequency: Frequency }> = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/compare", priority: 0.9, changeFrequency: "monthly" },
  { path: "/notes/the-tests-were-green", priority: 0.8, changeFrequency: "yearly" },
  { path: "/features", priority: 0.7, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.7, changeFrequency: "monthly" },
  { path: "/docs", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.4, changeFrequency: "yearly" },
  { path: "/changelog", priority: 0.4, changeFrequency: "weekly" },
  { path: "/support", priority: 0.3, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cancellation-refund", priority: 0.2, changeFrequency: "yearly" },
  { path: "/shipping", priority: 0.2, changeFrequency: "yearly" },
];

type Frequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

export const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://visura.parbhat.dev").replace(
  /\/$/,
  ""
);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
