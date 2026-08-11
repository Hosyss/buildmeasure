import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/concrete-calculator"),
      lastModified: new Date("2026-07-31"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/paint-calculator"),
      lastModified: new Date("2026-07-31"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/tile-calculator"),
      lastModified: new Date("2026-07-31"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/gravel-calculator"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/mulch-calculator"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/guides/material-estimating-basics"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/how-many-bags-of-concrete"),
      lastModified: new Date("2026-08-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/how-much-paint-do-i-need"),
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/how-many-tiles-do-i-need"),
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/how-much-gravel-do-i-need"),
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/how-much-mulch-do-i-need"),
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/methodology"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
