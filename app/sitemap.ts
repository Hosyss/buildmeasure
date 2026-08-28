import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date("2026-08-28"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/concrete-calculator"),
      lastModified: new Date("2026-08-12"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/footing-calculator"),
      lastModified: new Date("2026-08-28"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/post-hole-concrete-calculator"),
      lastModified: new Date("2026-08-13"),
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
      url: absoluteUrl("/brick-calculator"),
      lastModified: new Date("2026-08-13"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/gravel-calculator"),
      lastModified: new Date("2026-08-13"),
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
      url: absoluteUrl("/drywall-calculator"),
      lastModified: new Date("2026-08-24"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/guides"),
      lastModified: new Date("2026-08-28"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/material-estimating-basics"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/how-many-bags-of-concrete"),
      lastModified: new Date("2026-08-12"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/how-much-concrete-for-footings"),
      lastModified: new Date("2026-08-28"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/how-many-bags-of-concrete-for-post-holes"),
      lastModified: new Date("2026-08-13"),
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
      url: absoluteUrl("/guides/how-many-bricks-do-i-need"),
      lastModified: new Date("2026-08-13"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/guides/how-much-gravel-do-i-need"),
      lastModified: new Date("2026-08-13"),
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
      url: absoluteUrl("/guides/how-many-drywall-sheets-do-i-need"),
      lastModified: new Date("2026-08-24"),
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
      lastModified: new Date("2026-08-13"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: new Date("2026-08-22"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: new Date("2026-08-22"),
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
