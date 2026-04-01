"use client";

import Link from "next/link";
import {
  Calculator, FileText, DollarSign, Search, HelpCircle, Briefcase,
  Bell, X, User, LogIn, LogOut, MessageSquare, Mail, TrendingUp,
  BookMarked, ArrowRight, Users, ChevronDown, Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { Notice } from "@/types";
import noticesData from "@/data/notices.json";

interface UserSession {
  userId: string;
  username: string;
  name: string;
  email: string;
}

type CategoryKey = "전체" | "계산기" | "법령·지식" | "커뮤니티";

const CATEGORIES: CategoryKey[] = ["전체", "계산기", "법령·지식", "커뮤니티"];

const CATEGORY_META: Record<string, { color: string; bg: string; lightBg: string }> = {
  "계산기":   { color: "text-blue-600",   bg: "bg-blue-600",   lightBg: "bg-blue-50"   },
  "법령·지식": { color: "text-violet-600", bg: "bg-violet-600", lightBg: "bg-violet-50" },
  "커뮤니티": { color: "text-emerald-600", bg: "bg-emerald-600", lightBg: "bg-emerald-50" },
};

const features = [
  {
    icon: Calculator,
    title: "연차 산정 계산기",
    description: "입사일·회계연도 기준으로 정확한 연차 일수를 산정합니다",
    href: "/annual-leave",
    category: "계산기",
    accent: "from-blue-500 to-blue-600",
  },
  {
    icon: DollarSign,
    title: "퇴직급여 계산기",
    description: "근속기간과 평균임금을 기준으로 퇴직금을 계산합니다",
    href: "/retirement-pay",
    category: "계산기",
    accent: "from-sky-500 to-cyan-600",
  },
  {
    icon: FileText,
    title: "퇴직소득세 계산기",
    description: "퇴직급여에 따른 세금과 실수령액을 확인합니다",
    href: "/retirement-tax",
    category: "계산기",
    accent: "from-indigo-500 to-indigo-600",
  },
  {
    icon: TrendingUp,
    title: "최저임금 위반 확인",
    description: "현재 임금이 최저임금법을 준수하는지 즉시 확인합니다",
    href: "/minimum-wage",
    category: "계산기",
    accent: "from-teal-500 to-emerald-600",
  },
  {
    icon: Search,
    title: "법령 조문 검색",
    description: "근로기준법 등 노동 관련 법령 조문을 빠르게 검색합니다",
    href: "/legal-search",
    category: "법령·지식",
    accent: "from-violet-500 to-purple-600",
  },
  {
    icon: HelpCircle,
    title: "HR FAQ",
    description: "HR 신입이 자주 묻는 질문을 법령 조문과 함께 확인합니다",
    href: "/faq",
    category: "법령·지식",
    accent: "from-fuchsia-500 to-pink-600",
  },
  {
    icon: BookMarked,
    title: "HR 용어사전",
    description: "통상임금·포괄임금제 등 핵심 용어를 실무 예시로 이해합니다",
    href: "/glossary",
    category: "법령·지식",
    accent: "from-amber-500 to-orange-500",
  },
  {
    icon: MessageSquare,
    title: "자유게시판",
    description: "HR 실무 경험과 노하우를 자유롭게 나눕니다",
    href: "/community/free-board",
    category: "커뮤니티",
    accent: "from-emerald-500 to-green-600",
  },
  {
    icon: Users,
    title: "HR 수다",
    description: "HR 담당자들과 가볍게 이야기 나눠요",
    href: "/community/hr-chat",
    category: "커뮤니티",
    accent: "from-rose-500 to-red-600",
  },
];

export default function Home() {
  const [dismissedNotices, setDismissedNotices] = useState<number[]>([]);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("전체");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notices = noticesData as Notice[];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUserSession(data.user);
      }
    } catch (error) {
      console.error("인증 상태 확인 오류:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUserSession(null);
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  const activeNotices = notices
    .filter((n) => n.important && !dismissedNotices.includes(n.id))
    .slice(0, 1);

  const filteredFeatures =
    activeCategory === "전체"
      ? features
      : features.filter((f) => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Sticky Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">HR-Toolkit</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/notices" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Bell className="h-3.5 w-3.5" />공지사항
              </Link>
              <Link href="/inquiry" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Mail className="h-3.5 w-3.5" />1:1문의
              </Link>
              <Link href="/community/free-board" className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <MessageSquare className="h-3.5 w-3.5" />커뮤니티
              </Link>
            </nav>

            {/* Auth */}
            <div className="flex items-center gap-2">
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : userSession ? (
                <>
                  <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                    <User className="h-3.5 w-3.5" />
                    <span className="hidden sm:block">{userSession.name}</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden sm:block">로그아웃</span>
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg transition-colors">
                  <LogIn className="h-3.5 w-3.5" />로그인
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden ml-1 p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <ChevronDown className={`h-5 w-5 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`} />
              </button>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-3 flex flex-col gap-1 border-t border-gray-100 pt-2">
              <Link href="/notices" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                <Bell className="h-4 w-4" />공지사항
              </Link>
              <Link href="/inquiry" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                <Mail className="h-4 w-4" />1:1문의
              </Link>
              <Link href="/community/free-board" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                <MessageSquare className="h-4 w-4" />커뮤니티
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ── Notice Banner ──────────────────────────────────────── */}
      {activeNotices.map((notice) => (
        <div key={notice.id} className="bg-blue-600 text-white text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="h-4 w-4 text-blue-200 shrink-0" />
              {notice.badge && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-medium shrink-0">{notice.badge}</span>
              )}
              <span className="truncate">{notice.title}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/notices" className="text-blue-200 hover:text-white underline underline-offset-2 text-xs">자세히</Link>
              <button onClick={() => setDismissedNotices((p) => [...p, notice.id])} className="text-blue-200 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        {/* 배경 장식 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            HR 신입을 위한 올인원 도구
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            HR 업무,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-violet-300">
              이제 쉽게 해결하세요
            </span>
          </h1>

          <p className="mt-6 text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            연차 계산부터 퇴직급여, 법령 검색까지 — HR 신입이 자주 헷갈리는 모든 것을 한곳에서 해결합니다.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setActiveCategory("계산기")}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Calculator className="h-4 w-4" />계산기 바로 사용
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link href="/glossary" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors backdrop-blur-sm">
              <BookMarked className="h-4 w-4" />HR 용어 알아보기
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {[
              { value: "4종", label: "계산기" },
              { value: "30+", label: "HR 용어" },
              { value: "법령", label: "조문 검색" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Section ──────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Section header + Category tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">도구 모아보기</h2>
            <p className="text-sm text-gray-500 mt-0.5">카테고리별로 빠르게 찾아보세요</p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                    isActive
                      ? cat === "전체"
                        ? "bg-gray-900 text-white border-gray-900"
                        : `${meta.bg} text-white border-transparent`
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {cat}
                  <span className={`ml-1.5 text-xs ${isActive ? "opacity-75" : "text-gray-400"}`}>
                    {cat === "전체" ? features.length : features.filter((f) => f.category === cat).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFeatures.map((feature) => {
            const Icon = feature.icon;
            const meta = CATEGORY_META[feature.category];
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* 호버 시 배경 glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative">
                  {/* Category chip */}
                  <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${meta.lightBg} ${meta.color}`}>
                    {feature.category}
                  </span>

                  {/* Icon + Arrow */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center shadow-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all mt-1" />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Community CTA strip ────────────────────────────────── */}
      <section className="bg-gradient-to-r from-emerald-50 to-teal-50 border-y border-emerald-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">HR 담당자 커뮤니티</h3>
              <p className="text-sm text-gray-600">실무 경험과 노하우를 함께 나눠요</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/community/free-board" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-emerald-200 hover:border-emerald-400 text-emerald-700 font-medium text-sm rounded-xl transition-colors hover:shadow-sm">
              자유게시판
            </Link>
            <Link href="/community/hr-chat" className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors">
              HR 수다 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                  <Briefcase className="h-3.5 w-3.5 text-white" />
                </div>
                <Link href="/admin/login" className="text-white font-semibold hover:text-blue-400 transition-colors text-sm">
                  HR-Toolkit
                </Link>
              </div>
              <p className="text-xs text-gray-500">© 2024 HR-Toolkit. 모든 계산은 관련 법령에 근거합니다.</p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <Link href="/notices" className="hover:text-white transition-colors">공지사항</Link>
              <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/glossary" className="hover:text-white transition-colors">용어사전</Link>
              <Link href="/inquiry" className="hover:text-white transition-colors">1:1문의</Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-600">
              ⚠ 본 도구의 계산 결과는 참고용이며, 정확한 업무 처리를 위해서는 관련 법령을 반드시 확인하시기 바랍니다.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
