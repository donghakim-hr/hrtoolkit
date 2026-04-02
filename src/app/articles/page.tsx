import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Tag, ArrowRight, Clock } from "lucide-react";
import articlesData from "@/data/articles.json";

export const metadata: Metadata = {
  title: "아티클",
  description:
    "연차·퇴직금·최저임금·4대보험 등 HR 신입 담당자가 꼭 읽어야 할 실무 가이드. 법령 근거와 계산 예시가 포함된 실전 아티클.",
  alternates: { canonical: "https://hrtoolkit.co.kr/articles" },
  openGraph: {
    title: "아티클 | HR-Toolkit",
    description:
      "HR 신입 담당자가 꼭 읽어야 할 실무 가이드. 연차·퇴직금·최저임금·4대보험 등 법령 근거 포함.",
    url: "https://hrtoolkit.co.kr/articles",
  },
};

type Article = (typeof articlesData)[number];

const CATEGORY_COLORS: Record<string, string> = {
  "연차·휴가": "bg-blue-100 text-blue-700",
  "퇴직·퇴직금": "bg-sky-100 text-sky-700",
  "급여·임금": "bg-teal-100 text-teal-700",
  "채용·계약": "bg-violet-100 text-violet-700",
  "휴가·휴직": "bg-pink-100 text-pink-700",
  "노사관계": "bg-red-100 text-red-700",
  "고용형태": "bg-amber-100 text-amber-700",
};

const TYPE_LABELS: Record<string, string> = {
  guide: "가이드",
  news: "업데이트",
  checklist: "체크리스트",
};

const CATEGORIES = ["전체", ...Array.from(new Set(articlesData.map((a) => a.category)))];

export default function ArticlesPage() {
  const publishedArticles = articlesData.filter((a) => a.published);
  const comingSoonArticles = articlesData.filter((a) => !a.published);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-14 relative">
            <Link
              href="/"
              className="absolute left-0 flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />홈
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">HR Read</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 소개 */}
        <div className="text-center mb-10">
          <p className="text-gray-500 text-sm mb-1">HR 신입·초보 담당자를 위한</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">매뉴얼 모음</h2>
          <p className="text-gray-600 text-sm max-w-lg mx-auto">
            법령 근거와 계산 예시를 담은 실전 가이드. 읽고 바로 업무에 쓸 수 있도록 씁니다.
          </p>
        </div>

        {/* 카테고리 태그 */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {CATEGORIES.map((cat) => (
            <span
              key={cat}
              className={`px-3 py-1 rounded-full text-sm font-medium cursor-default ${
                cat === "전체"
                  ? "bg-blue-600 text-white"
                  : (CATEGORY_COLORS[cat] ?? "bg-gray-100 text-gray-600")
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        {/* 발행된 아티클 */}
        {publishedArticles.length > 0 ? (
          <div className="grid gap-4 mb-12">
            {publishedArticles.map((article: Article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          CATEGORY_COLORS[article.category] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {article.category}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {TYPE_LABELS[article.type] ?? article.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 text-sm sm:text-base">
                      {article.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{article.description}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs text-gray-400">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 mt-1 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : null}

        {/* 준비 중 아티클 (Coming Soon) */}
        {comingSoonArticles.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              곧 발행 예정
            </h3>
            <div className="grid gap-3">
              {comingSoonArticles.map((article: Article) => (
                <div
                  key={article.id}
                  className="bg-white/60 rounded-xl border border-dashed border-gray-200 p-5 opacity-70"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            CATEGORY_COLORS[article.category] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {article.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                          준비 중
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-500 text-sm">{article.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 도구 추천 */}
        <div className="mt-12 bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <p className="text-sm font-semibold text-blue-700 mb-3">아티클과 함께 쓰는 도구</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/annual-leave", label: "연차 계산기" },
              { href: "/retirement-pay", label: "퇴직급여 계산기" },
              { href: "/retirement-tax", label: "퇴직소득세 계산기" },
              { href: "/minimum-wage", label: "최저임금 확인" },
              { href: "/legal-search", label: "법령 조문 검색" },
              { href: "/glossary", label: "HR 용어사전" },
              { href: "/faq", label: "HR FAQ" },
            ].map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 text-sm rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
              >
                {tool.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
