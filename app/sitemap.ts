import type { MetadataRoute } from "next";

const SITE = "https://s.com.do";
const now = new Date().toISOString();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/hypervisor`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/vm/about-me`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/vm/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/vm/skills`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/vm/hobbies`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/vm/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
  ];
}
