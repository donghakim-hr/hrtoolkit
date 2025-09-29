"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogIn, Eye, EyeOff, User, Lock } from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 로그인 성공 시 홈페이지로 이동
        router.push("/");
        router.refresh(); // 페이지 새로고침으로 로그인 상태 반영
      } else {
        setError(data.error || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* 뒤로가기 버튼 */}
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="flex items-center text-black hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          홈으로
        </Link>
      </div>

      <div className="max-w-md w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-black">로그인</h2>
          <p className="mt-2 text-black">
            HR-Toolkit에 로그인하여 개인화된 서비스를 이용하세요
          </p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 사용자명 입력 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-black mb-2">
                사용자명
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="사용자명을 입력하세요"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="비밀번호를 입력하세요"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={loading || !formData.username.trim() || !formData.password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>로그인 중...</span>
                </div>
              ) : (
                "로그인"
              )}
            </button>
          </form>

          {/* 추가 링크들 */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-center space-x-4 text-sm">
              <Link href="/auth/find-account" className="text-blue-600 hover:text-blue-700">
                아이디/비밀번호 찾기
              </Link>
            </div>

            <div className="text-center">
              <p className="text-sm text-black">
                계정이 없으신가요?{" "}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  회원가입하기
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="bg-white/50 rounded-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-black mb-2">💡 로그인 혜택</h3>
          <ul className="text-xs text-black space-y-1">
            <li>• 계산 결과 히스토리 자동 저장</li>
            <li>• 개인 맞춤 설정 값 저장</li>
            <li>• 즐겨찾기 기능 이용</li>
            <li>• 새로운 기능 알림 받기</li>
          </ul>
        </div>

        {/* 관리자 로그인 링크 */}
        <div className="text-center">
          <Link href="/admin/login" className="text-xs text-gray-500 hover:text-gray-700">
            관리자로 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}