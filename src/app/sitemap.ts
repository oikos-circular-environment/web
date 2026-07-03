import type { MetadataRoute } from "next";

const siteUrl = "https://oikos.company";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/politica-de-privacidade", "/termos-de-uso", "/suporte"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
