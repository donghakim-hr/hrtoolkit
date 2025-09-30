"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Send, User, Mail, FileText, CheckCircle } from "lucide-react";

export default function InquiryPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    content: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userSession, setUserSession] = useState<{id: string, username: string, name: string, email: string} | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // 로그인 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUserSession(data.user);
        // 로그인된 사용자 정보로 폼 미리 채우기
        setFormData(prev => ({
          ...prev,
          name: data.user.name || "",
          email: data.user.email || ""
        }));
      }
    } catch (error) {
      console.error("인증 상태 확인 오류:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 입력 검증
    if (!formData.name.trim()) {
      setError("이름을 입력해주세요.");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("이메일을 입력해주세요.");
      setLoading(false);
      return;
    }

    if (!formData.subject.trim()) {
      setError("문의 제목을 입력해주세요.");
      setLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError("문의 내용을 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setError(data.message || "문의 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("문의 등록 오류:", error);
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">문의 등록 완료!</h2>
            <p className="text-black mb-4">
              문의가 성공적으로 등록되었습니다.
            </p>
            <p className="text-black text-sm mb-4">
              빠른 시일 내에 답변해드리겠습니다.
            </p>
            <p className="text-black text-sm">
              잠시 후 홈페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-black hover:text-gray-700 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                홈으로
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">1:1 문의</h1>
              </div>
            </div>
            <div className="text-sm text-black">
              {userSession ? (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  {userSession.name}님으로 로그인됨
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                  비회원으로 문의
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 안내 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            💬 1:1 문의하기
          </h2>
          <p className="text-black mb-4">
            HR-Toolkit 사용 중 궁금한 점이나 개선사항이 있으시면 언제든 문의해주세요.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">📋 문의 안내</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 회원가입 없이도 문의 가능합니다</li>
              <li>• 비회원 문의 시 이메일 주소는 필수입니다</li>
              <li>• 개인정보 관련 문의는 비공개 처리됩니다</li>
              <li>• 평일 기준 1-2일 내 답변드립니다</li>
            </ul>
          </div>
        </div>

        {/* 문의 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 이름 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
                  이름 *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="이름을 입력하세요"
                    disabled={loading || Boolean(userSession?.name)}
                  />
                </div>
              </div>

              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                  이메일 * {!userSession && <span className="text-red-500">(답변 받을 이메일)</span>}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="이메일을 입력하세요"
                    disabled={loading || Boolean(userSession?.email)}
                  />
                </div>
              </div>

            </div>

            {/* 문의 제목 */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-black mb-2">
                문의 제목 *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="문의 제목을 입력하세요"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 문의 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-black mb-2">
                문의 내용 *
              </label>
              <textarea
                id="content"
                name="content"
                rows={8}
                required
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                placeholder="문의하실 내용을 자세히 입력해주세요..."
                disabled={loading}
              />
            </div>


            {/* 제출 버튼 */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.content.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>
                  {loading ? "문의 등록 중..." : "문의하기"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* 추가 안내 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📞 기타 문의 방법
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">💌 이메일 문의</h4>
              <p className="text-sm text-black mb-2">직접 이메일로 문의하시면 더 빠른 답변을 받으실 수 있습니다.</p>
              <p className="text-blue-600 text-sm font-medium">support@hr-toolkit.com</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">⏰ 운영 시간</h4>
              <p className="text-sm text-black mb-1">평일: 09:00 - 18:00</p>
              <p className="text-sm text-black mb-1">토요일: 09:00 - 12:00</p>
              <p className="text-sm text-black">일요일, 공휴일: 휴무</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}