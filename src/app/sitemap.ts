import { MetadataRoute } from "next";

const BASE_URL = "https://hrtoolkit.co.kr";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 정적 페이지 목록
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/annual-leave`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/retirement-pay`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/retirement-tax`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/salary`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/minimum-wage`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/legal-search`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/glossary`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/articles`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/notices`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  // TODO: 아티클 개별 페이지 추가
  // articles.json에서 slug를 읽어 동적으로 추가 예시:
  // import articlesData from "@/data/articles.json";
  // const articleRoutes = articlesData.map((a) => ({
  //   url: `${BASE_URL}/articles/${a.slug}`,
  //   lastModified: new Date(a.updatedAt),
  //   changeFrequency: "monthly" as const,
  //   priority: 0.7,
  // }));
  // return [...staticRoutes, ...articleRoutes];

  return staticRoutes;
}
