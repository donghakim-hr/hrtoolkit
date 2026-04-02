"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Newspaper,
  RefreshCw,
  ExternalLink,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";
import type { NewsItem } from "@/app/api/news/route";

const CATEGORY_COLORS: Record<string, string> = {
  "노동법·정책": "bg-blue-100 text-blue-700",
  "최저임금": "bg-teal-100 text-teal-700",
  "퇴직·연금": "bg-sky-100 text-sky-700",
  "육아·휴직": "bg-pink-100 text-pink-700",
  "안전·인권": "bg-red-100 text-red-700",
};

const CATEGORIES = ["전체", "노동법·정책", "최저임금", "퇴직·연금", "육아·휴직", "안전·인권"];

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60);
    if (diff < 60) return `${diff}분 전`;
    if (diff < 60 * 24) return `${Math.floor(diff / 60)}시간 전`;
    if (diff < 60 * 24 * 7) return `${Math.floor(diff / 60 / 24)}일 전`;
    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fetchedAt, setFetchedAt] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = useCallback(async (cat: string, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const params = cat !== "전체" ? `?category=${encodeURIComponent(cat)}` : "";
      const res = await fetch(`/api/news${params}`, {
        cache: isRefresh ? "no-store" : "default",
      });
      if (!res.ok) throw new Error("뉴스를 불러오지 못했습니다.");
      const data = await res.json();
      setItems(data.items || []);
      setAllCategories(data.categories || []);
      setFetchedAt(data.fetchedAt || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory, fetchNews]);

  const filteredItems =
    activeCategory === "전체"
      ? items
      : items.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center text-gray-400 hover:text-blue-600 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />홈
              </Link>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-1.5">
                <Newspaper className="h-4 w-4 text-gray-500" />
                <h1 className="text-sm font-semibold text-gray-700">인사·노무 주요 뉴스</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {fetchedAt && (
                <span className="text-xs text-gray-400 hidden sm:block">
                  {formatDate(fetchedAt)} 기준
                </span>
              )}
              <button
                onClick={() => fetchNews(activeCategory, true)}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                새로고침
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 안내 문구 */}
        <p className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          Google News RSS 기반으로 인사·노무 관련 최신 뉴스를 수집합니다. 뉴스 내용은 각 매체의 기사로 연결됩니다.
        </p>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeCategory === cat
                  ? cat === "전체"
                    ? "bg-gray-800 text-white border-gray-800"
                    : `${CATEGORY_COLORS[cat]?.replace("text-", "border-").replace("bg-", "bg-") ?? "bg-blue-100 text-blue-700"} border-transparent`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
              {cat !== "전체" && allCategories.includes(cat) && (
                <span className="ml-1 opacity-60">
                  {items.filter((i) => i.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 뉴스 목록 */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-4 w-16 bg-gray-100 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-gray-400">
            <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => fetchNews(activeCategory, true)}
              className="mt-3 text-xs text-blue-500 hover:underline"
            >
              다시 시도
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">표시할 뉴스가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item, idx) => (
              <a
                key={idx}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3.5 hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                {/* 카테고리 배지 */}
                <span
                  className={`mt-0.5 flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                    CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.category}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Tag className="h-3 w-3" />
                      {item.source}
                    </span>
                    {item.pubDate && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatDate(item.pubDate)}
                      </span>
                    )}
                  </div>
                </div>

                <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
              </a>
            ))}
          </div>
        )}

        {/* 하단 면책 */}
        <p className="mt-8 text-xs text-gray-300 text-center">
          본 뉴스 목록은 외부 RSS 피드에서 자동 수집됩니다. HR-Toolkit은 뉴스 내용의 정확성에 대해 책임지지 않습니다.
        </p>
      </main>
    </div>
  );
}
