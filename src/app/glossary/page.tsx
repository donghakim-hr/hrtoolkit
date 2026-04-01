"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, BookMarked, Search, Star, X, ExternalLink, Scale } from "lucide-react";
import glossaryData from "@/data/glossary.json";

interface RelatedLaw {
  name: string;
  content: string;
}

interface RelatedTool {
  name: string;
  href: string;
}

interface GlossaryItem {
  id: number;
  term: string;
  category: string;
  definition: string;
  practicalExample: string;
  relatedLaws: RelatedLaw[];
  relatedTools: RelatedTool[];
}

const CATEGORIES = ["전체", "급여", "근로시간", "퇴직", "채용", "휴가·휴직", "노사관계"];

const CATEGORY_COLORS: Record<string, string> = {
  "급여": "bg-green-100 text-green-700",
  "근로시간": "bg-blue-100 text-blue-700",
  "퇴직": "bg-purple-100 text-purple-700",
  "채용": "bg-orange-100 text-orange-700",
  "휴가·휴직": "bg-teal-100 text-teal-700",
  "노사관계": "bg-red-100 text-red-700",
};

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryItem | null>(null);
  const [favorites, setFavorites] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("glossary-favorites") || "[]");
    } catch {
      return [];
    }
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem("glossary-favorites", JSON.stringify(next));
      return next;
    });
  };

  const filtered = useMemo(() => {
    return (glossaryData as GlossaryItem[]).filter((item) => {
      const matchSearch =
        search === "" ||
        item.term.includes(search) ||
        item.definition.includes(search) ||
        item.practicalExample.includes(search);
      const matchCategory =
        selectedCategory === "전체" || item.category === selectedCategory;
      const matchFavorite = !showFavoritesOnly || favorites.includes(item.id);
      return matchSearch && matchCategory && matchFavorite;
    });
  }, [search, selectedCategory, showFavoritesOnly, favorites]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16 relative">
            <Link
              href="/"
              className="absolute left-0 flex items-center text-black hover:text-black transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              홈으로
            </Link>
            <div className="flex items-center space-x-3">
              <BookMarked className="h-6 w-6 text-yellow-600" />
              <h1 className="text-xl font-bold text-black">HR 용어사전</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 소개 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-2xl font-bold text-black mb-2">HR 핵심 용어 {glossaryData.length}개</h2>
          <p className="text-gray-600">
            HR 신입이 꼭 알아야 할 용어를 법령 조문과 실무 예시로 정리했습니다.
            카드를 클릭하면 상세 내용을 확인할 수 있습니다.
          </p>
        </div>

        {/* 검색 + 필터 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 space-y-4">
          {/* 검색바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="용어 또는 내용 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 카테고리 탭 */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ml-auto ${
                showFavoritesOnly
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Star className="h-3.5 w-3.5 mr-1" />
              즐겨찾기 {favorites.length > 0 && `(${favorites.length})`}
            </button>
          </div>
        </div>

        {/* 결과 수 */}
        <p className="text-sm text-gray-500 mb-4">
          {filtered.length}개 용어
          {search && <span className="ml-1">· &quot;{search}&quot; 검색 결과</span>}
        </p>

        {/* 용어 카드 그리드 */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedTerm(item)}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-yellow-300 transition-all duration-200 group relative"
              >
                {/* 즐겨찾기 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  className="absolute top-4 right-4 text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  <Star
                    className={`h-4 w-4 ${favorites.includes(item.id) ? "fill-yellow-400 text-yellow-400" : ""}`}
                  />
                </button>

                <div className="mb-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      CATEGORY_COLORS[item.category] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-black mb-2 group-hover:text-yellow-700 transition-colors">
                  {item.term}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">{item.definition}</p>

                {item.relatedLaws.length > 0 && (
                  <div className="mt-3 flex items-center text-xs text-gray-400">
                    <Scale className="h-3 w-3 mr-1" />
                    {item.relatedLaws[0].name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedTerm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTerm(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
              <div>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${
                    CATEGORY_COLORS[selectedTerm.category] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  {selectedTerm.category}
                </span>
                <h2 className="text-2xl font-bold text-black">{selectedTerm.term}</h2>
              </div>
              <div className="flex items-center space-x-2 ml-4 mt-1">
                <button
                  onClick={() => toggleFavorite(selectedTerm.id)}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <Star
                    className={`h-5 w-5 ${
                      favorites.includes(selectedTerm.id)
                        ? "fill-yellow-400 text-yellow-400"
                        : ""
                    }`}
                  />
                </button>
                <button
                  onClick={() => setSelectedTerm(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 모달 내용 */}
            <div className="px-6 py-5 space-y-6">
              {/* 정의 */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">정의</h3>
                <p className="text-black leading-relaxed">{selectedTerm.definition}</p>
              </section>

              {/* 실무 예시 */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">실무 예시</h3>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <p className="text-black text-sm leading-relaxed">{selectedTerm.practicalExample}</p>
                </div>
              </section>

              {/* 관련 법령 */}
              {selectedTerm.relatedLaws.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">관련 법령</h3>
                  <div className="space-y-3">
                    {selectedTerm.relatedLaws.map((law, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Scale className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-blue-700">{law.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">&quot;{law.content}&quot;</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 연관 계산기 */}
              {selectedTerm.relatedTools.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">연관 계산기</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTerm.relatedTools.map((tool, i) => (
                      <Link
                        key={i}
                        href={tool.href}
                        onClick={() => setSelectedTerm(null)}
                        className="flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        {tool.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
