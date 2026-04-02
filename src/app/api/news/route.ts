import { NextResponse } from "next/server";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description: string;
  category: string;
}

// HR 관련 뉴스 쿼리 목록
const NEWS_QUERIES = [
  { query: "인사노무 OR 노동부 OR 근로기준법", category: "노동법·정책" },
  { query: "최저임금 2026", category: "최저임금" },
  { query: "퇴직금 OR 퇴직급여 OR 퇴직연금", category: "퇴직·연금" },
  { query: "육아휴직 OR 출산휴가 OR 육아기근로시간", category: "육아·휴직" },
  { query: "직장내괴롭힘 OR 산업재해 OR 중대재해", category: "안전·인권" },
];

// CDATA 제거 및 HTML 태그 제거 유틸
function stripHtml(str: string): string {
  return str
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// XML에서 태그 내용 추출
function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

// Google News RSS URL 생성
function buildRssUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;
}

// 단일 쿼리 RSS 파싱
async function fetchRssFeed(query: string, category: string): Promise<NewsItem[]> {
  try {
    const url = buildRssUrl(query);
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; HRToolkit/1.0; +https://hrtoolkit.co.kr)",
        Accept: "application/rss+xml, application/xml, text/xml",
      },
      next: { revalidate: 1800 }, // 30분 캐시
    });

    if (!res.ok) return [];

    const xml = await res.text();

    // <item> 블록 추출
    const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];

    return itemBlocks.slice(0, 5).map((block) => {
      const rawTitle = extractTag(block, "title");
      const link = extractTag(block, "link") || block.match(/<link\s*\/?>(.*?)<\/link>/i)?.[1] || "";
      const pubDate = extractTag(block, "pubDate");
      const source = extractTag(block, "source");
      const description = extractTag(block, "description");

      // Google News 제목에서 " - 매체명" 부분 분리
      const titleParts = rawTitle.split(" - ");
      const mediaName = titleParts.length > 1 ? titleParts[titleParts.length - 1] : source;
      const title = titleParts.slice(0, -1).join(" - ") || rawTitle;

      return {
        title: title.trim(),
        link: link.trim(),
        pubDate: pubDate.trim(),
        source: (mediaName || source || "뉴스").trim(),
        description: description.slice(0, 120).trim(),
        category,
      };
    });
  } catch (err) {
    console.error(`RSS 파싱 오류 [${category}]:`, err);
    return [];
  }
}

// 날짜 기준 정렬 (최신순)
function sortByDate(items: NewsItem[]): NewsItem[] {
  return items.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return db - da;
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "전체";

    const queries =
      category === "전체"
        ? NEWS_QUERIES
        : NEWS_QUERIES.filter((q) => q.category === category);

    // 병렬 RSS 패치
    const results = await Promise.all(
      queries.map((q) => fetchRssFeed(q.query, q.category))
    );

    const allItems = sortByDate(results.flat());

    // 중복 링크 제거
    const seen = new Set<string>();
    const unique = allItems.filter((item) => {
      if (!item.title || seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    });

    return NextResponse.json({
      items: unique.slice(0, 30),
      categories: NEWS_QUERIES.map((q) => q.category),
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("뉴스 API 오류:", error);
    return NextResponse.json(
      { error: "뉴스를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
