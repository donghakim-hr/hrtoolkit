"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Calculator, Info, AlertCircle, Download, FileSpreadsheet, Save, Check } from "lucide-react";
import { RetirementTaxResult } from "@/types";
import { exportRetirementTaxToPDF, exportRetirementTaxToExcel } from "@/utils/exportUtils";

interface UserSession {
  userId: string;
  username: string;
  name: string;
  email: string;
}

function RetirementTaxContent() {
  const searchParams = useSearchParams();
  const [retirementPay, setRetirementPay] = useState("");
  const [workingYears, setWorkingYears] = useState("");
  const [age, setAge] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // 분리 입력 상태
  const [sY, setSY] = useState(""); const [sM, setSM] = useState(""); const [sD, setSD] = useState("");
  const [eY, setEY] = useState(""); const [eM, setEM] = useState(""); const [eD, setED] = useState("");
  const sMRef = useRef<HTMLInputElement>(null);
  const sDRef = useRef<HTMLInputElement>(null);
  const eYRef = useRef<HTMLInputElement>(null);
  const eMRef = useRef<HTMLInputElement>(null);
  const eDRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<RetirementTaxResult | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // URL 파라미터에서 값을 받아와서 자동 입력
  useEffect(() => {
    const retirementPayParam = searchParams.get('retirementPay');
    const workingYearsParam = searchParams.get('workingYears');

    if (retirementPayParam) {
      const formattedPay = parseInt(retirementPayParam).toLocaleString();
      setRetirementPay(formattedPay);
    }

    if (workingYearsParam) {
      setWorkingYears(workingYearsParam);
    }
  }, [searchParams]);

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
          type: 'retirement-tax',
          title: saveTitle || `퇴직소득세 계산 - ${result.retirementAmount.toLocaleString()}원`,
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

  const calculateRetirementTax = () => {
    if (!retirementPay || !workingYears) {
      alert("퇴직급여와 근속연수를 입력해주세요.");
      return;
    }

    const retirementAmount = parseInt(retirementPay.replace(/,/g, ""));
    const years = parseInt(workingYears);
    const workerAge = age ? parseInt(age) : 0;

    // 1단계: 퇴직소득공제 계산 (소득세법 제48조)
    let retirementDeduction = 0;
    if (years <= 5) {
      retirementDeduction = years * 3000000;
    } else if (years <= 10) {
      retirementDeduction = 15000000 + (years - 5) * 5000000;
    } else if (years <= 20) {
      retirementDeduction = 40000000 + (years - 10) * 7000000;
    } else {
      retirementDeduction = 110000000 + (years - 20) * 10000000;
    }

    // 2단계: 과세표준 = 퇴직급여 - 퇴직소득공제
    const taxableIncome = Math.max(0, retirementAmount - retirementDeduction);

    // 3단계: 환산급여 = (과세표준 ÷ 근속연수) × 12
    const convertedIncome = Math.floor((taxableIncome / years) * 12);

    // 4단계: 환산급여공제 계산 (소득세법 시행령 제42조의2)
    let hwansanDeduction = 0;
    if (convertedIncome <= 8000000) {
      hwansanDeduction = convertedIncome; // 전액공제
    } else if (convertedIncome <= 70000000) {
      hwansanDeduction = 8000000 + Math.floor((convertedIncome - 8000000) * 0.6);
    } else if (convertedIncome <= 100000000) {
      hwansanDeduction = 45200000 + Math.floor((convertedIncome - 70000000) * 0.55);
    } else if (convertedIncome <= 300000000) {
      hwansanDeduction = 61700000 + Math.floor((convertedIncome - 100000000) * 0.45);
    } else {
      hwansanDeduction = 151700000 + Math.floor((convertedIncome - 300000000) * 0.35);
    }

    // 5단계: 환산과세표준 = 환산급여 - 환산급여공제
    const hwansanTaxableIncome = Math.max(0, convertedIncome - hwansanDeduction);

    // 6단계: 환산산출세액 = 환산과세표준에 누진세율 적용 (2026년 기준)
    let hwansanCalculatedTax = 0;
    let taxRate = 0;
    if (hwansanTaxableIncome <= 14000000) {
      taxRate = 6;
      hwansanCalculatedTax = Math.floor(hwansanTaxableIncome * 0.06);
    } else if (hwansanTaxableIncome <= 50000000) {
      taxRate = 15;
      hwansanCalculatedTax = Math.floor(840000 + (hwansanTaxableIncome - 14000000) * 0.15);
    } else if (hwansanTaxableIncome <= 88000000) {
      taxRate = 24;
      hwansanCalculatedTax = Math.floor(6240000 + (hwansanTaxableIncome - 50000000) * 0.24);
    } else if (hwansanTaxableIncome <= 150000000) {
      taxRate = 35;
      hwansanCalculatedTax = Math.floor(15360000 + (hwansanTaxableIncome - 88000000) * 0.35);
    } else if (hwansanTaxableIncome <= 300000000) {
      taxRate = 38;
      hwansanCalculatedTax = Math.floor(37060000 + (hwansanTaxableIncome - 150000000) * 0.38);
    } else if (hwansanTaxableIncome <= 500000000) {
      taxRate = 40;
      hwansanCalculatedTax = Math.floor(94060000 + (hwansanTaxableIncome - 300000000) * 0.40);
    } else if (hwansanTaxableIncome <= 1000000000) {
      taxRate = 42;
      hwansanCalculatedTax = Math.floor(174060000 + (hwansanTaxableIncome - 500000000) * 0.42);
    } else {
      taxRate = 45;
      hwansanCalculatedTax = Math.floor(384060000 + (hwansanTaxableIncome - 1000000000) * 0.45);
    }

    // 7단계: 산출세액 = (환산산출세액 ÷ 12) × 근속연수
    const calculatedTax = Math.floor((hwansanCalculatedTax / 12) * years);

    // 8단계: 퇴직소득세 = 산출세액 (2023년 개정 이후 20% 감면 폐지)
    const retirementTax = calculatedTax;

    // 9단계: 지방소득세 = 퇴직소득세 × 10%
    const localTax = Math.floor(retirementTax * 0.1);

    // 총 세액 및 실수령액
    const totalTax = retirementTax + localTax;
    const netAmount = retirementAmount - totalTax;
    const effectiveRate = (totalTax / retirementAmount) * 100;

    setResult({
      retirementAmount,
      workingYears: years,
      age: workerAge,
      retirementDeduction,
      taxableIncome,
      convertedIncome,
      hwansanDeduction,
      hwansanTaxableIncome,
      hwansanCalculatedTax,
      taxRate,
      calculatedTax,
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

  // 입퇴사일로 근속연수 자동 계산
  const calcWorkingYearsFromDates = (start: string, end: string) => {
    if (!start || !end) return;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s) return;
    const days = Math.floor((e.getTime() - s.getTime()) / 86400000);
    const years = Math.floor(days / 365);
    if (years >= 1) setWorkingYears(String(years));
  };

  const buildDate = (y: string, m: string, d: string) => {
    if (y.length === 4 && m.length === 2 && d.length === 2) return `${y}-${m}-${d}`;
    return "";
  };

  // 입사일 핸들러
  const handleSY = (v: string) => { const val = v.replace(/\D/g,"").slice(0,4); setSY(val); if(val.length===4) sMRef.current?.focus(); const date=buildDate(val,sM,sD); if(date){setStartDate(date); calcWorkingYearsFromDates(date,endDate);} };
  const handleSM = (v: string) => { const val = v.replace(/\D/g,"").slice(0,2); setSM(val); if(val.length===2) sDRef.current?.focus(); const date=buildDate(sY,val,sD); if(date){setStartDate(date); calcWorkingYearsFromDates(date,endDate);} };
  const handleSD = (v: string) => { const val = v.replace(/\D/g,"").slice(0,2); setSD(val); if(val.length===2) eYRef.current?.focus(); const date=buildDate(sY,sM,val); if(date){setStartDate(date); calcWorkingYearsFromDates(date,endDate);} };

  // 퇴사일 핸들러
  const handleEY = (v: string) => { const val = v.replace(/\D/g,"").slice(0,4); setEY(val); if(val.length===4) eMRef.current?.focus(); const date=buildDate(val,eM,eD); if(date){setEndDate(date); calcWorkingYearsFromDates(startDate,date);} };
  const handleEM = (v: string) => { const val = v.replace(/\D/g,"").slice(0,2); setEM(val); if(val.length===2) eDRef.current?.focus(); const date=buildDate(eY,val,eD); if(date){setEndDate(date); calcWorkingYearsFromDates(startDate,date);} };
  const handleED = (v: string) => { const val = v.replace(/\D/g,"").slice(0,2); setED(val); const date=buildDate(eY,eM,val); if(date){setEndDate(date); calcWorkingYearsFromDates(startDate,date);} };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
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
                <FileText className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold text-black">퇴직소득세 계산기</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 퇴직금 계산에서 연결된 경우 안내문 표시 */}
        {searchParams.get('retirementPay') && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Info className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-blue-800 font-medium">퇴직금 계산에서 연결되었습니다</p>
                <p className="text-blue-700 text-sm">
                  계산된 퇴직급여 정보가 자동으로 입력되었습니다. 추가 정보를 입력하여 퇴직소득세를 계산해보세요.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 폼 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
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
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  />
                  <span className="absolute right-3 top-2 text-black">원</span>
                </div>
              </div>

              {/* 입퇴사일로 근속연수 자동 계산 */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-purple-700">입퇴사일 입력 시 근속연수 자동 계산</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-black mb-1">입사일</label>
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="numeric" placeholder="YYYY" value={sY} onChange={(e) => handleSY(e.target.value)}
                        className="w-14 px-1.5 py-1.5 border border-gray-300 rounded text-center text-sm text-black focus:ring-1 focus:ring-purple-400" />
                      <span className="text-gray-400 text-xs">/</span>
                      <input type="text" inputMode="numeric" placeholder="MM" value={sM} onChange={(e) => handleSM(e.target.value)} ref={sMRef}
                        className="w-10 px-1 py-1.5 border border-gray-300 rounded text-center text-sm text-black focus:ring-1 focus:ring-purple-400" />
                      <span className="text-gray-400 text-xs">/</span>
                      <input type="text" inputMode="numeric" placeholder="DD" value={sD} onChange={(e) => handleSD(e.target.value)} ref={sDRef}
                        className="w-10 px-1 py-1.5 border border-gray-300 rounded text-center text-sm text-black focus:ring-1 focus:ring-purple-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-black mb-1">퇴사일</label>
                    <div className="flex items-center gap-1">
                      <input type="text" inputMode="numeric" placeholder="YYYY" value={eY} onChange={(e) => handleEY(e.target.value)} ref={eYRef}
                        className="w-14 px-1.5 py-1.5 border border-gray-300 rounded text-center text-sm text-black focus:ring-1 focus:ring-purple-400" />
                      <span className="text-gray-400 text-xs">/</span>
                      <input type="text" inputMode="numeric" placeholder="MM" value={eM} onChange={(e) => handleEM(e.target.value)} ref={eMRef}
                        className="w-10 px-1 py-1.5 border border-gray-300 rounded text-center text-sm text-black focus:ring-1 focus:ring-purple-400" />
                      <span className="text-gray-400 text-xs">/</span>
                      <input type="text" inputMode="numeric" placeholder="DD" value={eD} onChange={(e) => handleED(e.target.value)} ref={eDRef}
                        className="w-10 px-1 py-1.5 border border-gray-300 rounded text-center text-sm text-black focus:ring-1 focus:ring-purple-400" />
                    </div>
                  </div>
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
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                  />
                  <span className="absolute right-3 top-2 text-black">년</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">* 위에서 입퇴사일 입력 시 자동 계산됩니다</p>
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
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
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
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
              <FileText className="h-6 w-6 mr-3 text-purple-600" />
              계산 결과
            </h2>

            {result ?
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

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">① 퇴직급여</span>
                    <span className="font-medium text-black">{result.retirementAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">② 퇴직소득공제 (근속연수공제)</span>
                    <span className="font-medium text-green-600">-{result.retirementDeduction.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">③ 과세표준 (①-②)</span>
                    <span className="font-medium text-black">{result.taxableIncome.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">④ 환산급여 (③÷{result.workingYears}년×12)</span>
                    <span className="font-medium text-black">{result.convertedIncome.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">⑤ 환산급여공제</span>
                    <span className="font-medium text-green-600">-{result.hwansanDeduction.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">⑥ 환산과세표준 (④-⑤)</span>
                    <span className="font-medium text-black">{result.hwansanTaxableIncome.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">⑦ 적용세율</span>
                    <span className="font-medium text-black">{result.taxRate}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">⑧ 환산산출세액</span>
                    <span className="font-medium text-black">{result.hwansanCalculatedTax.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">⑨ 산출세액 (⑧÷12×{result.workingYears}년)</span>
                    <span className="font-medium text-black">{result.calculatedTax.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">⑩ 퇴직소득세</span>
                    <span className="font-medium text-red-600">{result.retirementTax.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <span className="text-black">⑪ 지방소득세 (⑩×10%)</span>
                    <span className="font-medium text-red-600">{result.localTax.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between py-2 bg-gray-50 rounded px-3 mt-1">
                    <span className="font-semibold text-black">총 세액 (⑩+⑪)</span>
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
                        <Save className="h-5 w-5 mr-2 text-purple-600" />
                        계산 결과 저장
                      </h4>
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        내 계정에 저장하기
                      </button>
                      <p className="text-xs text-black mt-2">
                        계산 결과를 내 계정에 저장하여 나중에 다시 확인할 수 있습니다
                      </p>
                    </div>
                  )}

                  {/* 출력 버튼들 */}
                  <div>
                    <h4 className="font-medium text-black mb-3 flex items-center">
                      <Download className="h-5 w-5 mr-2 text-purple-600" />
                      계산 결과 출력
                    </h4>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => exportRetirementTaxToPDF(result)}
                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF 다운로드
                      </button>
                      <button
                        onClick={() => exportRetirementTaxToExcel(result)}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel 다운로드
                      </button>
                    </div>
                    <p className="text-xs text-black mt-2">
                      계산 결과를 PDF 또는 Excel 파일로 저장할 수 있습니다
                    </p>
                  </div>
                </div>
              </div>
            :
              <div className="text-center text-black py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-black" />
                <p className="text-black">정보를 입력하고 계산 버튼을 눌러주세요.</p>
              </div>
            }
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
                  placeholder={`퇴직소득세 계산 - ${result?.retirementAmount.toLocaleString()}원`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
            <Info className="h-5 w-5 mr-2 text-purple-600" />
            법적 근거 및 계산 방법
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-black space-y-4">
            <div>
              <p className="font-medium mb-2">① 퇴직소득공제 (소득세법 제48조)</p>
              <ul className="space-y-1 ml-4 text-xs">
                <li>• 5년 이하: 근속연수 × 300만원</li>
                <li>• 6~10년: 1,500만원 + (근속연수-5) × 500만원</li>
                <li>• 11~20년: 4,000만원 + (근속연수-10) × 700만원</li>
                <li>• 21년 이상: 1억1,000만원 + (근속연수-20) × 1,000만원</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-2">② 환산급여공제 (소득세법 시행령 제42조의2)</p>
              <ul className="space-y-1 ml-4 text-xs">
                <li>• 환산급여 800만원 이하: 전액공제</li>
                <li>• 800만원 초과 ~ 7,000만원: 800만원 + 초과액 × 60%</li>
                <li>• 7,000만원 초과 ~ 1억원: 4,520만원 + 초과액 × 55%</li>
                <li>• 1억원 초과 ~ 3억원: 6,170만원 + 초과액 × 45%</li>
                <li>• 3억원 초과: 15,170만원 + 초과액 × 35%</li>
              </ul>
            </div>

            <div>
              <p className="font-medium mb-2">③ 퇴직소득세 계산 단계 (2023년 개정 현행)</p>
              <ol className="space-y-1 ml-4 text-xs">
                <li>1. 과세표준 = 퇴직급여 - 퇴직소득공제</li>
                <li>2. 환산급여 = (과세표준 ÷ 근속연수) × 12</li>
                <li>3. 환산급여공제 계산</li>
                <li>4. 환산과세표준 = 환산급여 - 환산급여공제</li>
                <li>5. 환산산출세액 = 환산과세표준에 누진세율 적용</li>
                <li>6. 산출세액 = (환산산출세액 ÷ 12) × 근속연수</li>
                <li>7. 퇴직소득세 = 산출세액 (20% 감면 폐지, 2023년 이후)</li>
                <li>8. 지방소득세 = 퇴직소득세 × 10%</li>
              </ol>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              ※ 2026년 세율 기준 / 2023.1.1 소득세법 개정으로 환산급여공제 방식 적용 (20% 감면 폐지)
            </p>
            <p className="text-xs text-red-600">
              ⚠️ 본 계산은 일반적인 경우를 기준으로 하며, 개인별 특수상황은 반영되지 않습니다. 정확한 세액은 세무사 상담을 권장합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RetirementTaxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-black">로딩 중...</p>
      </div>
    </div>}>
      <RetirementTaxContent />
    </Suspense>
  );
}