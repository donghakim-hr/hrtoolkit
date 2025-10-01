"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Calculator, Calendar, AlertTriangle, CheckCircle, Info, DollarSign, Clock, Users, FileText } from "lucide-react";

interface MinimumWageResult {
  year: number;
  hourlyMinWage: number;
  monthlyMinWage: number;
  isViolation: boolean;
  currentHourlyWage: number;
  shortfall: number;
  recommendations: string[];
  calculationDetails: {
    totalWorkingHours: number;
    regularHours: number;
    overtimeHours: number;
    nightHours: number;
    holidayHours: number;
    totalBasePay: number;
    regularPay: number;
    overtimePay: number;
    nightPay: number;
    holidayPay: number;
    excludedPay: number;
    includedPay: number;
  };
}

export default function MinimumWagePage() {
  const [monthlyBasePay, setMonthlyBasePay] = useState("");
  const [monthlyOvertimePay, setMonthlyOvertimePay] = useState("");
  const [monthlyNightPay, setMonthlyNightPay] = useState("");
  const [monthlyHolidayPay, setMonthlyHolidayPay] = useState("");
  const [monthlyAllowances, setMonthlyAllowances] = useState("");
  const [monthlyBonus, setMonthlyBonus] = useState("");
  const [monthlyMeals, setMonthlyMeals] = useState("");
  const [monthlyTransport, setMonthlyTransport] = useState("");
  
  const [weeklyWorkingHours, setWeeklyWorkingHours] = useState("");
  const [monthlyOvertimeHours, setMonthlyOvertimeHours] = useState("");
  const [monthlyNightHours, setMonthlyNightHours] = useState("");
  const [monthlyHolidayHours, setMonthlyHolidayHours] = useState("");
  
  const [result, setResult] = useState<MinimumWageResult | null>(null);

  // 2024년 최저임금 기준
  const minimumWageData = {
    2024: {
      hourly: 9860,
      monthly: 2060740 // 40시간 × 4.345주 × 9860원
    },
    2025: {
      hourly: 10030, // 예시 (실제로는 고시 확인 필요)
      monthly: 2095198
    }
  };

  const calculateMinimumWage = () => {
    const currentYear = 2024;
    const minWage = minimumWageData[currentYear as keyof typeof minimumWageData];

    // 입력값 검증
    if (!monthlyBasePay || !weeklyWorkingHours) {
      alert("기본급과 주당 근로시간을 입력해주세요.");
      return;
    }

    // 입력값 숫자 변환
    const basePay = parseInt(monthlyBasePay) || 0;
    const overtimePay = parseInt(monthlyOvertimePay) || 0;
    const nightPay = parseInt(monthlyNightPay) || 0;
    const holidayPay = parseInt(monthlyHolidayPay) || 0;
    const allowances = parseInt(monthlyAllowances) || 0;
    const bonus = parseInt(monthlyBonus) || 0;
    const meals = parseInt(monthlyMeals) || 0;
    const transport = parseInt(monthlyTransport) || 0;

    const weeklyHours = parseInt(weeklyWorkingHours) || 40;
    const overtimeHours = parseInt(monthlyOvertimeHours) || 0;
    const nightHours = parseInt(monthlyNightHours) || 0;
    const holidayHours = parseInt(monthlyHolidayHours) || 0;

    // 월 근로시간 계산 (주당 근로시간 × 4.345주)
    const monthlyRegularHours = weeklyHours * 4.345;
    const totalWorkingHours = monthlyRegularHours + overtimeHours + nightHours + holidayHours;

    // 최저임금 산입범위 계산
    // 산입: 기본급 + 고정수당 + 연장근로수당 + 야간근로수당 + 휴일근로수당
    // 제외: 상여금, 복리후생비, 월 지급액의 1/25 초과 식대/교통비
    const mealTransportLimit = (basePay + allowances) / 25;
    const excludedMeals = Math.max(0, meals - mealTransportLimit);
    const excludedTransport = Math.max(0, transport - mealTransportLimit);
    const excludedBonus = bonus; // 상여금은 전액 제외

    const totalPay = basePay + overtimePay + nightPay + holidayPay + allowances + bonus + meals + transport;
    const excludedPay = excludedMeals + excludedTransport + excludedBonus;
    const includedPay = totalPay - excludedPay;

    // 시간당 임금 계산
    const currentHourlyWage = totalWorkingHours > 0 ? includedPay / totalWorkingHours : 0;

    // 위반 여부 판정
    const isViolation = currentHourlyWage < minWage.hourly;
    const shortfall = isViolation ? minWage.hourly - currentHourlyWage : 0;

    // 개선 권고사항 생성
    const recommendations: string[] = [];
    
    if (isViolation) {
      const requiredIncrease = shortfall * totalWorkingHours;
      recommendations.push(`시간당 임금을 ${shortfall.toLocaleString()}원 이상 인상해야 합니다.`);
      recommendations.push(`월 총 임금을 ${Math.ceil(requiredIncrease).toLocaleString()}원 이상 인상해야 합니다.`);
      
      if (weeklyHours > 40) {
        recommendations.push("주당 근로시간을 40시간 이내로 조정하는 것을 검토해보세요.");
      }
      
      if (overtimeHours > 0) {
        recommendations.push("연장근로수당이 최저임금법 기준(시급의 50% 가산)을 충족하는지 확인하세요.");
      }
      
      recommendations.push("기본급 인상, 고정수당 신설, 또는 근로시간 단축을 검토하세요.");
    } else {
      recommendations.push("현재 임금 수준이 최저임금법을 준수하고 있습니다.");
      const surplus = currentHourlyWage - minWage.hourly;
      recommendations.push(`시간당 ${surplus.toLocaleString()}원의 여유가 있습니다.`);
    }

    const calculationResult: MinimumWageResult = {
      year: currentYear,
      hourlyMinWage: minWage.hourly,
      monthlyMinWage: minWage.monthly,
      isViolation,
      currentHourlyWage,
      shortfall,
      recommendations,
      calculationDetails: {
        totalWorkingHours,
        regularHours: monthlyRegularHours,
        overtimeHours,
        nightHours,
        holidayHours,
        totalBasePay: totalPay,
        regularPay: basePay,
        overtimePay,
        nightPay,
        holidayPay,
        excludedPay,
        includedPay
      }
    };

    setResult(calculationResult);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
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
                <TrendingUp className="h-6 w-6 text-teal-600" />
                <h1 className="text-xl font-bold text-black">최저임금 위반 확인</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Calculator className="h-6 w-6 mr-3 text-teal-600" />
              임금 정보 입력
            </h2>

            <div className="space-y-6">
              {/* 급여 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-teal-600" />
                  월급여 정보 (원)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      기본급 *
                    </label>
                    <input
                      type="number"
                      value={monthlyBasePay}
                      onChange={(e) => setMonthlyBasePay(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 2000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      연장근로수당
                    </label>
                    <input
                      type="number"
                      value={monthlyOvertimePay}
                      onChange={(e) => setMonthlyOvertimePay(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 200000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      야간근로수당
                    </label>
                    <input
                      type="number"
                      value={monthlyNightPay}
                      onChange={(e) => setMonthlyNightPay(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 100000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      휴일근로수당
                    </label>
                    <input
                      type="number"
                      value={monthlyHolidayPay}
                      onChange={(e) => setMonthlyHolidayPay(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 150000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      각종 수당
                    </label>
                    <input
                      type="number"
                      value={monthlyAllowances}
                      onChange={(e) => setMonthlyAllowances(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 300000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      상여금 (제외대상)
                    </label>
                    <input
                      type="number"
                      value={monthlyBonus}
                      onChange={(e) => setMonthlyBonus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 500000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      식대
                    </label>
                    <input
                      type="number"
                      value={monthlyMeals}
                      onChange={(e) => setMonthlyMeals(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 100000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      교통비
                    </label>
                    <input
                      type="number"
                      value={monthlyTransport}
                      onChange={(e) => setMonthlyTransport(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 100000"
                    />
                  </div>
                </div>
              </div>

              {/* 근로시간 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-teal-600" />
                  근로시간 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      주당 근로시간 *
                    </label>
                    <input
                      type="number"
                      value={weeklyWorkingHours}
                      onChange={(e) => setWeeklyWorkingHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      월 연장근로시간
                    </label>
                    <input
                      type="number"
                      value={monthlyOvertimeHours}
                      onChange={(e) => setMonthlyOvertimeHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      월 야간근로시간
                    </label>
                    <input
                      type="number"
                      value={monthlyNightHours}
                      onChange={(e) => setMonthlyNightHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      월 휴일근로시간
                    </label>
                    <input
                      type="number"
                      value={monthlyHolidayHours}
                      onChange={(e) => setMonthlyHolidayHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
                      placeholder="예: 8"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={calculateMinimumWage}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                최저임금 위반 여부 확인
              </button>
            </div>
          </div>

          {/* 결과 표시 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-3 text-teal-600" />
              분석 결과
            </h2>

            {result ? (
              <div className="space-y-6">
                {/* 위반 여부 결과 */}
                <div className={`border rounded-lg p-4 ${
                  result.isViolation
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    {result.isViolation ? (
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    ) : (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    )}
                    <h3 className={`text-lg font-semibold ${
                      result.isViolation ? 'text-red-800' : 'text-green-800'
                    }`}>
                      {result.isViolation ? '⚠️ 최저임금법 위반' : '✅ 최저임금법 준수'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-700">📊 {result.year}년 최저임금</p>
                      <p className="font-bold text-lg">{result.hourlyMinWage.toLocaleString()}원/시간</p>
                    </div>
                    <div>
                      <p className="text-gray-700">💰 현재 시간당 임금</p>
                      <p className={`font-bold text-lg ${
                        result.isViolation ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {Math.round(result.currentHourlyWage).toLocaleString()}원/시간
                      </p>
                    </div>
                  </div>

                  {result.isViolation && (
                    <div className="mt-3 p-3 bg-red-100 rounded-lg">
                      <p className="text-red-800 font-medium">
                        시간당 {Math.round(result.shortfall).toLocaleString()}원 부족
                      </p>
                    </div>
                  )}
                </div>

                {/* 상세 계산 내역 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-black mb-3 flex items-center">
                    <Calculator className="h-4 w-4 mr-2" />
                    상세 계산 내역
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">근로시간</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>정규시간:</span>
                          <span>{Math.round(result.calculationDetails.regularHours)}시간</span>
                        </div>
                        <div className="flex justify-between">
                          <span>연장시간:</span>
                          <span>{result.calculationDetails.overtimeHours}시간</span>
                        </div>
                        <div className="flex justify-between">
                          <span>야간시간:</span>
                          <span>{result.calculationDetails.nightHours}시간</span>
                        </div>
                        <div className="flex justify-between">
                          <span>휴일시간:</span>
                          <span>{result.calculationDetails.holidayHours}시간</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>총 근로시간:</span>
                          <span>{Math.round(result.calculationDetails.totalWorkingHours)}시간</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-700">임금 구성</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>총 지급액:</span>
                          <span>{result.calculationDetails.totalBasePay.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>제외 금액:</span>
                          <span>-{result.calculationDetails.excludedPay.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1 text-green-600">
                          <span>산입 금액:</span>
                          <span>{result.calculationDetails.includedPay.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 개선 권고사항 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    개선 권고사항
                  </h4>
                  <ul className="space-y-2">
                    {result.recommendations.map((recommendation, index) => (
                      <li key={index} className="text-blue-700 text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">임금 정보를 입력하고 확인 버튼을 누르세요.</p>
              </div>
            )}
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-teal-600" />
            최저임금법 주요 내용
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-black space-y-3">
            <div>
              <h4 className="font-semibold mb-2">📋 최저임금 산입범위 (시행령 제5조)</h4>
              <div className="ml-4 space-y-1">
                <p><strong>✅ 산입대상:</strong> 기본급, 고정수당, 연장·야간·휴일 근로수당</p>
                <p><strong>❌ 제외대상:</strong> 상여금, 복리후생비, 월 지급액의 1/25 초과 식대·교통비</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">⚖️ 위반 시 처벌 (제28조)</h4>
              <p className="ml-4">3년 이하의 징역 또는 2천만원 이하의 벌금</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">🔍 2024년 최저임금</h4>
              <p className="ml-4">시간급 9,860원 (전년 대비 2.5% 인상)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}