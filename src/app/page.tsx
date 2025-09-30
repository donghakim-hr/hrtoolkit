"use client";

import Link from "next/link";
import { Calculator, FileText, DollarSign, Search, HelpCircle, Briefcase, Bell, X, User, LogIn, LogOut, MessageSquare, ChevronDown, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Notice } from "@/types";
import noticesData from "@/data/notices.json";

interface UserSession {
  userId: string;
  username: string;
  name: string;
  email: string;
}

export default function Home() {
  const [dismissedNotices, setDismissedNotices] = useState<number[]>([]);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const notices = noticesData as Notice[];

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCommunityDropdown) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowCommunityDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCommunityDropdown]);

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


  // 최신 중요 공지 가져오기 (해제되지 않은 것 중)
  const activeNotices = notices
    .filter(notice => notice.important && !dismissedNotices.includes(notice.id))
    .slice(0, 1); // 상단에는 최신 1개만 표시

  const dismissNotice = (noticeId: number) => {
    setDismissedNotices(prev => [...prev, noticeId]);
  };
  const features = [
    {
      icon: Calculator,
      title: "연차 산정 계산기",
      description: "입사일과 회계연도를 기준으로 정확한 연차를 계산합니다",
      href: "/annual-leave",
      color: "bg-blue-500"
    },
    {
      icon: DollarSign,
      title: "퇴직급여 계산기",
      description: "근속기간과 평균임금을 기준으로 퇴직급여를 산정합니다",
      href: "/retirement-pay",
      color: "bg-green-500"
    },
    {
      icon: FileText,
      title: "퇴직소득세 계산기",
      description: "퇴직급여에 따른 세금과 실수령액을 확인합니다",
      href: "/retirement-tax",
      color: "bg-purple-500"
    },
    {
      icon: Search,
      title: "법령 조문 검색",
      description: "근로기준법, 고용노동부 지침 등 관련 법령을 검색합니다",
      href: "/legal-search",
      color: "bg-orange-500"
    },
    {
      icon: HelpCircle,
      title: "HR FAQ",
      description: "HR 업무 중 자주 묻는 질문과 답변을 법령 조문과 함께 확인합니다",
      href: "/faq",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-black">HR-Toolkit</h1>
            </Link>

            <div className="flex items-center space-x-6">
              {/* 네비게이션 메뉴 */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/notices"
                  className="flex items-center text-black hover:text-blue-600 transition-colors"
                >
                  <Bell className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">공지사항</span>
                </Link>
                <Link
                  href="/inquiry"
                  className="flex items-center text-black hover:text-blue-600 transition-colors"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">1:1문의</span>
                </Link>
                {/* 커뮤니티 드롭다운 */}
                <div className="relative">
                  <button
                    onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                    className="flex items-center text-black hover:text-blue-600 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">커뮤니티</span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </button>
                  {showCommunityDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="py-2">
                        <Link
                          href="/community/free-board"
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-50 hover:text-blue-600"
                          onClick={() => setShowCommunityDropdown(false)}
                        >
                          자유게시판
                        </Link>
                        <Link
                          href="/community/hr-chat"
                          className="block px-4 py-2 text-sm text-black hover:bg-gray-50 hover:text-blue-600"
                          onClick={() => setShowCommunityDropdown(false)}
                        >
                          HR수다
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </nav>

              <p className="text-sm text-black hidden lg:block">
                HR 신입을 위한 필수 계산 도구
              </p>

              {/* 로그인 상태에 따른 UI */}
              {authLoading ? (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : userSession ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <User className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium hidden sm:block">{userSession.name}</span>
                    <span className="text-sm font-medium sm:hidden">대시보드</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-black hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="text-sm hidden sm:block">로그아웃</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">로그인</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 공지 배너 */}
      {activeNotices.map(notice => (
        <div key={notice.id} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-200" />
                <div className="flex items-center space-x-2">
                  {notice.badge && (
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      {notice.badge}
                    </span>
                  )}
                  <span className="font-medium">{notice.title}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/notices"
                  className="text-blue-200 hover:text-white text-sm underline"
                >
                  자세히 보기
                </Link>
                <button
                  onClick={() => dismissNotice(notice.id)}
                  className="text-blue-200 hover:text-white p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-black sm:text-5xl">
            HR 업무가
            <span className="text-blue-600"> 쉬워집니다</span>
          </h1>
          <p className="mt-4 text-xl text-black max-w-2xl mx-auto">
            복잡한 연차 계산부터 퇴직급여까지, HR 신입이 자주 헷갈리는 계산을
            간편하게 해결하세요
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  href={feature.href}
                  className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 p-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${feature.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-black group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-black mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Briefcase className="h-6 w-6" />
              <span className="text-lg font-semibold">HR-Toolkit</span>
            </div>
            <p className="text-white text-sm">
              © 2024 HR-Toolkit. 모든 계산은 관련 법령에 근거합니다.
            </p>
            <p className="text-white text-xs mt-2">
              ⚠️ 본 도구의 계산 결과는 참고용이며, 정확한 업무 처리를 위해서는 관련 법령을 반드시 확인하시기 바랍니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}