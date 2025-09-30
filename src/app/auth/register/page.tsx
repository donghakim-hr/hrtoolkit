"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Eye, EyeOff, Mail, User, Lock, Calendar, AtSign } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    nickname: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailValidating, setEmailValidating] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const router = useRouter();

  // 이메일 검증 함수
  const validateEmail = async (email: string) => {
    if (!email || !email.includes('@')) {
      setEmailValid(false);
      return;
    }

    setEmailValidating(true);
    try {
      const response = await fetch('/api/auth/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      setEmailValid(data.valid && data.available);
    } catch (error) {
      console.error('Email validation error:', error);
      setEmailValid(false);
    } finally {
      setEmailValidating(false);
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

    if (!formData.birthDate) {
      setError("생년월일을 입력해주세요.");
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("이메일을 입력해주세요.");
      setLoading(false);
      return;
    }

    if (emailValid !== true) {
      setError("유효한 이메일을 입력해주세요.");
      setLoading(false);
      return;
    }

    if (!formData.nickname.trim()) {
      setError("닉네임을 입력해주세요.");
      setLoading(false);
      return;
    }

    if (!formData.username.trim()) {
      setError("아이디를 입력해주세요.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          birthDate: formData.birthDate,
          email: formData.email,
          nickname: formData.nickname,
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setError(data.error || "회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 오류:", error);
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);

    // 이메일 필드 변경 시 검증 실행
    if (name === 'email') {
      setEmailValid(null);
      if (value.trim()) {
        // 디바운스를 위해 타이머 사용
        setTimeout(() => {
          validateEmail(value);
        }, 1000);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-4">회원가입 완료!</h2>
            <p className="text-black mb-4">
              회원가입이 성공적으로 완료되었습니다.
            </p>
            <p className="text-black text-sm">
              잠시 후 로그인 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-black">회원가입</h2>
          <p className="mt-2 text-black">
            HR-Toolkit에 가입하여 다양한 기능을 이용하세요
          </p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 이름 입력 */}
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="실명을 입력하세요"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 생년월일 입력 */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-black mb-2">
                생년월일 *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                이메일주소 *
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
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    emailValid === true ? 'border-green-500' : emailValid === false ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="이메일 주소를 입력하세요"
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {emailValidating ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : emailValid === true ? (
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  ) : emailValid === false ? (
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-1 bg-white rounded-full"></div>
                    </div>
                  ) : null}
                </div>
              </div>
              {emailValid === false && (
                <p className="text-red-600 text-xs mt-1">이미 사용중이거나 유효하지 않은 이메일입니다.</p>
              )}
              {emailValid === true && (
                <p className="text-green-600 text-xs mt-1">사용 가능한 이메일입니다.</p>
              )}
            </div>

            {/* 닉네임 입력 */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-black mb-2">
                닉네임 *
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  required
                  value={formData.nickname}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="닉네임을 입력하세요"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 아이디 입력 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-black mb-2">
                아이디 *
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
                  placeholder="3-20자의 영문, 숫자"
                  disabled={loading}
                />
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                비밀번호 *
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
                  placeholder="6자 이상의 비밀번호"
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

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
                비밀번호 확인 *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="비밀번호를 다시 입력하세요"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              disabled={
                loading ||
                !formData.name.trim() ||
                !formData.birthDate ||
                !formData.email.trim() ||
                emailValid !== true ||
                !formData.nickname.trim() ||
                !formData.username.trim() ||
                !formData.password.trim() ||
                !formData.confirmPassword.trim() ||
                formData.password !== formData.confirmPassword
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>가입 중...</span>
                </div>
              ) : (
                "회원가입"
              )}
            </button>
          </form>

          {/* 로그인 링크 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-black">
              이미 계정이 있으신가요?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                로그인하기
              </Link>
            </p>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="bg-white/50 rounded-lg p-4 border border-gray-100">
          <h3 className="text-sm font-medium text-black mb-2">💡 회원가입 혜택</h3>
          <ul className="text-xs text-black space-y-1">
            <li>• 개인 맞춤 계산 히스토리 저장</li>
            <li>• 자주 사용하는 설정 값 저장</li>
            <li>• 새로운 기능 우선 체험</li>
          </ul>
        </div>
      </div>
    </div>
  );
}