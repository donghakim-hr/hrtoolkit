"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  User,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Clock,
  TrendingUp,
  Star,
  History
} from "lucide-react";

interface UserInfo {
  id: string;
  username: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function UserDashboardPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData.user);
      } else {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("인증 상태 확인 오류:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getDaysFromJoin = (joinDate: string) => {
    const join = new Date(joinDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - join.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return null; // 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-black hover:text-blue-600 transition-colors mr-8">
                <ArrowLeft className="h-5 w-5 mr-2" />
                홈으로
              </Link>
              <div className="flex items-center">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-black">마이 대시보드</h1>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-black hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 환영 메시지 */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">안녕하세요, {userInfo.name}님!</h2>
              <p className="text-blue-100">
                HR-Toolkit과 함께한 지 {getDaysFromJoin(userInfo.createdAt)}일째입니다
              </p>
            </div>
            <div className="text-right text-blue-100">
              <p className="text-sm">마지막 로그인</p>
              <p className="text-lg">
                {userInfo.lastLoginAt ? formatDate(userInfo.lastLoginAt) : "처음 방문"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 사용자 정보 카드 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                계정 정보
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">이름</label>
                  <p className="text-black font-medium">{userInfo.name}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">사용자명</label>
                  <p className="text-black font-medium">{userInfo.username}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">이메일</label>
                  <p className="text-black font-medium">{userInfo.email}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-600 block mb-1">가입일</label>
                  <p className="text-black font-medium">{formatDate(userInfo.createdAt)}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-black py-2 px-4 rounded-lg transition-colors text-sm">
                  계정 설정 수정
                </button>
              </div>
            </div>
          </div>

          {/* 주요 기능 및 통계 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* 빠른 접근 카드들 */}
              <Link href="/annual-leave" className="group">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <Calendar className="h-8 w-8 text-green-600" />
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      인기
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-1">연차 계산기</h3>
                  <p className="text-gray-600 text-sm">입사일 기준 연차 산정</p>
                </div>
              </Link>

              <Link href="/retirement-pay" className="group">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      NEW
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-1">퇴직급여 계산기</h3>
                  <p className="text-gray-600 text-sm">퇴직급여 정확한 산정</p>
                </div>
              </Link>

              <Link href="/retirement-tax" className="group">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <TrendingUp className="h-8 w-8 text-purple-600" />
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                      추천
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-1">퇴직소득세 계산기</h3>
                  <p className="text-gray-600 text-sm">세금 및 실수령액</p>
                </div>
              </Link>

              <Link href="/legal-search" className="group">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-1">법령 조문 검색</h3>
                  <p className="text-gray-600 text-sm">관련 법령 빠른 검색</p>
                </div>
              </Link>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
                <History className="h-5 w-5 mr-2 text-blue-600" />
                최근 활동
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-600 mr-3" />
                    <span className="text-black text-sm">계산 히스토리 기능 준비 중</span>
                  </div>
                  <span className="text-xs text-gray-500">곧 출시</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-gray-600 mr-3" />
                    <span className="text-black text-sm">즐겨찾기 기능 준비 중</span>
                  </div>
                  <span className="text-xs text-gray-500">곧 출시</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  💡 <strong>개발 예정 기능:</strong> 계산 히스토리 저장, 즐겨찾기, 개인 설정 저장 등의 기능이 곧 추가될 예정입니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 도움말 섹션 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-black mb-4">🎯 HR-Toolkit 활용 팁</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">연차 계산</h4>
              <p className="text-green-700 text-sm">입사일과 회계연도 기준 모두 지원하여 정확한 연차를 확인하세요.</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">퇴직급여</h4>
              <p className="text-blue-700 text-sm">근속기간과 평균임금을 정확히 입력하여 퇴직급여를 산정하세요.</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2">법령 검색</h4>
              <p className="text-purple-700 text-sm">근로기준법, 고용노동부 지침 등을 키워드로 빠르게 찾아보세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}