"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, Calendar, Info, AlertTriangle, Calculator, Download, FileText, FileSpreadsheet, Save, Check, Plus, Minus } from "lucide-react";
import { RetirementPayResult } from "@/types";
import { exportRetirementPayToPDF, exportRetirementPayToExcel } from "@/utils/exportUtils";

interface UserSession {
  userId: string;
  username: string;
  name: string;
  email: string;
}

interface MonthlyPayData {
  month: number;
  monthName: string;
  startDate: string;
  endDate: string;
  workingDays: string; // 월별 이수일수
  baseSalary: string;
  allowances: string[];
  totalAllowances: string;
  monthlyTotal: string;
}

interface AveragePayResult {
  month1: MonthlyPayData;
  month2: MonthlyPayData;
  month3: MonthlyPayData;
  retirementDate: string;
  totalWorkingDays: number;
  totalSalary: number;
  fixedBonus: string;
  annualLeaveAllowance: string;
  dailyFixedBonus: number;
  dailyAnnualLeaveAllowance: number;
  totalDailyPay: number;
  averagePay: number;
  period: {
    start: string;
    end: string;
    totalDays: number;
  };
}

export default function RetirementPayPage() {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [averagePay, setAveragePay] = useState("");
  const [retirementSystem, setRetirementSystem] = useState<"DB" | "DC" | "hybrid">("DB"); // DB형(확정급여형), DC형(확정기여형), 혼합형

  // DC형 관련 상태
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");

  // 혼합형 관련 상태
  const [dbRatio, setDbRatio] = useState("50");
  const [dcContribution, setDcContribution] = useState("");

  const [result, setResult] = useState<RetirementPayResult | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 평균임금 계산기 상태
  const [retirementDate, setRetirementDate] = useState("");
  const [month1Data, setMonth1Data] = useState<MonthlyPayData>({
    month: 1,
    monthName: "",
    startDate: "",
    endDate: "",
    workingDays: "",
    baseSalary: "",
    allowances: [""],
    totalAllowances: "0",
    monthlyTotal: "0"
  });
  const [month2Data, setMonth2Data] = useState<MonthlyPayData>({
    month: 2,
    monthName: "",
    startDate: "",
    endDate: "",
    workingDays: "",
    baseSalary: "",
    allowances: [""],
    totalAllowances: "0",
    monthlyTotal: "0"
  });
  const [month3Data, setMonth3Data] = useState<MonthlyPayData>({
    month: 3,
    monthName: "",
    startDate: "",
    endDate: "",
    workingDays: "",
    baseSalary: "",
    allowances: [""],
    totalAllowances: "0",
    monthlyTotal: "0"
  });
  const [fixedBonus, setFixedBonus] = useState("");
  const [annualLeaveAllowance, setAnnualLeaveAllowance] = useState("");
  const [averagePayResult, setAveragePayResult] = useState<AveragePayResult | null>(null);

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
          type: 'retirement-pay',
          title: saveTitle || `퇴직급여 계산 - ${result.startDate}`,
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

  const calculateRetirementPay = () => {
    // 공통 필드 검증
    if (!startDate || !endDate) {
      alert("입사일과 퇴사일을 입력해주세요.");
      return;
    }

    // 퇴직급여제도별 필수 필드 검증
    if (retirementSystem === "DB") {
      if (!averagePay) {
        alert("평균임금을 입력해주세요.");
        return;
      }
    } else if (retirementSystem === "DC") {
      if (!monthlyContribution || !annualReturn) {
        alert("월 기여금과 운용수익률을 입력해주세요.");
        return;
      }
    } else if (retirementSystem === "hybrid") {
      if (!averagePay || !dcContribution || !dbRatio) {
        alert("평균임금, 월 기여금, DB형 비율을 모두 입력해주세요.");
        return;
      }
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

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
    let systemType = "";

    if (retirementSystem === "DB") {
      // DB형 (확정급여형) / 퇴직금제도 계산
      const monthlyPay = parseInt(averagePay.replace(/,/g, ""));
      const avgPay = Math.round(monthlyPay / 30); // 월급을 일급으로 변환

      systemType = "DB형 (확정급여형)";

      if (workingDays >= 365) {
        // 1년 이상 근속: 평균임금 × 근속연수
        retirementPay = avgPay * 30 * (workingDays / 365);
        calculationMethod = `${avgPay.toLocaleString()}원(일급) × 30일 × (${workingDays}일 ÷ 365) = ${Math.round(retirementPay).toLocaleString()}원`;
      } else {
        // 1년 미만 근속
        retirementPay = avgPay * workingDays;
        calculationMethod = `${avgPay.toLocaleString()}원(일급) × ${workingDays}일 = ${Math.round(retirementPay).toLocaleString()}원`;
      }

    } else if (retirementSystem === "DC") {
      // DC형 (확정기여형) 계산
      const monthlyContrib = parseInt(monthlyContribution.replace(/,/g, ""));
      const annualReturnRate = parseFloat(annualReturn) / 100;

      systemType = "DC형 (확정기여형)";

      // 원금 = 월 기여금 × 근속월수
      const principal = monthlyContrib * workingMonths;

      // 복리 계산: FV = PMT × [((1 + r)^n - 1) / r]
      // 여기서 r = 월 수익률, n = 근속월수
      const monthlyReturnRate = annualReturnRate / 12;
      let accumulatedAmount = 0;

      if (monthlyReturnRate > 0) {
        accumulatedAmount = monthlyContrib * (Math.pow(1 + monthlyReturnRate, workingMonths) - 1) / monthlyReturnRate;
      } else {
        // 수익률이 0%인 경우
        accumulatedAmount = principal;
      }

      retirementPay = Math.round(accumulatedAmount);
      calculationMethod = `월 기여금 ${monthlyContrib.toLocaleString()}원 × ${workingMonths}개월, 연 수익률 ${annualReturn}% = ${retirementPay.toLocaleString()}원`;

    } else if (retirementSystem === "hybrid") {
      // 혼합형 계산
      const monthlyPay = parseInt(averagePay.replace(/,/g, ""));
      const avgPay = Math.round(monthlyPay / 30);
      const dbRatioNum = parseInt(dbRatio) / 100;
      const dcRatioNum = 1 - dbRatioNum;
      const dcContribAmount = parseInt(dcContribution.replace(/,/g, ""));

      systemType = "혼합형";

      // DB형 부분 계산
      let dbPortion = 0;
      if (workingDays >= 365) {
        dbPortion = (avgPay * 30 * (workingDays / 365)) * dbRatioNum;
      } else {
        dbPortion = (avgPay * workingDays) * dbRatioNum;
      }

      // DC형 부분 계산 (간단히 원금 기준으로 계산)
      const dcPortion = (dcContribAmount * workingMonths) * dcRatioNum;

      retirementPay = Math.round(dbPortion + dcPortion);
      calculationMethod = `DB형(${(dbRatioNum * 100).toFixed(0)}%): ${Math.round(dbPortion).toLocaleString()}원 + DC형(${(dcRatioNum * 100).toFixed(0)}%): ${Math.round(dcPortion).toLocaleString()}원`;
    }

    // 계속근로가산금 계산 (DB형에만 적용)
    let continuousServiceBonus = 0;
    if (retirementSystem === "DB" && workingYears >= 5) {
      const monthlyPay = parseInt(averagePay.replace(/,/g, ""));
      const avgPay = Math.round(monthlyPay / 30);
      continuousServiceBonus = avgPay * 30 * Math.floor(workingYears / 5);
    }

    setResult({
      startDate: start.toLocaleDateString('ko-KR'),
      endDate: end.toLocaleDateString('ko-KR'),
      workingDays,
      workingYears,
      workingMonths,
      averagePay: retirementSystem === "DB" ? Math.round(parseInt(averagePay.replace(/,/g, "")) / 30) : 0,
      monthlyPay: retirementSystem === "DB" ? parseInt(averagePay.replace(/,/g, "")) : 0,
      retirementPay: Math.round(retirementPay),
      continuousServiceBonus,
      totalAmount: Math.round(retirementPay + continuousServiceBonus),
      calculationMethod,
      retirementType: systemType,
      systemType: systemType
    });
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 퇴직일자 기준 3개월 기간 자동 계산
  const calculateThreeMonthPeriod = (retirementDateStr: string) => {
    if (!retirementDateStr) return;

    const retirementDate = new Date(retirementDateStr);
    const periodEnd = new Date(retirementDate);
    periodEnd.setDate(periodEnd.getDate() - 1); // 퇴직일 전날까지
    
    const periodStart = new Date(periodEnd);
    periodStart.setMonth(periodStart.getMonth() - 3);
    periodStart.setDate(periodStart.getDate() + 1); // 3개월 전 다음날부터

    // 각 월의 기간 계산
    const month3Start = new Date(periodStart);
    const month3End = new Date(month3Start.getFullYear(), month3Start.getMonth() + 1, 0); // 해당 월 마지막 날
    
    const month2Start = new Date(month3End);
    month2Start.setDate(month2Start.getDate() + 1);
    const month2End = new Date(month2Start.getFullYear(), month2Start.getMonth() + 1, 0);
    
    const month1Start = new Date(month2End);
    month1Start.setDate(month1Start.getDate() + 1);
    const month1End = new Date(periodEnd);

    // 월별 데이터 업데이트
    setMonth3Data(prev => ({
      ...prev,
      monthName: `${month3Start.getFullYear()}년 ${month3Start.getMonth() + 1}월`,
      startDate: month3Start.toLocaleDateString('ko-KR'),
      endDate: month3End.toLocaleDateString('ko-KR'),
      workingDays: "" // 사용자가 입력할 수 있도록 빈 값으로 설정
    }));

    setMonth2Data(prev => ({
      ...prev,
      monthName: `${month2Start.getFullYear()}년 ${month2Start.getMonth() + 1}월`,
      startDate: month2Start.toLocaleDateString('ko-KR'),
      endDate: month2End.toLocaleDateString('ko-KR'),
      workingDays: ""
    }));

    setMonth1Data(prev => ({
      ...prev,
      monthName: `${month1Start.getFullYear()}년 ${month1Start.getMonth() + 1}월`,
      startDate: month1Start.toLocaleDateString('ko-KR'),
      endDate: month1End.toLocaleDateString('ko-KR'),
      workingDays: ""
    }));
  };

  // 퇴직일자 변경 핸들러
  const handleRetirementDateChange = (dateString: string) => {
    setRetirementDate(dateString);
    calculateThreeMonthPeriod(dateString);
  };

  // 평균임금 계산 함수들
  const updateMonthData = (monthData: MonthlyPayData, setMonthData: (data: MonthlyPayData) => void, field: string, value: string, index?: number) => {
    const newData = { ...monthData };

    if (field === 'baseSalary') {
      newData.baseSalary = formatNumber(value);
    } else if (field === 'allowance' && index !== undefined) {
      newData.allowances[index] = formatNumber(value);
    } else if (field === 'workingDays') {
      newData.workingDays = value;
    }

    // 수당 총합 계산
    const totalAllowances = newData.allowances.reduce((sum, allowance) => {
      return sum + (parseInt(allowance.replace(/,/g, '')) || 0);
    }, 0);
    newData.totalAllowances = totalAllowances.toLocaleString();

    // 월 총액 계산
    const baseSalaryNum = parseInt(newData.baseSalary.replace(/,/g, '')) || 0;
    newData.monthlyTotal = (baseSalaryNum + totalAllowances).toLocaleString();

    setMonthData(newData);
  };

  const addAllowance = (monthData: MonthlyPayData, setMonthData: (data: MonthlyPayData) => void) => {
    const newData = { ...monthData };
    newData.allowances.push("");
    setMonthData(newData);
  };

  const removeAllowance = (monthData: MonthlyPayData, setMonthData: (data: MonthlyPayData) => void, index: number) => {
    if (monthData.allowances.length <= 1) return;
    const newData = { ...monthData };
    newData.allowances.splice(index, 1);

    // 수당 총합 다시 계산
    const totalAllowances = newData.allowances.reduce((sum, allowance) => {
      return sum + (parseInt(allowance.replace(/,/g, '')) || 0);
    }, 0);
    newData.totalAllowances = totalAllowances.toLocaleString();

    // 월 총액 다시 계산
    const baseSalaryNum = parseInt(newData.baseSalary.replace(/,/g, '')) || 0;
    newData.monthlyTotal = (baseSalaryNum + totalAllowances).toLocaleString();

    setMonthData(newData);
  };

  const calculateAveragePay = () => {
    // 입력 검증
    if (!retirementDate || !month1Data.baseSalary || !month2Data.baseSalary || !month3Data.baseSalary) {
      alert("퇴사일과 3개월 급여 정보를 모두 입력해주세요.");
      return;
    }

    if (!month1Data.workingDays || !month2Data.workingDays || !month3Data.workingDays) {
      alert("각 월의 이수일수를 입력해주세요.");
      return;
    }

    // 3개월 총 급여 계산
    const month1Total = parseInt(month1Data.monthlyTotal.replace(/,/g, '')) || 0;
    const month2Total = parseInt(month2Data.monthlyTotal.replace(/,/g, '')) || 0;
    const month3Total = parseInt(month3Data.monthlyTotal.replace(/,/g, '')) || 0;
    const totalSalary = month1Total + month2Total + month3Total;

    // 3개월 총 이수일수 (실제 근무일수)
    const month1Days = parseInt(month1Data.workingDays) || 0;
    const month2Days = parseInt(month2Data.workingDays) || 0;
    const month3Days = parseInt(month3Data.workingDays) || 0;
    const totalWorkingDays = month1Days + month2Days + month3Days;

    if (totalWorkingDays === 0) {
      alert("총 이수일수가 0일입니다. 이수일수를 확인해주세요.");
      return;
    }

    // 기본 평균임금 (일급) = 3개월 총 급여 ÷ 3개월 총 이수일수
    const basicAveragePay = totalSalary / totalWorkingDays;

    // 고정상여금 일할 계산 (연간 지급액 ÷ 365일)
    const fixedBonusNum = parseInt(fixedBonus.replace(/,/g, '')) || 0;
    const dailyFixedBonus = fixedBonusNum / 365;

    // 연차수당 일할 계산 (연간 지급액 ÷ 365일)
    const annualLeaveAllowanceNum = parseInt(annualLeaveAllowance.replace(/,/g, '')) || 0;
    const dailyAnnualLeaveAllowance = annualLeaveAllowanceNum / 365;

    // 최종 평균임금 (일급)
    const totalDailyPay = basicAveragePay + dailyFixedBonus + dailyAnnualLeaveAllowance;

    // 퇴직일 기준 기간 계산
    const retirementDateObj = new Date(retirementDate);
    const periodEnd = new Date(retirementDateObj);
    periodEnd.setDate(periodEnd.getDate() - 1);
    const periodStart = new Date(periodEnd);
    periodStart.setMonth(periodStart.getMonth() - 3);
    periodStart.setDate(periodStart.getDate() + 1);

    const period = {
      start: periodStart.toLocaleDateString('ko-KR'),
      end: periodEnd.toLocaleDateString('ko-KR'),
      totalDays: Math.floor((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000)) + 1
    };

    setAveragePayResult({
      month1: month1Data,
      month2: month2Data,
      month3: month3Data,
      retirementDate,
      totalWorkingDays,
      totalSalary,
      fixedBonus,
      annualLeaveAllowance,
      dailyFixedBonus,
      dailyAnnualLeaveAllowance,
      totalDailyPay,
      averagePay: Math.round(totalDailyPay),
      period
    });

    // 퇴직급여 계산기에 평균임금 자동 입력
    setAveragePay(Math.round(totalDailyPay * 30).toLocaleString());
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
              <Link href="/" className="flex items-center text-black hover:text-black transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                홈으로
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <DollarSign className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-bold text-black">퇴직급여 계산기</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 입력 폼 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-green-600" />
              정보 입력
            </h2>

            <div className="space-y-4">
              {/* 퇴직급여제도 선택 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-blue-800 mb-3">
                  🏛️ 퇴직급여제도 선택
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="retirementSystem"
                        value="DB"
                        checked={retirementSystem === "DB"}
                        onChange={(e) => setRetirementSystem(e.target.value as "DB" | "DC" | "hybrid")}
                        className="form-radio h-4 w-4 text-blue-600 border-blue-300 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-black">DB형 (확정급여형) / 퇴직금제도</span>
                        <p className="text-xs text-gray-600">기존 퇴직금제도와 동일한 계산식 (평균임금 × 근속연수)</p>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="retirementSystem"
                        value="DC"
                        checked={retirementSystem === "DC"}
                        onChange={(e) => setRetirementSystem(e.target.value as "DB" | "DC" | "hybrid")}
                        className="form-radio h-4 w-4 text-blue-600 border-blue-300 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-black">DC형 (확정기여형)</span>
                        <p className="text-xs text-gray-600">매월 일정 금액을 적립하여 운용한 금액 지급</p>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="retirementSystem"
                        value="hybrid"
                        checked={retirementSystem === "hybrid"}
                        onChange={(e) => setRetirementSystem(e.target.value as "DB" | "DC" | "hybrid")}
                        className="form-radio h-4 w-4 text-blue-600 border-blue-300 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-black">혼합형</span>
                        <p className="text-xs text-gray-600">DB형과 DC형을 함께 운영하는 제도</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 공통 필드 - 입사일과 퇴사일 */}
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

              {/* DB형(확정급여형) 및 퇴직금제도 입력 필드 */}
              {retirementSystem === "DB" && (
                <>
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

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-medium">💡 계산식</p>
                    <p className="text-xs text-green-700 mt-1">퇴직급여 = 평균임금 × 근속연수</p>
                  </div>
                </>
              )}

              {/* DC형(확정기여형) 입력 필드 */}
              {retirementSystem === "DC" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      월 기여금 (원)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={monthlyContribution}
                        onChange={(e) => setMonthlyContribution(formatNumber(e.target.value))}
                        placeholder="예: 200,000"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                      />
                      <span className="absolute right-3 top-2 text-black">원</span>
                    </div>
                    <p className="text-xs text-black mt-1">
                      * 매월 적립된 기여금 금액 (월급의 8.3% 이상)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      운용수익률 (연간, %)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={annualReturn}
                        onChange={(e) => setAnnualReturn(e.target.value)}
                        placeholder="예: 3.5"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                      />
                      <span className="absolute right-3 top-2 text-black">%</span>
                    </div>
                    <p className="text-xs text-black mt-1">
                      * 기여금 운용으로 얻은 연평균 수익률
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800 font-medium">💡 계산식</p>
                    <p className="text-xs text-purple-700 mt-1">퇴직급여 = 적립원금 + 운용수익</p>
                  </div>
                </>
              )}

              {/* 혼합형 입력 필드 */}
              {retirementSystem === "hybrid" && (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-sm text-orange-800 font-medium">🔄 혼합형 제도</p>
                    <p className="text-xs text-orange-700 mt-1">
                      DB형과 DC형을 함께 운영하는 제도입니다. 각각의 비율을 설정하세요.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      DB형 비율 (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={dbRatio}
                        onChange={(e) => setDbRatio(e.target.value)}
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                      />
                      <span className="absolute right-3 top-2 text-black">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      평균임금 (월급) - DB형 계산용
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
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      월 기여금 (원) - DC형 계산용
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dcContribution}
                        onChange={(e) => setDcContribution(formatNumber(e.target.value))}
                        placeholder="예: 200,000"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                      />
                      <span className="absolute right-3 top-2 text-black">원</span>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-sm text-indigo-800 font-medium">💡 계산식</p>
                    <p className="text-xs text-indigo-700 mt-1">
                      퇴직급여 = (DB형 급여 × DB비율) + (DC형 급여 × DC비율)
                    </p>
                  </div>
                </>
              )}

              <button
                onClick={calculateRetirementPay}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {retirementSystem === "DB" ? "퇴직급여 계산하기" :
                 retirementSystem === "DC" ? "DC형 퇴직급여 계산하기" :
                 "혼합형 퇴직급여 계산하기"}
              </button>
            </div>
          </div>

          {/* 평균임금 계산기 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Calculator className="h-6 w-6 mr-3 text-blue-600" />
              평균임금 계산기
            </h2>

            <div className="space-y-4">
              {/* 퇴사일 */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  퇴사일
                </label>
                <input
                  type="date"
                  value={retirementDate}
                  onChange={(e) => handleRetirementDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
                <p className="text-xs text-blue-600 mt-1">
                  퇴사일을 선택하면 평균임금 계산 기간(퇴사 전 3개월)이 자동으로 계산됩니다.
                </p>
              </div>

              {/* 퇴사 직전 3개월 급여 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">퇴사 직전 3개월 급여</h3>

                {/* 3개월차 */}
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-black">
                      {month3Data.monthName || "3개월 전"} 
                    </h4>
                    {month3Data.startDate && month3Data.endDate && (
                      <span className="text-sm text-blue-600">
                        {month3Data.startDate} ~ {month3Data.endDate}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 이수일수 */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        이수일수 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={month3Data.workingDays}
                          onChange={(e) => updateMonthData(month3Data, setMonth3Data, 'workingDays', e.target.value)}
                          placeholder="예: 22"
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                        <span className="absolute right-3 top-2 text-black">일</span>
                      </div>
                    </div>

                    {/* 기본급 */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        기본급 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={month3Data.baseSalary}
                          onChange={(e) => updateMonthData(month3Data, setMonth3Data, 'baseSalary', e.target.value)}
                          placeholder="예: 2,500,000"
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        />
                        <span className="absolute right-3 top-2 text-black">원</span>
                      </div>
                    </div>
                  </div>

                  {/* 수당 */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-black mb-2">수당</label>
                    {month3Data.allowances.map((allowance, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={allowance}
                            onChange={(e) => updateMonthData(month3Data, setMonth3Data, 'allowance', e.target.value, index)}
                            placeholder={`수당${index + 1}`}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                          />
                          <span className="absolute right-3 top-2 text-black">원</span>
                        </div>
                        {month3Data.allowances.length > 1 && (
                          <button
                            onClick={() => removeAllowance(month3Data, setMonth3Data, index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addAllowance(month3Data, setMonth3Data)}
                      className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      수당 추가
                    </button>
                  </div>

                  <div className="mt-4 bg-white p-3 rounded border">
                    <div className="flex justify-between text-sm">
                      <span>월 총 급여:</span>
                      <span className="font-medium text-blue-600">{month3Data.monthlyTotal}원</span>
                    </div>
                  </div>
                </div>

                {/* 2개월차 */}
                <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-black">
                      {month2Data.monthName || "2개월 전"}
                    </h4>
                    {month2Data.startDate && month2Data.endDate && (
                      <span className="text-sm text-green-600">
                        {month2Data.startDate} ~ {month2Data.endDate}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 이수일수 */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        이수일수 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={month2Data.workingDays}
                          onChange={(e) => updateMonthData(month2Data, setMonth2Data, 'workingDays', e.target.value)}
                          placeholder="예: 22"
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        />
                        <span className="absolute right-3 top-2 text-black">일</span>
                      </div>
                    </div>

                    {/* 기본급 */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        기본급 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={month2Data.baseSalary}
                          onChange={(e) => updateMonthData(month2Data, setMonth2Data, 'baseSalary', e.target.value)}
                          placeholder="예: 2,500,000"
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        />
                        <span className="absolute right-3 top-2 text-black">원</span>
                      </div>
                    </div>
                  </div>

                  {/* 수당 */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-black mb-2">수당</label>
                    {month2Data.allowances.map((allowance, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={allowance}
                            onChange={(e) => updateMonthData(month2Data, setMonth2Data, 'allowance', e.target.value, index)}
                            placeholder={`수당${index + 1}`}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                          />
                          <span className="absolute right-3 top-2 text-black">원</span>
                        </div>
                        {month2Data.allowances.length > 1 && (
                          <button
                            onClick={() => removeAllowance(month2Data, setMonth2Data, index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addAllowance(month2Data, setMonth2Data)}
                      className="flex items-center text-green-600 hover:text-green-700 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      수당 추가
                    </button>
                  </div>

                  <div className="mt-4 bg-white p-3 rounded border">
                    <div className="flex justify-between text-sm">
                      <span>월 총 급여:</span>
                      <span className="font-medium text-green-600">{month2Data.monthlyTotal}원</span>
                    </div>
                  </div>
                </div>

                {/* 1개월차 */}
                <div className="border border-gray-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-black">
                      {month1Data.monthName || "1개월 전"}
                    </h4>
                    {month1Data.startDate && month1Data.endDate && (
                      <span className="text-sm text-yellow-600">
                        {month1Data.startDate} ~ {month1Data.endDate}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 이수일수 */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        이수일수 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={month1Data.workingDays}
                          onChange={(e) => updateMonthData(month1Data, setMonth1Data, 'workingDays', e.target.value)}
                          placeholder="예: 22"
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
                        />
                        <span className="absolute right-3 top-2 text-black">일</span>
                      </div>
                    </div>

                    {/* 기본급 */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        기본급 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={month1Data.baseSalary}
                          onChange={(e) => updateMonthData(month1Data, setMonth1Data, 'baseSalary', e.target.value)}
                          placeholder="예: 2,500,000"
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
                        />
                        <span className="absolute right-3 top-2 text-black">원</span>
                      </div>
                    </div>
                  </div>

                  {/* 수당 */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-black mb-2">수당</label>
                    {month1Data.allowances.map((allowance, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={allowance}
                            onChange={(e) => updateMonthData(month1Data, setMonth1Data, 'allowance', e.target.value, index)}
                            placeholder={`수당${index + 1}`}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-black"
                          />
                          <span className="absolute right-3 top-2 text-black">원</span>
                        </div>
                        {month1Data.allowances.length > 1 && (
                          <button
                            onClick={() => removeAllowance(month1Data, setMonth1Data, index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addAllowance(month1Data, setMonth1Data)}
                      className="flex items-center text-yellow-600 hover:text-yellow-700 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      수당 추가
                    </button>
                  </div>

                  <div className="mt-4 bg-white p-3 rounded border">
                    <div className="flex justify-between text-sm">
                      <span>월 총 급여:</span>
                      <span className="font-medium text-yellow-600">{month1Data.monthlyTotal}원</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 연간 지급 항목 */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-black">연간 지급 항목 (선택)</h3>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    고정상여금 (연간)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fixedBonus}
                      onChange={(e) => setFixedBonus(formatNumber(e.target.value))}
                      placeholder="예: 5,000,000"
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    <span className="absolute right-3 top-2 text-black">원</span>
                  </div>
                  <p className="text-xs text-black mt-1">연간 고정상여금을 입력하세요</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    연차수당 (연간)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={annualLeaveAllowance}
                      onChange={(e) => setAnnualLeaveAllowance(formatNumber(e.target.value))}
                      placeholder="예: 1,000,000"
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                    <span className="absolute right-3 top-2 text-black">원</span>
                  </div>
                  <p className="text-xs text-black mt-1">연간 연차수당을 입력하세요</p>
                </div>
              </div>

              <button
                onClick={calculateAveragePay}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                평균임금 계산하기
              </button>

              {/* 평균임금 계산 결과 */}
              {averagePayResult && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">평균임금 계산 결과</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>3개월 총 급여:</span>
                      <span className="font-medium">{averagePayResult.totalSalary.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span>기본 평균임금 (일급):</span>
                      <span className="font-medium">{Math.round(averagePayResult.totalSalary / 90).toLocaleString()}원</span>
                    </div>
                    {averagePayResult.dailyFixedBonus > 0 && (
                      <div className="flex justify-between">
                        <span>고정상여금 (일할):</span>
                        <span className="font-medium">{Math.round(averagePayResult.dailyFixedBonus).toLocaleString()}원</span>
                      </div>
                    )}
                    {averagePayResult.dailyAnnualLeaveAllowance > 0 && (
                      <div className="flex justify-between">
                        <span>연차수당 (일할):</span>
                        <span className="font-medium">{Math.round(averagePayResult.dailyAnnualLeaveAllowance).toLocaleString()}원</span>
                      </div>
                    )}
                    <div className="border-t border-blue-300 pt-2 mt-2">
                      <div className="flex justify-between font-semibold text-blue-800">
                        <span>최종 평균임금 (일급):</span>
                        <span>{averagePayResult.averagePay.toLocaleString()}원</span>
                      </div>
                      <div className="flex justify-between font-semibold text-blue-800">
                        <span>월급 환산:</span>
                        <span>{Math.round(averagePayResult.averagePay * 30).toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-700 mt-3">
                    * 계산된 평균임금이 퇴직급여 계산기에 자동으로 입력됩니다
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 결과 표시 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
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
                  <p className="text-xs text-black mt-2 text-center">
                    계산된 퇴직급여를 바탕으로 퇴직소득세를 자동 계산합니다
                  </p>
                </div>

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
                        <Save className="h-5 w-5 mr-2 text-green-600" />
                        계산 결과 저장
                      </h4>
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium flex items-center justify-center"
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
                      <Download className="h-5 w-5 mr-2 text-green-600" />
                      계산 결과 출력
                    </h4>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => exportRetirementPayToPDF(result)}
                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF 다운로드
                      </button>
                      <button
                        onClick={() => exportRetirementPayToExcel(result)}
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
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-black" />
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
                  placeholder={`퇴직급여 계산 - ${result?.startDate || ''}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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