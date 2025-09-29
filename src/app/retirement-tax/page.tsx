"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Calculator, Info, AlertCircle } from "lucide-react";
import { RetirementTaxResult } from "@/types";

export default function RetirementTaxPage() {
  const [retirementPay, setRetirementPay] = useState("");
  const [workingYears, setWorkingYears] = useState("");
  const [age, setAge] = useState("");
  const [result, setResult] = useState<RetirementTaxResult | null>(null);

  const calculateRetirementTax = () => {
    if (!retirementPay || !workingYears) {
      alert("퇴직급여와 근속연수를 입력해주세요.");
      return;
    }

    const retirementAmount = parseInt(retirementPay.replace(/,/g, ""));
    const years = parseInt(workingYears);
    const workerAge = age ? parseInt(age) : 0;

    // 1단계: 퇴직소득 공제 계산
    let retirementDeduction = 0;
    if (years <= 5) {
      retirementDeduction = years * 3000000; // 300만원 × 근속연수
    } else if (years <= 10) {
      retirementDeduction = 15000000 + (years - 5) * 5000000; // 1,500만원 + (근속연수-5) × 500만원
    } else if (years <= 20) {
      retirementDeduction = 40000000 + (years - 10) * 7000000; // 4,000만원 + (근속연수-10) × 700만원
    } else {
      retirementDeduction = 110000000 + (years - 20) * 10000000; // 1억1,000만원 + (근속연수-20) × 1,000만원
    }

    // 2단계: 과세표준 계산
    const taxableIncome = Math.max(0, retirementAmount - retirementDeduction);

    // 3단계: 환산소득 계산 (과세표준 ÷ 근속연수, 소수점 이하 절사)
    const convertedIncome = Math.floor(taxableIncome / years);

    // 4단계: 환산소득에 대한 소득세 계산 (2024년 소득세율 적용)
    let taxOnConverted = 0;
    let taxRate = 0;

    if (convertedIncome <= 14000000) {
      taxRate = 6;
      taxOnConverted = convertedIncome * 0.06;
    } else if (convertedIncome <= 50000000) {
      taxRate = 15;
      taxOnConverted = 840000 + (convertedIncome - 14000000) * 0.15;
    } else if (convertedIncome <= 88000000) {
      taxRate = 24;
      taxOnConverted = 6240000 + (convertedIncome - 50000000) * 0.24;
    } else if (convertedIncome <= 150000000) {
      taxRate = 35;
      taxOnConverted = 15360000 + (convertedIncome - 88000000) * 0.35;
    } else if (convertedIncome <= 300000000) {
      taxRate = 38;
      taxOnConverted = 37060000 + (convertedIncome - 150000000) * 0.38;
    } else if (convertedIncome <= 500000000) {
      taxRate = 40;
      taxOnConverted = 94060000 + (convertedIncome - 300000000) * 0.40;
    } else if (convertedIncome <= 1000000000) {
      taxRate = 42;
      taxOnConverted = 174060000 + (convertedIncome - 500000000) * 0.42;
    } else {
      taxRate = 45;
      taxOnConverted = 384060000 + (convertedIncome - 1000000000) * 0.45;
    }

    // 5단계: 산출세액 계산
    const calculatedTax = taxOnConverted * years;

    // 6단계: 퇴직소득세 계산 (산출세액에서 20% 감면)
    const retirementTax = Math.floor(calculatedTax * 0.8);

    // 7단계: 지방소득세 계산 (퇴직소득세의 10%)
    const localTax = Math.floor(retirementTax * 0.1);

    // 총 세액
    const totalTax = retirementTax + localTax;

    // 실수령액
    const netAmount = retirementAmount - totalTax;

    // 실효세율
    const effectiveRate = (totalTax / retirementAmount) * 100;

    setResult({
      retirementAmount,
      workingYears: years,
      age: workerAge,
      retirementDeduction,
      taxableIncome,
      convertedIncome,
      taxRate,
      calculatedTax: Math.floor(calculatedTax),
      retirementTax,
      localTax,
      totalTax,
      netAmount,
      effectiveRate: effectiveRate.toFixed(2)
    });
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

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
                <FileText className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">퇴직소득세 계산기</h1>
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
              <Calculator className="h-6 w-6 mr-3 text-purple-600" />
              정보 입력
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  퇴직급여 *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={retirementPay}
                    onChange={(e) => setRetirementPay(formatNumber(e.target.value))}
                    placeholder="예: 50,000,000"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2 text-black">원</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  근속연수 *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={workingYears}
                    onChange={(e) => setWorkingYears(e.target.value)}
                    placeholder="예: 10"
                    min="1"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2 text-black">년</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  나이 (선택)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="예: 55"
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2 text-black">세</span>
                </div>
                <p className="text-xs text-black mt-1">
                  * 만55세 이상 퇴직 시 추가 혜택이 있을 수 있습니다
                </p>
              </div>

              <button
                onClick={calculateRetirementTax}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                퇴직소득세 계산하기
              </button>
            </div>
          </div>

          {/* 결과 표시 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-purple-600" />
              계산 결과
            </h2>

            {result ? (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">실수령액</h3>
                  <div className="text-3xl font-bold text-purple-600">
                    {result.netAmount.toLocaleString()}원
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    실효세율: {result.effectiveRate}%
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">퇴직급여</span>
                    <span className="font-medium">{result.retirementAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">퇴직소득공제</span>
                    <span className="font-medium text-green-600">-{result.retirementDeduction.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">과세표준</span>
                    <span className="font-medium">{result.taxableIncome.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">환산소득</span>
                    <span className="font-medium">{result.convertedIncome.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">적용세율</span>
                    <span className="font-medium">{result.taxRate}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">퇴직소득세</span>
                    <span className="font-medium text-red-600">{result.retirementTax.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">지방소득세</span>
                    <span className="font-medium text-red-600">{result.localTax.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 bg-gray-50 rounded px-3">
                    <span className="font-medium text-black">총 세액</span>
                    <span className="font-bold text-red-600">{result.totalTax.toLocaleString()}원</span>
                  </div>
                </div>

                {result.age >= 55 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">만55세 이상 퇴직자 혜택</p>
                        <p className="text-sm text-blue-700 mt-1">
                          만55세 이상 퇴직 시 추가 세액공제나 분리과세 혜택이 있을 수 있습니다.
                          자세한 내용은 세무사와 상담하시기 바랍니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-black py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-black" />
                <p className="text-black">정보를 입력하고 계산 버튼을 눌러주세요.</p>
              </div>
            )}
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Info className="h-5 w-5 mr-2 text-purple-600" />
            법적 근거 및 계산 방법
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-black space-y-4">
            <div>
              <p className="font-medium mb-2">소득세법 제48조 (퇴직소득공제)</p>
              <ul className="space-y-1 ml-4 text-xs">
                <li>• 5년 이하: 근속연수 × 300만원</li>
                <li>• 6~10년: 1,500만원 + (근속연수-5) × 500만원</li>
                <li>• 11~20년: 4,000만원 + (근속연수-10) × 700만원</li>
                <li>• 21년 이상: 1억1,000만원 + (근속연수-20) × 1,000만원</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-2">퇴직소득세 계산 단계</p>
              <ol className="space-y-1 ml-4 text-xs">
                <li>1. 과세표준 = 퇴직급여 - 퇴직소득공제</li>
                <li>2. 환산소득 = 과세표준 ÷ 근속연수 (소수점 이하 절사)</li>
                <li>3. 환산소득에 누진세율 적용</li>
                <li>4. 산출세액 = 환산소득세액 × 근속연수</li>
                <li>5. 퇴직소득세 = 산출세액 × 80% (20% 감면)</li>
                <li>6. 지방소득세 = 퇴직소득세 × 10%</li>
              </ol>
            </div>

            <p className="text-xs text-black mt-3">
              ※ 2024년 세율 기준 / 시행일: 2024.1.1 (소득세법 시행령 개정)
            </p>
            <p className="text-xs text-red-600">
              ⚠️ 본 계산은 일반적인 경우를 기준으로 하며, 개인별 특수상황은 반영되지 않습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}