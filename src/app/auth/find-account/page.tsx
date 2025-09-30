"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Mail, User, Key, CheckCircle } from "lucide-react";

type TabType = "username" | "password";

export default function FindAccountPage() {
  const [activeTab, setActiveTab] = useState<TabType>("username");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [foundUsername, setFoundUsername] = useState("");

  const handleFindUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/find-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setFoundUsername(data.username);
        setSuccess(`사용자명을 찾았습니다: ${data.username}`);
      } else {
        setError(data.error || "사용자명 찾기에 실패했습니다.");
      }
    } catch (error) {
      console.error("사용자명 찾기 오류:", error);
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("비밀번호가 성공적으로 변경되었습니다.");
        setUsername("");
        setNewPassword("");
      } else {
        setError(data.error || "비밀번호 변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
    setFoundUsername("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* 뒤로가기 버튼 */}
      <div className="absolute top-4 left-4">
        <Link
          href="/auth/login"
          className="flex items-center text-black hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          로그인으로
        </Link>
      </div>

      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-black">계정 찾기</h2>
          <p className="mt-2 text-black">
            이메일로 사용자명을 찾거나 비밀번호를 재설정하세요
          </p>
        </div>

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => switchTab("username")}
              className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-colors ${
                activeTab === "username"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-black hover:text-blue-600"
              }`}
            >
              <User className="h-4 w-4 inline mr-2" />
              사용자명 찾기
            </button>
            <button
              onClick={() => switchTab("password")}
              className={`flex-1 py-4 px-6 text-sm font-medium text-center transition-colors ${
                activeTab === "password"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-black hover:text-blue-600"
              }`}
            >
              <Key className="h-4 w-4 inline mr-2" />
              비밀번호 재설정
            </button>
          </div>

          <div className="p-8">
            {/* 성공/에러 메시지 */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 사용자명 찾기 폼 */}
            {activeTab === "username" && (
              <form onSubmit={handleFindUsername} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                    등록된 이메일 주소
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="이메일 주소를 입력하세요"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>찾는 중...</span>
                    </div>
                  ) : (
                    "사용자명 찾기"
                  )}
                </button>

                {foundUsername && (
                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      찾은 사용자명으로 로그인하기 →
                    </Link>
                  </div>
                )}
              </form>
            )}

            {/* 비밀번호 재설정 폼 */}
            {activeTab === "password" && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-black mb-2">
                    사용자명
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="사용자명을 입력하세요"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-black mb-2">
                    새 비밀번호
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !username.trim() || !newPassword.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>변경 중...</span>
                    </div>
                  ) : (
                    "비밀번호 변경"
                  )}
                </button>

                {success && (
                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      새 비밀번호로 로그인하기 →
                    </Link>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        {/* 도움말 */}
        <div className="bg-white/50 rounded-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-black mb-2">💡 도움말</h3>
          <ul className="text-xs text-black space-y-1">
            <li>• 사용자명 찾기: 가입 시 등록한 이메일로 사용자명을 확인할 수 있습니다</li>
            <li>• 비밀번호 재설정: 사용자명을 알고 있다면 새 비밀번호로 변경할 수 있습니다</li>
            <li>• 문제가 계속되면 관리자에게 문의하세요</li>
          </ul>
        </div>

        {/* 홈으로 가기 */}
        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
            HR-Toolkit 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}