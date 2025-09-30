"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, Calendar, Info, AlertTriangle, Calculator } from "lucide-react";
import { RetirementPayResult } from "@/types";

export default function RetirementPayPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [averagePay, setAveragePay] = useState("");
  const [retirementType, setRetirementType] = useState("퇴직금");
  const [result, setResult] = useState<RetirementPayResult | null>(null);

  const calculateRetirementPay = () => {
    if (!startDate || !endDate || !averagePay) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthlyPay = parseInt(averagePay.replace(/,/g, ""));

    // 월급을 일급으로 변환 (월급 ÷ 30일)
    const avgPay = Math.round(monthlyPay / 30);

    if (start >= end) {
      alert("퇴사일은 입사일보다 나중이어야 합니다.");
      return;
    }

    // 근속기간 계산 (일수)
    const workingDays = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    const workingYears = Math.floor(workingDays / 365.25);
    const workingMonths = Math.floor(workingDays / 30.4375);

    // 퇴직급여 계산
    let retirementPay = 0;
    let calculationMethod = "";

    if (retirementType === "퇴직금") {
      // 퇴직금 = 평균임금 × 30일 × (근속연수 또는 근속일수/365)
      if (workingDays >= 365) {
        // 1년 이상 근속
        retirementPay = avgPay * 30 * (workingDays / 365);
        calculationMethod = `${avgPay.toLocaleString()}원 × 30일 × (${workingDays}일 ÷ 365) = ${Math.round(retirementPay).toLocaleString()}원`;
      } else {
        // 1년 미만 근속
        retirementPay = avgPay * workingDays;
        calculationMethod = `${avgPay.toLocaleString()}원 × ${workingDays}일 = ${Math.round(retirementPay).toLocaleString()}원`;
      }
    } else {
      // 퇴직연금은 기업별로 다르므로 기본 퇴직금 기준으로 참고값 제공
      retirementPay = avgPay * 30 * (workingDays / 365);
      calculationMethod = "퇴직연금은 기업의 적립 방식에 따라 달라집니다. (참고: 퇴직금 기준)";
    }

    // 계속근로가산금 계산 (5년 이상 계속근로 시)
    let continuousServiceBonus = 0;
    if (workingYears >= 5) {
      continuousServiceBonus = avgPay * 30 * Math.floor(workingYears / 5);
    }

    setResult({
      startDate: start.toLocaleDateString('ko-KR'),
      endDate: end.toLocaleDateString('ko-KR'),
      workingDays,
      workingYears,
      workingMonths,
      averagePay: avgPay,
      monthlyPay: monthlyPay,
      retirementPay: Math.round(retirementPay),
      continuousServiceBonus,
      totalAmount: Math.round(retirementPay + continuousServiceBonus),
      calculationMethod,
      retirementType
    });
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const goToRetirementTax = () => {
    if (!result) return;

    // 퇴직급여액과 근속연수를 URL 파라미터로 전달
    const params = new URLSearchParams({
      retirementPay: result.totalAmount.toString(),
      workingYears: result.workingYears.toString()
    });

    router.push(`/retirement-tax?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
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
                <DollarSign className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-gray-900">퇴직급여 계산기</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-green-600" />
              정보 입력
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  입사일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  퇴사일
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  평균임금 (월급)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={averagePay}
                    onChange={(e) => setAveragePay(formatNumber(e.target.value))}
                    placeholder="예: 3,000,000"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                  />
                  <span className="absolute right-3 top-2 text-black">원</span>
                </div>
                <p className="text-xs text-black mt-1">
                  * 퇴직일 이전 3개월간 지급받은 월평균 임금 (월 기준으로 입력)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  퇴직급여 제도
                </label>
                <select
                  value={retirementType}
                  onChange={(e) => setRetirementType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                >
                  <option value="퇴직금">퇴직금제</option>
                  <option value="퇴직연금">퇴직연금제 (참고)</option>
                </select>
              </div>

              <button
                onClick={calculateRetirementPay}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                퇴직급여 계산하기
              </button>
            </div>
          </div>

          {/* 결과 표시 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <DollarSign className="h-6 w-6 mr-3 text-green-600" />
              계산 결과
            </h2>

            {result ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">퇴직급여</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {result.totalAmount.toLocaleString()}원
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {result.retirementType} 기준
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">입사일</span>
                    <span className="font-medium">{result.startDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">퇴사일</span>
                    <span className="font-medium">{result.endDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">근속기간</span>
                    <span className="font-medium">{result.workingYears}년 {result.workingMonths % 12}개월</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">근속일수</span>
                    <span className="font-medium">{result.workingDays}일</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">평균임금 (월급)</span>
                    <span className="font-medium">{result.monthlyPay.toLocaleString()}원/월</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">평균임금 (일급)</span>
                    <span className="font-medium">{result.averagePay.toLocaleString()}원/일</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">기본 퇴직급여</span>
                    <span className="font-medium">{result.retirementPay.toLocaleString()}원</span>
                  </div>
                  {result.continuousServiceBonus > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-black">계속근로가산금</span>
                      <span className="font-medium text-green-600">{result.continuousServiceBonus.toLocaleString()}원</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-black mb-2">계산 방식</h4>
                  <p className="text-sm text-black">{result.calculationMethod}</p>
                </div>

                {result.retirementType === "퇴직연금" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">퇴직연금 안내</p>
                        <p className="text-sm text-amber-700 mt-1">
                          퇴직연금의 실제 수령액은 기업의 적립방식(DB/DC)과 운용성과에 따라 달라집니다.
                          정확한 금액은 퇴직연금사업자에게 문의하세요.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 퇴직소득세 계산 버튼 */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={goToRetirementTax}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
                  >
                    <Calculator className="h-5 w-5 mr-2" />
                    퇴직소득세 계산하기
                  </button>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    계산된 퇴직급여를 바탕으로 퇴직소득세를 자동 계산합니다
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-black py-8">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-black" />
                <p className="text-black">정보를 입력하고 계산 버튼을 눌러주세요.</p>
              </div>
            )}
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-green-600" />
            법적 근거
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-black space-y-4">
            <div>
              <p className="font-medium mb-2">근로자퇴직급여 보장법 제8조 (퇴직급여의 지급)</p>
              <ul className="space-y-1 ml-4">
                <li>• 퇴직금 = 평균임금 × 30일 × 근속연수</li>
                <li>• 평균임금: 퇴직일 이전 3개월간 지급받은 임금 총액 ÷ 그 기간의 총일수</li>
                <li>• 1년 미만 근속자도 퇴직급여 지급 대상</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-2">근로기준법 제34조 (계속근로가산금)</p>
              <ul className="space-y-1 ml-4">
                <li>• 5년 이상 계속근로자: 5년마다 평균임금 30일분 가산</li>
              </ul>
            </div>

            <p className="text-xs text-black mt-3">
              ※ 시행일: 2022.1.1 (법률 제18473호, 2021.8.17, 일부개정)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}