import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, BookOpen, ExternalLink, Calendar, RefreshCw } from "lucide-react";
import articlesData from "@/data/articles.json";

type Article = (typeof articlesData)[number];

// 정적 경로 생성 (발행된 아티클만)
export function generateStaticParams() {
  return articlesData
    .filter((a) => a.published)
    .map((a) => ({ slug: a.slug }));
}

// 페이지별 메타데이터 동적 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articlesData.find((a) => a.slug === slug);

  if (!article) {
    return { title: "아티클을 찾을 수 없습니다" };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    alternates: {
      canonical: `https://hrtoolkit.co.kr/articles/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `https://hrtoolkit.co.kr/articles/${article.slug}`,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      tags: article.tags,
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "연차·휴가": "bg-blue-100 text-blue-700",
  "퇴직·퇴직금": "bg-sky-100 text-sky-700",
  "급여·임금": "bg-teal-100 text-teal-700",
  "채용·계약": "bg-violet-100 text-violet-700",
  "휴가·휴직": "bg-pink-100 text-pink-700",
  "노사관계": "bg-red-100 text-red-700",
  "고용형태": "bg-amber-100 text-amber-700",
};

const TOOL_LABELS: Record<string, string> = {
  "/annual-leave": "연차 계산기",
  "/retirement-pay": "퇴직급여 계산기",
  "/retirement-tax": "퇴직소득세 계산기",
  "/minimum-wage": "최저임금 확인",
  "/legal-search": "법령 조문 검색",
  "/glossary": "HR 용어사전",
  "/faq": "HR FAQ",
};

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articlesData.find((a) => a.slug === slug);

  if (!article || !article.published) {
    notFound();
  }

  const relatedArticles = articlesData
    .filter((a) => a.published && a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link
              href="/articles"
              className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />아티클 목록
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-sm font-bold text-gray-900">
              <BookOpen className="h-4 w-4 text-blue-600" />
              HR-Toolkit
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* 아티클 헤더 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                CATEGORY_COLORS[article.category] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {article.category}
            </span>
            {article.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 text-xs text-gray-400">
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug mb-4">
            {article.title}
          </h1>
          <p className="text-gray-500 text-base leading-relaxed mb-4">{article.description}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              발행 {article.publishedAt}
            </span>
            {article.updatedAt !== article.publishedAt && (
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                최종수정 {article.updatedAt}
              </span>
            )}
          </div>
        </div>

        {/* 본문 */}
        <div className="prose prose-gray max-w-none mb-12">
          {(article as typeof article & { content?: string }).content ? (
            <div
              dangerouslySetInnerHTML={{
                __html: (article as typeof article & { content?: string }).content!,
              }}
            />
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-700">
              이 아티클은 준비 중입니다. 곧 전체 내용이 발행됩니다.
            </div>
          )}
        </div>

        {/* 관련 법령 */}
        {article.relatedLaws.length > 0 && (
          <div className="mb-8 bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">관련 법령 조문</h2>
            <div className="flex flex-wrap gap-2">
              {article.relatedLaws.map((law) => (
                <Link
                  key={law}
                  href={`/legal-search`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-violet-300 hover:text-violet-700 transition-all"
                >
                  {law}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 관련 도구 */}
        {article.relatedTools.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">바로 써볼 수 있는 도구</h2>
            <div className="flex flex-wrap gap-2">
              {article.relatedTools.map((href) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {TOOL_LABELS[href] ?? href}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 관련 용어사전 */}
        {article.relatedGlossary.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">관련 HR 용어</h2>
            <div className="flex flex-wrap gap-2">
              {article.relatedGlossary.map((term) => (
                <Link
                  key={term}
                  href="/glossary"
                  className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg hover:bg-amber-100 transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 주의사항 */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
          <strong>주의사항</strong>: 이 아티클은 일반적인 정보 제공 목적으로 작성되었습니다.
          개별 사안에 따라 적용 기준이 달라질 수 있으며, 구체적인 법률 판단은 공인노무사 등
          전문가에게 문의하세요.
        </div>

        {/* 관련 아티클 */}
        {relatedArticles.length > 0 && (
          <div className="border-t border-gray-100 pt-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">같은 카테고리 아티클</h2>
            <div className="grid gap-3">
              {relatedArticles.map((related: Article) => (
                <Link
                  key={related.id}
                  href={`/articles/${related.slug}`}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                      {related.title}
                    </h3>
                  </div>
                  <ArrowLeft className="h-4 w-4 text-gray-300 rotate-180 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 홈으로 */}
        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            HR-Toolkit 홈으로
          </Link>
        </div>
      </main>
    </div>
  );
}
