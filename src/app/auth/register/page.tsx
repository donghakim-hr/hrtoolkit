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
  
  // 생년월일 분리 상태
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailValidating, setEmailValidating] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [usernameMessage, setUsernameMessage] = useState("");
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

  // 아이디 중복확인 함수
  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameValid(false);
      setUsernameMessage("아이디는 3자 이상이어야 합니다.");
      return;
    }

    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      setUsernameValid(false);
      setUsernameMessage("아이디는 3-20자의 영문, 숫자만 사용 가능합니다.");
      return;
    }

    setUsernameChecking(true);
    try {
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      setUsernameValid(data.available);
      setUsernameMessage(data.message || data.error || "");
    } catch (error) {
      console.error('Username check error:', error);
      setUsernameValid(false);
      setUsernameMessage("아이디 확인 중 오류가 발생했습니다.");
    } finally {
      setUsernameChecking(false);
    }
  };

  // 생년월일 입력 핸들러
  const handleBirthDateChange = (field: 'year' | 'month' | 'day', value: string) => {
    let formattedValue = value.replace(/\D/g, ''); // 숫자만 허용
    
    if (field === 'year') {
      formattedValue = formattedValue.slice(0, 4);
      setBirthYear(formattedValue);
      // 4자리 입력되면 월 입력으로 이동
      if (formattedValue.length === 4) {
        setTimeout(() => {
          const monthInput = document.getElementById('birthMonth');
          monthInput?.focus();
        }, 0);
      }
    } else if (field === 'month') {
      formattedValue = formattedValue.slice(0, 2);
      // 월 유효성 검사
      if (formattedValue.length === 1 && parseInt(formattedValue) > 1) {
        formattedValue = '0' + formattedValue;
      }
      if (formattedValue.length === 2) {
        const monthNum = parseInt(formattedValue);
        if (monthNum > 12) {
          formattedValue = '12';
        } else if (monthNum < 1) {
          formattedValue = '01';
        }
      }
      setBirthMonth(formattedValue);
      // 2자리 입력되면 일 입력으로 이동
      if (formattedValue.length === 2) {
        setTimeout(() => {
          const dayInput = document.getElementById('birthDay');
          dayInput?.focus();
        }, 0);
      }
    } else if (field === 'day') {
      formattedValue = formattedValue.slice(0, 2);
      // 일 유효성 검사
      if (formattedValue.length === 1 && parseInt(formattedValue) > 3) {
        formattedValue = '0' + formattedValue;
      }
      if (formattedValue.length === 2) {
        const dayNum = parseInt(formattedValue);
        if (dayNum > 31) {
          formattedValue = '31';
        } else if (dayNum < 1) {
          formattedValue = '01';
        }
      }
      setBirthDay(formattedValue);
    }
    
    // birthDate 필드 업데이트
    updateBirthDate(field, formattedValue);
  };

  // 전체 생년월일 업데이트
  const updateBirthDate = (updatedField: 'year' | 'month' | 'day', newValue: string) => {
    const year = updatedField === 'year' ? newValue : birthYear;
    const month = updatedField === 'month' ? newValue : birthMonth;
    const day = updatedField === 'day' ? newValue : birthDay;
    
    if (year.length === 4 && month.length === 2 && day.length === 2) {
      const birthDate = `${year}-${month}-${day}`;
      setFormData(prev => ({
        ...prev,
        birthDate: birthDate
      }));
    }
  };

  // 키보드 이벤트 핸들러 (백스페이스로 이전 필드 이동)
  const handleKeyDown = (field: 'year' | 'month' | 'day', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const target = e.target as HTMLInputElement;
      if (target.value === '' || target.selectionStart === 0) {
        if (field === 'month') {
          const yearInput = document.getElementById('birthYear');
          yearInput?.focus();
        } else if (field === 'day') {
          const monthInput = document.getElementById('birthMonth');
          monthInput?.focus();
        }
      }
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

    if (usernameValid !== true) {
      setError("사용 가능한 아이디를 입력해주세요.");
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

    // 아이디가 변경되면 검증 상태 초기화
    if (name === 'username') {
      setUsernameValid(null);
      setUsernameMessage("");
    }

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
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
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
              <label className="block text-sm font-medium text-black mb-2">
                생년월일 *
              </label>
              <div className="flex space-x-2">
                {/* 년도 입력 */}
                <div className="flex-1">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
                    <input
                      id="birthYear"
                      type="text"
                      inputMode="numeric"
                      value={birthYear}
                      onChange={(e) => handleBirthDateChange('year', e.target.value)}
                      onKeyDown={(e) => handleKeyDown('year', e)}
                      placeholder="YYYY"
                      maxLength={4}
                      className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">년</p>
                </div>
                
                {/* 월 입력 */}
                <div className="w-20">
                  <input
                    id="birthMonth"
                    type="text"
                    inputMode="numeric"
                    value={birthMonth}
                    onChange={(e) => handleBirthDateChange('month', e.target.value)}
                    onKeyDown={(e) => handleKeyDown('month', e)}
                    placeholder="MM"
                    maxLength={2}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">월</p>
                </div>
                
                {/* 일 입력 */}
                <div className="w-20">
                  <input
                    id="birthDay"
                    type="text"
                    inputMode="numeric"
                    value={birthDay}
                    onChange={(e) => handleBirthDateChange('day', e.target.value)}
                    onKeyDown={(e) => handleKeyDown('day', e)}
                    placeholder="DD"
                    maxLength={2}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 text-center mt-1">일</p>
                </div>
              </div>
              {formData.birthDate && (
                <p className="text-xs text-green-600 mt-1">
                  입력된 생년월일: {formData.birthDate}
                </p>
              )}
            </div>

            {/* 이메일 입력 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
                이메일주소 *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
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
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
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
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={() => formData.username && checkUsername(formData.username)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      usernameValid === true 
                        ? 'border-green-300 bg-green-50' 
                        : usernameValid === false 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300'
                    }`}
                    placeholder="3-20자의 영문, 숫자"
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => checkUsername(formData.username)}
                  disabled={!formData.username || usernameChecking || loading}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium whitespace-nowrap"
                >
                  {usernameChecking ? '확인중...' : '중복확인'}
                </button>
              </div>
              
              {/* 아이디 검증 메시지 */}
              {usernameMessage && (
                <div className={`mt-2 text-sm ${
                  usernameValid === true 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {usernameValid === true ? '✓ ' : '✗ '}{usernameMessage}
                </div>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
                비밀번호 *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-black"
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
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-black"
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