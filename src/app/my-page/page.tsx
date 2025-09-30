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
  TrendingUp,
  Settings,
  History,
  Edit,
  Save,
  X,
  FolderOpen,
  FileText,
  Trash2
} from "lucide-react";

interface UserInfo {
  id: string;
  username: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface SavedCalculation {
  id: string;
  userId: string;
  type: "annual-leave" | "retirement-pay" | "retirement-tax";
  title: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface CalculationsByType {
  "annual-leave": SavedCalculation[];
  "retirement-pay": SavedCalculation[];
  "retirement-tax": SavedCalculation[];
}

const calculationTypeNames = {
  "annual-leave": "연차 계산",
  "retirement-pay": "퇴직급여 계산",
  "retirement-tax": "퇴직소득세 계산"
};

const calculationTypeIcons = {
  "annual-leave": Calendar,
  "retirement-pay": DollarSign,
  "retirement-tax": TrendingUp
};

const calculationTypeColors = {
  "annual-leave": "text-green-600",
  "retirement-pay": "text-blue-600",
  "retirement-tax": "text-purple-600"
};

export default function MyPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [calculations, setCalculations] = useState<CalculationsByType>({
    "annual-leave": [],
    "retirement-pay": [],
    "retirement-tax": []
  });
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: ""
  });
  const [activeTab, setActiveTab] = useState<"profile" | "calculations">("profile");
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setUserInfo(userData.user);
        setEditForm({
          name: userData.user.name,
          email: userData.user.email
        });
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("인증 상태 확인 오류:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const loadCalculations = useCallback(async () => {
    try {
      const response = await fetch("/api/calculations");
      if (response.ok) {
        const data = await response.json();

        // 타입별로 계산 결과 분류
        const groupedCalculations: CalculationsByType = {
          "annual-leave": [],
          "retirement-pay": [],
          "retirement-tax": []
        };

        data.forEach((calc: SavedCalculation) => {
          if (groupedCalculations[calc.type]) {
            groupedCalculations[calc.type].push(calc);
          }
        });

        setCalculations(groupedCalculations);
      }
    } catch (error) {
      console.error("계산 결과 로드 오류:", error);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
    loadCalculations();
  }, [checkAuthStatus, loadCalculations]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  const handleProfileSave = async () => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        setUserInfo(prev => prev ? { ...prev, ...editForm } : null);
        setEditingProfile(false);
        alert("프로필이 성공적으로 업데이트되었습니다.");
      } else {
        alert("프로필 업데이트에 실패했습니다.");
      }
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      alert("프로필 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteCalculation = async (calculationId: string) => {
    if (!confirm("정말로 이 계산 결과를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/calculations/${calculationId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        loadCalculations(); // 목록 새로고침
        alert("계산 결과가 삭제되었습니다.");
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center text-black hover:text-blue-600 transition-colors mr-8">
                <ArrowLeft className="h-5 w-5 mr-2" />
                대시보드로
              </Link>
              <div className="flex items-center">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                <h1 className="text-xl font-bold text-black">마이 페이지</h1>
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
        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-black hover:text-black hover:border-gray-300"
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                개인정보 수정
              </button>
              <button
                onClick={() => setActiveTab("calculations")}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "calculations"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-black hover:text-black hover:border-gray-300"
                }`}
              >
                <History className="h-4 w-4 inline mr-2" />
                저장된 계산내역
              </button>
            </nav>
          </div>
        </div>

        {/* 개인정보 수정 탭 */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-black">개인정보 수정</h2>
              {!editingProfile ? (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>수정</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleProfileSave}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>저장</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      setEditForm({
                        name: userInfo.name,
                        email: userInfo.email
                      });
                    }}
                    className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>취소</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">이름</label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                ) : (
                  <p className="text-black font-medium p-3 bg-gray-50 rounded-lg">{userInfo.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">사용자명</label>
                <p className="text-black font-medium p-3 bg-gray-50 rounded-lg">{userInfo.username}</p>
                <p className="text-xs text-black mt-1">사용자명은 변경할 수 없습니다</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">이메일</label>
                {editingProfile ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                ) : (
                  <p className="text-black font-medium p-3 bg-gray-50 rounded-lg">{userInfo.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">가입일</label>
                <p className="text-black font-medium p-3 bg-gray-50 rounded-lg">{formatDate(userInfo.createdAt)}</p>
              </div>
            </div>
          </div>
        )}

        {/* 저장된 계산내역 탭 */}
        {activeTab === "calculations" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-black mb-6 flex items-center">
                <History className="h-5 w-5 mr-2 text-blue-600" />
                저장된 계산내역
              </h2>

              {Object.entries(calculations).map(([type, calcs]) => {
                const Icon = calculationTypeIcons[type as keyof typeof calculationTypeIcons];
                const colorClass = calculationTypeColors[type as keyof typeof calculationTypeColors];
                const typeName = calculationTypeNames[type as keyof typeof calculationTypeNames];
                const isExpanded = expandedType === type;

                return (
                  <div key={type} className="mb-4 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedType(isExpanded ? null : type)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                        <span className="font-medium text-black">{typeName}</span>
                        <span className="text-sm text-black bg-gray-100 px-2 py-1 rounded-full">
                          {calcs.length}개
                        </span>
                      </div>
                      <FolderOpen className={`h-4 w-4 text-black transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        {calcs.length === 0 ? (
                          <p className="text-black text-center py-4">저장된 계산 결과가 없습니다.</p>
                        ) : (
                          <div className="space-y-3">
                            {calcs.map((calc) => (
                              <div key={calc.id} className="bg-white p-4 rounded-lg border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-4 w-4 text-black" />
                                  <div>
                                    <p className="font-medium text-black">{calc.title}</p>
                                    <p className="text-sm text-black">
                                      저장일: {formatDate(calc.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Link
                                    href={`/${type}?load=${calc.id}`}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    불러오기
                                  </Link>
                                  <button
                                    onClick={() => handleDeleteCalculation(calc.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}