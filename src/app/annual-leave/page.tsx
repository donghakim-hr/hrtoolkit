"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Calendar, Info, Download, FileText, FileSpreadsheet, Save, Check } from "lucide-react";
import { AnnualLeaveResult, YearlyLeaveInfo } from "@/types";
import { exportAnnualLeaveToPDF, exportAnnualLeaveToExcel } from "@/utils/exportUtils";

interface UserSession {
  userId: string;
  username: string;
  name: string;
  email: string;
}

export default function AnnualLeavePage() {
  const [startDate, setStartDate] = useState("");
  const [accountingYearStart, setAccountingYearStart] = useState("01-01");
  const [calculateDate, setCalculateDate] = useState("");
  const [result, setResult] = useState<AnnualLeaveResult | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 입사일 개별 필드
  const [startYear, setStartYear] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startDay, setStartDay] = useState("");

  // 계산 기준일 개별 필드
  const [calcYear, setCalcYear] = useState("");
  const [calcMonth, setCalcMonth] = useState("");
  const [calcDay, setCalcDay] = useState("");

  // refs for auto focus
  const startMonthRef = useRef<HTMLInputElement>(null);
  const startDayRef = useRef<HTMLInputElement>(null);
  const calcYearRef = useRef<HTMLInputElement>(null);
  const calcMonthRef = useRef<HTMLInputElement>(null);
  const calcDayRef = useRef<HTMLInputElement>(null);

  // 사용자 인증 상태 확인
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
    }
  };

  // 계산 결과 저장
  const saveCalculation = async () => {
    if (!result || !userSession) return;

    setSaving(true);
    try {
      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'annual-leave',
          title: saveTitle || `연차 계산 - ${result.startDate}`,
          data: result
        })
      });

      if (response.ok) {
        setSaveSuccess(true);
        setShowSaveDialog(false);
        setSaveTitle("");
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 날짜 자동 포커스 이동 핸들러
  const handleDateInput = (
    value: string,
    setter: (value: string) => void,
    maxLength: number,
    nextRef?: React.RefObject<HTMLInputElement>
  ) => {
    // 숫자만 허용
    const numericValue = value.replace(/\D/g, '');

    if (numericValue.length <= maxLength) {
      setter(numericValue);

      // 최대 길이에 도달하면 다음 필드로 이동
      if (numericValue.length === maxLength && nextRef?.current) {
        nextRef.current.focus();
      }
    }
  };

  // 개별 필드를 조합하여 날짜 문자열 생성
  const combineDate = (year: string, month: string, day: string): string => {
    if (year.length === 4 && month.length === 2 && day.length === 2) {
      return `${year}-${month}-${day}`;
    }
    return "";
  };

  // 입사일이 변경될 때마다 startDate 업데이트
  const updateStartDate = (year: string, month: string, day: string) => {
    const combined = combineDate(year, month, day);
    setStartDate(combined);
  };

  // 계산일이 변경될 때마다 calculateDate 업데이트
  const updateCalculateDate = (year: string, month: string, day: string) => {
    const combined = combineDate(year, month, day);
    setCalculateDate(combined);
  };

  const calculateAnnualLeave = () => {
    if (!startDate || !calculateDate) {
      alert("입사일과 계산 기준일을 입력해주세요.");
      return;
    }

    const start = new Date(startDate);
    const calc = new Date(calculateDate);
    const currentYear = calc.getFullYear();

    // 회계연도 시작일을 올바른 날짜 형식으로 변환
    const [month, day] = accountingYearStart.split('-');
    const accountingStart = new Date(currentYear, parseInt(month) - 1, parseInt(day));

    // 회계연도 시작일이 계산일보다 늦으면 전년도 회계연도
    if (accountingStart > calc) {
      accountingStart.setFullYear(currentYear - 1);
    }

    // 전체 근속연수 계산 (입사일부터 계산 기준일까지)
    const totalWorkingDays = Math.floor((calc.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const totalWorkingYears = Math.floor(totalWorkingDays / 365.25);
    const totalWorkingMonths = Math.floor(totalWorkingDays / 30.4375);

    // 1. 입사일 기준 연차 계산 (실제 받아야 할 연차)
    let hireBasedLeave = 0;
    let hireBasedAdditional = 0;

    if (totalWorkingYears >= 1) {
      hireBasedLeave = 15;
      if (totalWorkingYears >= 3) {
        hireBasedAdditional = Math.min(Math.floor((totalWorkingYears - 1) / 2), 10);
      }
    } else {
      hireBasedLeave = Math.floor(totalWorkingMonths);
    }

    const totalHireBasedLeave = hireBasedLeave + hireBasedAdditional;

    // 2. 회계연도 기준 연차 계산 (회사에서 실제 준 연차)
    const currentAccountingYear = calc.getFullYear();
    const nextAccountingStart = new Date(accountingStart);
    nextAccountingStart.setFullYear(currentAccountingYear + 1);

    // 해당 회계연도 시작 시점에서의 근속연수
    const workingYearsAtAccountingStart = Math.floor((accountingStart.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    let accountingBasedLeave = 0;
    let accountingBasedAdditional = 0;

    if (workingYearsAtAccountingStart >= 1) {
      accountingBasedLeave = 15;
      if (workingYearsAtAccountingStart >= 3) {
        accountingBasedAdditional = Math.min(Math.floor((workingYearsAtAccountingStart - 1) / 2), 10);
      }
    } else if (workingYearsAtAccountingStart >= 0) {
      // 회계연도 중 입사한 경우
      const monthsWorkedInAccountingYear = Math.floor((calc.getTime() - (start > accountingStart ? start.getTime() : accountingStart.getTime())) / (30.4375 * 24 * 60 * 60 * 1000));
      accountingBasedLeave = Math.min(monthsWorkedInAccountingYear, 12);
    }

    const totalAccountingBasedLeave = accountingBasedLeave + accountingBasedAdditional;

    // 차이 계산
    const leaveDifference = totalHireBasedLeave - totalAccountingBasedLeave;

    // 3. 연도별 히스토리 계산
    const yearlyHistory: YearlyLeaveInfo[] = [];
    const startYear = start.getFullYear();
    const endYear = calc.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      // 해당 연도 말 기준으로 근속연수 계산
      const yearEndDate = new Date(year, 11, 31); // 12월 31일
      const actualEndDate = year === endYear ? calc : yearEndDate;

      // 만약 계산 기준일이 해당 연도보다 이전이면 스킵
      if (actualEndDate < start) continue;

      const workingDaysAtYear = Math.floor((actualEndDate.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
      const workingYearsAtYear = Math.floor(workingDaysAtYear / 365.25);
      const workingMonthsAtYear = Math.floor(workingDaysAtYear / 30.4375);

      // 입사일 기준 연차 발생일 계산
      const hireAnniversaryDate = new Date(year, start.getMonth(), start.getDate());

      // 입사일 기준 연차 계산 (해당 연도 말 기준)
      let hireLeave = 0;
      let hireAdditional = 0;

      if (workingYearsAtYear >= 1) {
        hireLeave = 15;
        if (workingYearsAtYear >= 3) {
          hireAdditional = Math.min(Math.floor((workingYearsAtYear - 1) / 2), 10);
        }
      } else {
        hireLeave = Math.floor(workingMonthsAtYear);
      }

      // 회계연도 기준 연차 계산
      const [monthStr, dayStr] = accountingYearStart.split('-');
      const accountingYearStartDate = new Date(year, parseInt(monthStr) - 1, parseInt(dayStr));

      // 회계연도가 실제 입사일보다 이전인 경우 조정
      let effectiveAccountingStart = accountingYearStartDate;
      if (accountingYearStartDate < start) {
        effectiveAccountingStart = start;
      }

      // 회계연도 시작일 기준 근속연수
      const workingYearsAtAccounting = Math.floor((effectiveAccountingStart.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

      let accLeave = 0;
      let accAdditional = 0;

      if (workingYearsAtAccounting >= 1) {
        accLeave = 15;
        if (workingYearsAtAccounting >= 3) {
          accAdditional = Math.min(Math.floor((workingYearsAtAccounting - 1) / 2), 10);
        }
      } else if (effectiveAccountingStart.getFullYear() === year) {
        // 회계연도 중 입사한 경우
        const monthsInYear = Math.floor((actualEndDate.getTime() - effectiveAccountingStart.getTime()) / (30.4375 * 24 * 60 * 60 * 1000));
        accLeave = Math.min(monthsInYear, 12);
      }

      const hireTotalLeave = hireLeave + hireAdditional;
      const accTotalLeave = accLeave + accAdditional;
      const difference = hireTotalLeave - accTotalLeave;

      // 연차 발생일 정보 생성
      let description = "";
      let hireDateInfo = "";
      let accountingDateInfo = "";

      if (workingYearsAtYear < 1) {
        description = `입사 ${workingMonthsAtYear}개월차`;
        hireDateInfo = "매월 1일씩 발생";
      } else {
        description = `근속 ${workingYearsAtYear}년차`;
        // 입사일이 해당 연도에 있고, 계산일까지 도달했으면 발생일 표시
        if (hireAnniversaryDate <= actualEndDate && hireAnniversaryDate >= new Date(year, 0, 1)) {
          hireDateInfo = `${hireAnniversaryDate.toLocaleDateString('ko-KR')} 발생`;
        } else if (year === startYear) {
          hireDateInfo = `${start.toLocaleDateString('ko-KR')} 입사`;
        } else {
          hireDateInfo = `${hireAnniversaryDate.toLocaleDateString('ko-KR')} 예정`;
        }
      }

      // 회계연도 기준 발생일 정보
      if (effectiveAccountingStart <= actualEndDate && effectiveAccountingStart >= new Date(year, 0, 1)) {
        accountingDateInfo = `${effectiveAccountingStart.toLocaleDateString('ko-KR')} 발생`;
      } else if (accountingYearStartDate <= actualEndDate) {
        accountingDateInfo = `${accountingYearStartDate.toLocaleDateString('ko-KR')} 예정`;
      }

      yearlyHistory.push({
        year,
        workingYears: workingYearsAtYear,
        hireBasedLeave: hireLeave,
        hireBasedAdditional: hireAdditional,
        hireTotalLeave,
        accountingLeave: accLeave,
        accountingAdditional: accAdditional,
        accountingTotalLeave: accTotalLeave,
        difference,
        description,
        hireDateInfo,
        accountingDateInfo
      });
    }

    setResult({
      startDate: start.toLocaleDateString('ko-KR'),
      calculateDate: calc.toLocaleDateString('ko-KR'),
      accountingStart: accountingStart.toLocaleDateString('ko-KR'),
      workingYears: totalWorkingYears,
      workingDaysInYear: Math.floor((calc.getTime() - (start > accountingStart ? start.getTime() : accountingStart.getTime())) / (24 * 60 * 60 * 1000)),

      // 입사일 기준
      legalLeave: hireBasedLeave,
      additionalLeave: hireBasedAdditional,
      totalLeave: totalHireBasedLeave,

      // 회계연도 기준 (새로 추가)
      accountingLeave: accountingBasedLeave,
      accountingAdditional: accountingBasedAdditional,
      totalAccountingLeave: totalAccountingBasedLeave,

      // 비교 결과
      leaveDifference: leaveDifference,

      // 연도별 히스토리
      yearlyHistory: yearlyHistory,

      isNewEmployee: totalWorkingYears < 1
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-black hover:text-black transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                홈으로
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <Calculator className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-black">연차 산정 계산기</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-blue-600" />
              연차 비교 분석
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  입사일
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="년도 (4자리)"
                      value={startYear}
                      onChange={(e) => {
                        handleDateInput(e.target.value, setStartYear, 4, startMonthRef);
                        updateStartDate(e.target.value.replace(/\D/g, ''), startMonth, startDay);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-black"
                      maxLength={4}
                    />
                    <p className="text-xs text-black text-center mt-1">년도</p>
                  </div>
                  <div className="w-16">
                    <input
                      ref={startMonthRef}
                      type="text"
                      placeholder="월"
                      value={startMonth}
                      onChange={(e) => {
                        handleDateInput(e.target.value, setStartMonth, 2, startDayRef);
                        updateStartDate(startYear, e.target.value.replace(/\D/g, ''), startDay);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-black"
                      maxLength={2}
                    />
                    <p className="text-xs text-black text-center mt-1">월</p>
                  </div>
                  <div className="w-16">
                    <input
                      ref={startDayRef}
                      type="text"
                      placeholder="일"
                      value={startDay}
                      onChange={(e) => {
                        handleDateInput(e.target.value, setStartDay, 2, calcYearRef);
                        updateStartDate(startYear, startMonth, e.target.value.replace(/\D/g, ''));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-black"
                      maxLength={2}
                    />
                    <p className="text-xs text-black text-center mt-1">일</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  회계연도 시작일 ✓
                </label>
                <select
                  value={accountingYearStart}
                  onChange={(e) => setAccountingYearStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-green-50"
                >
                  <option value="01-01">1월 1일 (일반적) ✓</option>
                  <option value="04-01">4월 1일</option>
                  <option value="07-01">7월 1일</option>
                  <option value="10-01">10월 1일</option>
                </select>
                <p className="text-xs text-green-600 mt-1">
                  ✓ 회사의 회계연도 시작일을 선택하세요. (일반적으로 1월 1일)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  계산 기준일
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input
                      ref={calcYearRef}
                      type="text"
                      placeholder="년도 (4자리)"
                      value={calcYear}
                      onChange={(e) => {
                        handleDateInput(e.target.value, setCalcYear, 4, calcMonthRef);
                        updateCalculateDate(e.target.value.replace(/\D/g, ''), calcMonth, calcDay);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-black"
                      maxLength={4}
                    />
                    <p className="text-xs text-black text-center mt-1">년도</p>
                  </div>
                  <div className="w-16">
                    <input
                      ref={calcMonthRef}
                      type="text"
                      placeholder="월"
                      value={calcMonth}
                      onChange={(e) => {
                        handleDateInput(e.target.value, setCalcMonth, 2, calcDayRef);
                        updateCalculateDate(calcYear, e.target.value.replace(/\D/g, ''), calcDay);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-black"
                      maxLength={2}
                    />
                    <p className="text-xs text-black text-center mt-1">월</p>
                  </div>
                  <div className="w-16">
                    <input
                      ref={calcDayRef}
                      type="text"
                      placeholder="일"
                      value={calcDay}
                      onChange={(e) => {
                        handleDateInput(e.target.value, setCalcDay, 2);
                        updateCalculateDate(calcYear, calcMonth, e.target.value.replace(/\D/g, ''));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-black"
                      maxLength={2}
                    />
                    <p className="text-xs text-black text-center mt-1">일</p>
                  </div>
                </div>
              </div>

              <button
                onClick={calculateAnnualLeave}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                연차 계산하기
              </button>
            </div>
          </div>

          {/* 결과 표시 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Calculator className="h-6 w-6 mr-3 text-green-600" />
              계산 결과
            </h2>

            {result ? (
              <div className="space-y-4">
                {/* 비교 결과 요약 */}
                <div className={`border rounded-lg p-4 ${
                  result.leaveDifference > 0
                    ? 'bg-red-50 border-red-200'
                    : result.leaveDifference < 0
                    ? 'bg-green-50 border-green-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-2">📊 연차 비교 결과</h3>
                  {result.leaveDifference > 0 ? (
                    <div>
                      <p className="text-red-800 font-medium">
                        📈 입사일 기준으로 {result.leaveDifference}일 더 받았어야 합니다
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        회사에서 제공한 연차보다 법정 연차가 많습니다
                      </p>
                    </div>
                  ) : result.leaveDifference < 0 ? (
                    <div>
                      <p className="text-green-800 font-medium">
                        ✅ 회계연도 기준으로 {Math.abs(result.leaveDifference)}일 더 받았습니다
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        회사에서 법정 연차보다 더 많이 제공했습니다
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-blue-800 font-medium">
                        ⚖️ 입사일 기준과 회계연도 기준이 동일합니다
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        법정 연차와 회사 제공 연차가 일치합니다
                      </p>
                    </div>
                  )}
                </div>

                {/* 입사일 기준 연차 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">📅 입사일 기준 (법정 연차)</h3>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.totalLeave}일
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    기본 {result.legalLeave}일 + 가산 {result.additionalLeave}일
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    근로기준법에 따라 실제 받았어야 할 연차
                  </p>
                </div>

                {/* 회계연도 기준 연차 */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">🏢 회계연도 기준 (회사 지급)</h3>
                  <div className="text-2xl font-bold text-purple-600">
                    {result.totalAccountingLeave}일
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    기본 {result.accountingLeave}일 + 가산 {result.accountingAdditional}일
                  </p>
                  <p className="text-xs text-purple-600 mt-2">
                    회계연도 기준으로 회사에서 실제 제공한 연차
                  </p>
                </div>

                {/* 기본 정보 */}
                <div className="space-y-3">
                  <h4 className="font-medium text-black">📋 기본 정보</h4>
                  <div className="flex justify-between py-2 border-b border-black-100">
                    <span className="text-black">입사일</span>
                    <span className="font-medium">{result.startDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black-100">
                    <span className="text-black">계산 기준일</span>
                    <span className="font-medium">{result.calculateDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black-100">
                    <span className="text-black">회계연도 시작일</span>
                    <span className="font-medium">{result.accountingStart}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-black-100">
                    <span className="text-black">총 근속연수</span>
                    <span className="font-medium">{result.workingYears}년</span>
                  </div>
                </div>

                {/* 연도별 히스토리 */}
                <div className="space-y-4">
                  <h4 className="font-medium text-black">📊 연도별 연차 히스토리</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-2 px-2 text-black">연도</th>
                            <th className="text-left py-2 px-2 text-black">상태</th>
                            <th className="text-center py-2 px-2 text-blue-700">입사일 기준</th>
                            <th className="text-center py-2 px-2 text-purple-700">회계연도 기준</th>
                            <th className="text-center py-2 px-2 text-black">차이</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.yearlyHistory.map((yearData, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="py-2 px-2 font-medium text-black">{yearData.year}</td>
                              <td className="py-2 px-2 text-black">{yearData.description}</td>
                              <td className="py-2 px-2 text-center">
                                <div className="text-blue-600 font-medium">
                                  {yearData.hireTotalLeave}일
                                </div>
                                <div className="text-xs text-blue-500">
                                  {yearData.hireBasedLeave + (yearData.hireBasedAdditional > 0 ? ` + ${yearData.hireBasedAdditional}` : '')}
                                </div>
                                {yearData.hireDateInfo && (
                                  <div className="text-xs text-blue-400 mt-1">
                                    {yearData.hireDateInfo}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <div className="text-purple-600 font-medium">
                                  {yearData.accountingTotalLeave}일
                                </div>
                                <div className="text-xs text-purple-500">
                                  {yearData.accountingLeave + (yearData.accountingAdditional > 0 ? ` + ${yearData.accountingAdditional}` : '')}
                                </div>
                                {yearData.accountingDateInfo && (
                                  <div className="text-xs text-purple-400 mt-1">
                                    {yearData.accountingDateInfo}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-2 text-center">
                                <span className={`font-medium ${
                                  yearData.difference > 0
                                    ? 'text-red-600'
                                    : yearData.difference < 0
                                    ? 'text-green-600'
                                    : 'text-black'
                                }`}>
                                  {yearData.difference > 0 ? '+' : ''}{yearData.difference}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 text-xs text-black">
                      <p>• <span className="text-blue-600">입사일 기준</span>: 근로기준법에 따라 받았어야 할 연차</p>
                      <p>• <span className="text-purple-600">회계연도 기준</span>: 회사 정책에 따라 실제 받았을 연차</p>
                      <p>• <span className="text-red-600">양수(+)</span>: 부족하게 받은 연차 / <span className="text-green-600">음수(-)</span>: 더 많이 받은 연차</p>
                    </div>
                  </div>
                </div>

                {result.isNewEmployee && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Info className="h-5 w-5 text-amber-600 mr-2" />
                      <p className="text-sm text-amber-800">
                        1년 미만 신입사원은 매월 1일씩 연차가 발생합니다.
                      </p>
                    </div>
                  </div>
                )}

                {/* 저장 및 출력 버튼들 */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  {/* 저장 성공 메시지 */}
                  {saveSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                      <Check className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800">계산 결과가 성공적으로 저장되었습니다!</span>
                    </div>
                  )}

                  {/* 저장 버튼 (로그인 시에만 표시) */}
                  {userSession && (
                    <div className="mb-4">
                      <h4 className="font-medium text-black mb-3 flex items-center">
                        <Save className="h-5 w-5 mr-2 text-blue-600" />
                        계산 결과 저장
                      </h4>
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        내 계정에 저장하기
                      </button>
                      <p className="text-xs text-black-600 mt-2">
                        계산 결과를 내 계정에 저장하여 나중에 다시 확인할 수 있습니다
                      </p>
                    </div>
                  )}

                  {/* 출력 버튼들 */}
                  <div>
                    <h4 className="font-medium text-black mb-3 flex items-center">
                      <Download className="h-5 w-5 mr-2 text-blue-600" />
                      계산 결과 출력
                    </h4>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => exportAnnualLeaveToPDF(result)}
                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF 다운로드
                      </button>
                      <button
                        onClick={() => exportAnnualLeaveToExcel(result)}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel 다운로드
                      </button>
                    </div>
                    <p className="text-xs text-black-600 mt-2">
                      계산 결과를 PDF 또는 Excel 파일로 저장할 수 있습니다
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-black py-8">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-black" />
                <p className="text-black">정보를 입력하고 계산 버튼을 눌러주세요.</p>
              </div>
            )}
          </div>
        </div>

        {/* 저장 다이얼로그 */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-black mb-4">계산 결과 저장</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  저장할 제목
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder={`연차 계산 - ${result?.startDate || ''}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveTitle("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  취소
                </button>
                <button
                  onClick={saveCalculation}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 법적 근거 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-600" />
            법적 근거
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-black">
            <p className="font-medium mb-2">근로기준법 제60조 (연차 유급휴가)</p>
            <ul className="space-y-1 ml-4">
              <li>• 1년간 80% 이상 출근한 근로자: 15일의 유급휴가</li>
              <li>• 1년 미만 근로자: 1월간 개근 시 1일의 유급휴가</li>
              <li>• 3년 이상 계속근로자: 최초 1년을 초과하는 계속근로년수 2년마다 1일씩 가산</li>
              <li>• 가산휴가를 포함한 총 일수는 25일을 한도로 함</li>
            </ul>
            <p className="text-xs text-black mt-3">
              ※ 시행일: 2021.11.19 (법률 제18469호, 2021.8.17, 일부개정)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}