"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Star, StarOff, Edit2, Save, X } from "lucide-react";

interface Article {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  type: string;
  searchIntent: string;
  publishedAt: string;
  updatedAt: string;
  relatedTools: string[];
  relatedFaq: string[];
  relatedGlossary: string[];
  relatedLaws: string[];
  featured: boolean;
  published: boolean;
  content?: string;
}

const CATEGORIES = ["연차·휴가", "퇴직·퇴직금", "급여·임금", "채용·계약", "휴가·휴직", "노사관계", "고용형태"];
const TYPES = ["guide", "news", "checklist"];
const SEARCH_INTENTS = ["정보탐색형", "검색유입형", "북마크형"];

export default function AdminArticlesPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Article>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const res = await fetch("/api/admin/articles");
    if (res.status === 401) { router.push("/admin/login"); return; }
    if (res.ok) setArticles(await res.json());
    setLoading(false);
  }

  function startEdit(article: Article) {
    setEditingId(article.id);
    setEditForm({ ...article });
    setMessage("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
    setMessage("");
  }

  async function saveArticle() {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setArticles((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
        setMessage("저장 완료!");
        setTimeout(() => setMessage(""), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function quickToggle(article: Article, field: "published" | "featured") {
    const res = await fetch(`/api/admin/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !article[field] }),
    });
    if (res.ok) {
      const updated = await res.json();
      setArticles((prev) => prev.map((a) => (a.id === article.id ? updated : a)));
      if (editingId === article.id) setEditForm((f) => ({ ...f, [field]: !article[field] }));
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        불러오는 중...
      </div>
    );
  }

  const published = articles.filter((a) => a.published).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-black">아티클 관리</h1>
            <span className="text-sm text-gray-400">
              전체 {articles.length}개 · 발행 {published}개
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* 목록 행 */}
            <div className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      article.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {article.published ? "발행" : "미발행"}
                  </span>
                  {article.featured && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                      주요
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{article.category}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{article.type}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => quickToggle(article, "featured")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    article.featured
                      ? "text-yellow-500 hover:bg-yellow-50"
                      : "text-gray-300 hover:bg-gray-50 hover:text-gray-400"
                  }`}
                  title={article.featured ? "주요 해제" : "주요 설정"}
                >
                  {article.featured ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => quickToggle(article, "published")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    article.published
                      ? "text-green-600 hover:bg-green-50"
                      : "text-gray-300 hover:bg-gray-50 hover:text-gray-400"
                  }`}
                  title={article.published ? "발행 취소" : "발행"}
                >
                  {article.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button
                  onClick={() =>
                    editingId === article.id ? cancelEdit() : startEdit(article)
                  }
                  className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ml-1 ${
                    editingId === article.id
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  }`}
                >
                  {editingId === article.id ? (
                    <><X className="h-3.5 w-3.5" /> 닫기</>
                  ) : (
                    <><Edit2 className="h-3.5 w-3.5" /> 편집</>
                  )}
                </button>
              </div>
            </div>

            {/* 편집 패널 */}
            {editingId === article.id && (
              <div className="border-t border-gray-100 p-5 bg-gray-50 rounded-b-xl space-y-4">
                {message && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 text-sm">
                    {message}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 제목 */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">제목</label>
                    <input
                      type="text"
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* 설명 */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">설명 (목록 미리보기)</label>
                    <textarea
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* 카테고리 */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">카테고리</label>
                    <select
                      value={editForm.category || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* 타입 */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">타입</label>
                    <select
                      value={editForm.type || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none"
                    >
                      {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* 검색 의도 */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">검색 의도</label>
                    <select
                      value={editForm.searchIntent || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, searchIntent: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none"
                    >
                      {SEARCH_INTENTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* 발행일 */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">발행일</label>
                    <input
                      type="date"
                      value={editForm.publishedAt || ""}
                      onChange={(e) => setEditForm((f) => ({ ...f, publishedAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:outline-none"
                    />
                  </div>

                  {/* 태그 */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">태그 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={(editForm.tags || []).join(", ")}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="연차, 월차, 근로기준법"
                    />
                  </div>

                  {/* 관련 법령 */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 block mb-1">관련 법령 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={(editForm.relatedLaws || []).join(", ")}
                      onChange={(e) =>
                        setEditForm((f) => ({
                          ...f,
                          relatedLaws: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="근로기준법 제60조"
                    />
                  </div>

                  {/* 발행/주요 */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.published || false}
                        onChange={(e) => setEditForm((f) => ({ ...f, published: e.target.checked }))}
                        className="w-4 h-4 accent-indigo-600"
                      />
                      <span className="text-sm text-black">발행</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.featured || false}
                        onChange={(e) => setEditForm((f) => ({ ...f, featured: e.target.checked }))}
                        className="w-4 h-4 accent-yellow-500"
                      />
                      <span className="text-sm text-black">주요 아티클</span>
                    </label>
                  </div>
                </div>

                {/* 본문 */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    본문 (HTML){" "}
                    <span className="font-normal text-gray-400">— 저장 후 발행하면 아티클 페이지에 표시됩니다</span>
                  </label>
                  <textarea
                    value={editForm.content || ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                    rows={18}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs text-black font-mono bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
                    placeholder="<p>본문 HTML을 입력하세요...</p>"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                  >
                    취소
                  </button>
                  <button
                    onClick={saveArticle}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "저장 중..." : "저장"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
