"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, DollarSign, Calendar, Info, AlertTriangle, Calculator, Download, FileText, FileSpreadsheet, Save, Check, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
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
  month4?: MonthlyPayData;
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

  // 날짜 분리 입력 상태 (년/월/일)
  const [startY, setStartY] = useState("");
  const [startM, setStartM] = useState("");
  const [startD, setStartD] = useState("");
  const [endY, setEndY] = useState("");
  const [endM, setEndM] = useState("");
  const [endD, setEndD] = useState("");

  // 날짜 필드 ref (자동 이동용)
  const startMRef = useRef<HTMLInputElement>(null);
  const startDRef = useRef<HTMLInputElement>(null);
  const endYRef   = useRef<HTMLInputElement>(null);
  const endMRef   = useRef<HTMLInputElement>(null);
  const endDRef   = useRef<HTMLInputElement>(null);

  // 평균임금 계산기 퇴사일 분리 입력 상태
  const [retireY, setRetireY] = useState("");
  const [retireM, setRetireM] = useState("");
  const [retireD, setRetireD] = useState("");
  const retireMRef = useRef<HTMLInputElement>(null);
  const retireDRef = useRef<HTMLInputElement>(null);
  const [averagePay, setAveragePay] = useState("");
  const [retirementSystem, setRetirementSystem] = useState<"DB" | "DC" | "hybrid">("DB"); // DB형(확정급여형), DC형(확정기여형), 혼합형

  // DC형 관련 상태
  const [annualSalaryForDC, setAnnualSalaryForDC] = useState(""); // 직전 1년 총급여액
  const [monthlyContribution, setMonthlyContribution] = useState(""); // 혼합형 DC 부분용

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
  const [month4Data, setMonth4Data] = useState<MonthlyPayData>({
    month: 4,
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

  // 기본급/수당 일괄 입력용 기본값
  const [defaultBaseSalary, setDefaultBaseSalary] = useState("");
  const [defaultAllowances, setDefaultAllowances] = useState<string[]>([""]);
  const [averagePayResult, setAveragePayResult] = useState<AveragePayResult | null>(null);
  
  // 평균임금 계산기 접기/펼치기 상태
  const [isAveragePayCalculatorOpen, setIsAveragePayCalculatorOpen] = useState(false);

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

  // 년/월/일 → YYYY-MM-DD 조합 및 state 업데이트
  const buildDate = (y: string, m: string, d: string) => {
    if (y.length === 4 && m.length >= 1 && d.length >= 1) {
      const mm = m.padStart(2, "0");
      const dd = d.padStart(2, "0");
      return `${y}-${mm}-${dd}`;
    }
    return "";
  };

  const handleStartY = (v: string) => {
    const val = v.replace(/\D/g, "").slice(0, 4);
    setStartY(val);
    const combined = buildDate(val, startM, startD);
    setStartDate(combined);
    if (val.length === 4) startMRef.current?.focus();
  };
  const handleStartM = (v: string) => {
    const val = v.replace(/\D/g, "").slice(0, 2);
    setStartM(val);
    const combined = buildDate(startY, val, startD);
    setStartDate(combined);
    if (val.length === 2) startDRef.current?.focus();
  };
  const handleStartD = (v: string) => {
    const val = v.replace(/\D/g, "").slice(0, 2);
    setStartD(val);
    const combined = buildDate(startY, startM, val);
    setStartDate(combined);
    if (val.length === 2) endYRef.current?.focus();
  };
  const handleEndY = (v: string) => {
    const val = v.replace(/\D/g, "").slice(0, 4);
    setEndY(val);
    const combined = buildDate(val, endM, endD);
    setEndDate(combined);
    if (val.length === 4) endMRef.current?.focus();
  };
  const handleEndM = (v: string) => {
    const val = v.replace(/\D/g, "").slice(0, 2);
    setEndM(val);
    const combined = buildDate(endY, val, endD);
    setEndDate(combined);
    if (val.length === 2) endDRef.current?.focus();
  };
  const handleEndD = (v: string) => {
    const val = v.replace(/\D/g, "").slice(0, 2);
    setEndD(val);
    const combined = buildDate(endY, endM, val);
    setEndDate(combined);
  };

  const calculateRetirementPay = () => {
    // 공통 필드 검증
    if (!startDate || !endDate) {
      alert(retirementSystem === "DC"
        ? "기산일과 계산 종료일을 모두 입력해주세요."
        : "입사일과 퇴사일을 입력해주세요.");
      return;
    }

    // 퇴직급여제도별 필수 필드 검증
    if (retirementSystem === "DB") {
      if (!averagePay) {
        alert("평균임금을 입력해주세요.");
        return;
      }
    } else if (retirementSystem === "DC") {
      if (!annualSalaryForDC) {
        alert("직전 1년 총급여액을 입력해주세요.");
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
    const workingYears = Math.floor(workingDays / 365);
    const workingMonths = Math.floor(workingDays / 30);

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
        // 1년 이상 근속: 평균임금(일) × 30 × (재직일수 / 365)
        retirementPay = avgPay * 30 * (workingDays / 365);
        calculationMethod = `${avgPay.toLocaleString()}원(일급) × 30일 × (${workingDays}일 ÷ 365) = ${Math.round(retirementPay).toLocaleString()}원`;
      } else {
        // 1년 미만: 퇴직급여 지급 의무 없음
        retirementPay = 0;
        calculationMethod = `계속근로기간 ${workingDays}일 (1년 미만) — 퇴직급여 지급 의무 없음 (근로자퇴직급여 보장법 제4조)`;
      }

    } else if (retirementSystem === "DC") {
      // DC형 (확정기여형) 계산 — 근로자퇴직급여보장법 제20조
      const annualSalary = parseInt(annualSalaryForDC.replace(/,/g, ""));
      const annualContribution = Math.round(annualSalary / 12); // 연 부담금 = 직전 1년 총급여액 / 12

      systemType = "DC형 (확정기여형)";

      const fullYears = Math.floor(workingDays / 365);
      const remainingDays = workingDays % 365;
      const partialContribution = Math.round(annualContribution * (remainingDays / 365));

      // 원금 기준 단순 적립 (수익률 미반영)
      const accumulatedAmount = annualContribution * fullYears + partialContribution;

      retirementPay = Math.round(accumulatedAmount);
      calculationMethod = `연 부담금 ${annualContribution.toLocaleString()}원 (직전 1년 총급여액 ${annualSalary.toLocaleString()}원 ÷ 12) × ${fullYears}년${remainingDays > 0 ? ` + 잔여 ${remainingDays}일 분 ${partialContribution.toLocaleString()}원` : ""}`;

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

    setResult({
      startDate: start.toLocaleDateString('ko-KR'),
      endDate: end.toLocaleDateString('ko-KR'),
      workingDays,
      workingYears,
      workingMonths,
      averagePay: retirementSystem === "DB" ? Math.round(parseInt(averagePay.replace(/,/g, "")) / 30) : 0,
      monthlyPay: retirementSystem === "DB" ? parseInt(averagePay.replace(/,/g, "")) : 0,
      retirementPay: Math.round(retirementPay),
      continuousServiceBonus: 0,
      totalAmount: Math.round(retirementPay),
      calculationMethod,
      retirementType: systemType,
      systemType: systemType
    });
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 기본급/수당 일괄 적용: 각 월의 기간에 비례해 금액 계산 후 자동 입력
  const applyDefaultSalary = () => {
    const baseNum = parseInt(defaultBaseSalary.replace(/,/g, "")) || 0;
    if (baseNum === 0) {
      alert("기본급을 입력해주세요.");
      return;
    }

    // 날짜 범위의 역일수(calendar days) 계산
    const periodDays = (startStr: string, endStr: string) => {
      if (!startStr || !endStr) return 0;
      const s = new Date(startStr);
      const e = new Date(endStr);
      return Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
    };
    // 해당 달의 총 일수
    const daysInMonth = (dateStr: string) => {
      if (!dateStr) return 30;
      const d = new Date(dateStr);
      return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    };
    // 금액 일할 계산
    const prorate = (amount: number, days: number, totalDays: number) =>
      totalDays === 0 ? amount : Math.round((amount * days) / totalDays);

    const applyToMonth = (
      data: MonthlyPayData,
      setter: (d: MonthlyPayData) => void
    ) => {
      if (!data.startDate || !data.endDate) return;
      const days = periodDays(data.startDate, data.endDate);
      const total = daysInMonth(data.startDate);
      const isFullMonth = days === total;

      const newBase = isFullMonth ? baseNum : prorate(baseNum, days, total);
      const newAllowances = defaultAllowances.map((a) => {
        const num = parseInt(a.replace(/,/g, "")) || 0;
        return isFullMonth ? num : prorate(num, days, total);
      });

      const totalAllowances = newAllowances.reduce((s, v) => s + v, 0);
      const newData: MonthlyPayData = {
        ...data,
        workingDays: String(days),
        baseSalary: newBase.toLocaleString(),
        allowances: newAllowances.map((v) => v.toLocaleString()),
        totalAllowances: totalAllowances.toLocaleString(),
        monthlyTotal: (newBase + totalAllowances).toLocaleString(),
      };
      setter(newData);
    };

    applyToMonth(month4Data, setMonth4Data);
    applyToMonth(month3Data, setMonth3Data);
    applyToMonth(month2Data, setMonth2Data);
    applyToMonth(month1Data, setMonth1Data);
  };

  // 퇴직일자 기준 만 3개월 기간 자동 계산
  // 예) 9월 15일 퇴직 → 만 3개월 시작: 6월 16일
  //   4개월차: 6/16~6/30 / 3개월차: 7/1~7/31 / 2개월차: 8/1~8/31 / 1개월차: 9/1~9/15
  const calculateThreeMonthPeriod = (retirementDateStr: string) => {
    if (!retirementDateStr) return;

    const retirementDate = new Date(retirementDateStr);
    const y = retirementDate.getFullYear();
    const mo = retirementDate.getMonth(); // 0-indexed
    const day = retirementDate.getDate();

    const toISO = (d: Date) => {
      const yy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yy}-${mm}-${dd}`;
    };
    const lastDayOf = (year: number, month: number) => new Date(year, month + 1, 0);
    const monthLabel = (d: Date) => `${d.getFullYear()}년 ${d.getMonth() + 1}월`;

    // 퇴직일이 해당 월의 말일인지 확인
    const lastDayOfRetireMonth = lastDayOf(y, mo).getDate();
    const isEndOfMonth = day === lastDayOfRetireMonth;

    // 1개월차: 퇴직 당월 1일 ~ 퇴직일
    const month1Start = new Date(y, mo, 1);
    const month1End = new Date(retirementDate);

    // 2개월차: 전월 1일 ~ 전월 말일
    const month2Start = new Date(y, mo - 1, 1);
    const month2End = lastDayOf(y, mo - 1);

    // 3개월차: 전전월 1일 ~ 전전월 말일
    const month3Start = new Date(y, mo - 2, 1);
    const month3End = lastDayOf(y, mo - 2);

    // 4개월차: 말일 퇴사면 없음 / 중간 퇴사면 만 3개월 시작일 ~ 전전월 전달 말일
    const threeMonthsBack = new Date(y, mo - 3, day);
    const periodStart = new Date(threeMonthsBack.getTime() + 24 * 60 * 60 * 1000);
    const hasMonth4 = !isEndOfMonth && periodStart.getDate() !== 1;
    const month4Start = new Date(periodStart);
    const month4End = lastDayOf(periodStart.getFullYear(), periodStart.getMonth());

    // month4 업데이트
    if (hasMonth4) {
      setMonth4Data(prev => ({
        ...prev,
        monthName: monthLabel(month4Start),
        startDate: toISO(month4Start),
        endDate: toISO(month4End),
        workingDays: "",
        baseSalary: "",
        allowances: [""],
        totalAllowances: "0",
        monthlyTotal: "0",
      }));
    } else {
      setMonth4Data(prev => ({
        ...prev,
        monthName: "",
        startDate: "",
        endDate: "",
        workingDays: "",
        baseSalary: "",
        allowances: [""],
        totalAllowances: "0",
        monthlyTotal: "0",
      }));
    }

    setMonth3Data(prev => ({
      ...prev,
      monthName: monthLabel(month3Start),
      startDate: toISO(month3Start),
      endDate: toISO(month3End),
      workingDays: "",
      baseSalary: "",
      allowances: [""],
      totalAllowances: "0",
      monthlyTotal: "0",
    }));

    setMonth2Data(prev => ({
      ...prev,
      monthName: monthLabel(month2Start),
      startDate: toISO(month2Start),
      endDate: toISO(month2End),
      workingDays: "",
      baseSalary: "",
      allowances: [""],
      totalAllowances: "0",
      monthlyTotal: "0",
    }));

    setMonth1Data(prev => ({
      ...prev,
      monthName: monthLabel(month1Start),
      startDate: toISO(month1Start),
      endDate: toISO(month1End),
      workingDays: "",
      baseSalary: "",
      allowances: [""],
      totalAllowances: "0",
      monthlyTotal: "0",
    }));
  };

  // 퇴직일자 변경 핸들러
  const handleRetirementDateChange = (dateString: string) => {
    setRetirementDate(dateString);
    calculateThreeMonthPeriod(dateString);
  };

  // 평균임금 계산기 퇴사일 분리 입력 핸들러
  const handleRetireY = (v: string) => {
    const val = v.replace(/\D/g, "").slice(0, 4);
    setRetireY(val);
    const combined = buildDate(val, retireM, retireD);
    if (combined) handleRetirementDateChange(combined);
    if (val.length === 4) retireMRef.current?.focus();
  };
  const handleRetireM = (v: string) => {
    const val = v.replace(/\D/g, "").slice(0, 2);
    setRetireM(val);
    const combined = buildDate(retireY, val, retireD);
    if (combined) handleRetirementDateChange(combined);
    if (val.length === 2) retireDRef.current?.focus();
  };
  const handleRetireD = (v: string) => {
    const val = v.replace(/\D/g, "").slice(0, 2);
    setRetireD(val);
    const combined = buildDate(retireY, retireM, val);
    if (combined) handleRetirementDateChange(combined);
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
    } else if (field === 'startDate') {
      newData.startDate = value;
      const parts = value.split('-');
      if (parts.length === 3 && parts[0].length === 4)
        newData.monthName = `${parts[0]}년 ${parseInt(parts[1])}월`;
    } else if (field === 'endDate') {
      newData.endDate = value;
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
    const hasMonth4 = !!month4Data.startDate;

    // 입력 검증
    if (!retirementDate || !month1Data.baseSalary || !month2Data.baseSalary || !month3Data.baseSalary) {
      alert("퇴사일과 급여 정보를 모두 입력해주세요.");
      return;
    }
    if (hasMonth4 && !month4Data.baseSalary) {
      alert("모든 기간의 급여 정보를 입력해주세요.");
      return;
    }

    if (!month1Data.workingDays || !month2Data.workingDays || !month3Data.workingDays) {
      alert("각 월의 이수일수를 입력해주세요.");
      return;
    }
    if (hasMonth4 && !month4Data.workingDays) {
      alert("모든 기간의 이수일수를 입력해주세요.");
      return;
    }

    // 총 급여 계산 (month4 포함)
    const month1Total = parseInt(month1Data.monthlyTotal.replace(/,/g, '')) || 0;
    const month2Total = parseInt(month2Data.monthlyTotal.replace(/,/g, '')) || 0;
    const month3Total = parseInt(month3Data.monthlyTotal.replace(/,/g, '')) || 0;
    const month4Total = hasMonth4 ? (parseInt(month4Data.monthlyTotal.replace(/,/g, '')) || 0) : 0;
    const totalSalary = month1Total + month2Total + month3Total + month4Total;

    // 총 이수일수 (month4 포함)
    const month1Days = parseInt(month1Data.workingDays) || 0;
    const month2Days = parseInt(month2Data.workingDays) || 0;
    const month3Days = parseInt(month3Data.workingDays) || 0;
    const month4Days = hasMonth4 ? (parseInt(month4Data.workingDays) || 0) : 0;
    const totalWorkingDays = month1Days + month2Days + month3Days + month4Days;

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
      ...(month4Data.startDate ? { month4: month4Data } : {}),
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

              {/* 공통 필드 - 입사일/기산일 */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {retirementSystem === "DC" ? "기산일 (DC 계산 시작일)" : "입사일"}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="text" inputMode="numeric" placeholder="YYYY"
                    value={startY} onChange={(e) => handleStartY(e.target.value)}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-sm"
                  />
                  <span className="text-gray-400 text-sm">년</span>
                  <input
                    ref={startMRef} type="text" inputMode="numeric" placeholder="MM"
                    value={startM} onChange={(e) => handleStartM(e.target.value)}
                    className="w-12 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-sm"
                  />
                  <span className="text-gray-400 text-sm">월</span>
                  <input
                    ref={startDRef} type="text" inputMode="numeric" placeholder="DD"
                    value={startD} onChange={(e) => handleStartD(e.target.value)}
                    className="w-12 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-sm"
                  />
                  <span className="text-gray-400 text-sm">일</span>
                </div>
              </div>

              {/* 퇴사일/종료일 */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {retirementSystem === "DC" ? "계산 종료일" : "퇴사일"}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    ref={endYRef} type="text" inputMode="numeric" placeholder="YYYY"
                    value={endY} onChange={(e) => handleEndY(e.target.value)}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-sm"
                  />
                  <span className="text-gray-400 text-sm">년</span>
                  <input
                    ref={endMRef} type="text" inputMode="numeric" placeholder="MM"
                    value={endM} onChange={(e) => handleEndM(e.target.value)}
                    className="w-12 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-sm"
                  />
                  <span className="text-gray-400 text-sm">월</span>
                  <input
                    ref={endDRef} type="text" inputMode="numeric" placeholder="DD"
                    value={endD} onChange={(e) => handleEndD(e.target.value)}
                    className="w-12 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-500 focus:border-transparent text-black text-sm"
                  />
                  <span className="text-gray-400 text-sm">일</span>
                </div>
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
                      직전 1년 총급여액 *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={annualSalaryForDC}
                        onChange={(e) => setAnnualSalaryForDC(formatNumber(e.target.value))}
                        placeholder="예: 36,000,000"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                      />
                      <span className="absolute right-3 top-2 text-black">원</span>
                    </div>
                    <p className="text-xs text-black mt-1">
                      * 부담금 산정 기준이 되는 직전 1년간 지급받은 임금총액
                    </p>
                    {annualSalaryForDC && (
                      <div className="mt-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                        <p className="text-xs text-purple-700">
                          연 부담금 (법정 최소): <span className="font-semibold">{Math.round(parseInt(annualSalaryForDC.replace(/,/g, "")) / 12).toLocaleString()}원</span>
                          <span className="ml-1 text-purple-500">(총급여액 ÷ 12)</span>
                        </p>
                      </div>
                    )}
                  </div>


                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800 font-medium">💡 법정 계산식 (근로자퇴직급여보장법 제20조)</p>
                    <p className="text-xs text-purple-700 mt-1">연 부담금 = 직전 1년 총급여액 ÷ 12</p>
                    <p className="text-xs text-purple-700">수령액 = 연 부담금 × 적립연수 + 운용수익</p>
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* 헤더 - 항상 표시 */}
            <div 
              className="p-6 pb-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setIsAveragePayCalculatorOpen(!isAveragePayCalculatorOpen)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black flex items-center">
                  <Calculator className="h-6 w-6 mr-3 text-blue-600" />
                  평균임금 계산기
                </h2>
                <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                  <span className="text-sm font-medium">
                    {isAveragePayCalculatorOpen ? '접기' : '펼치기'}
                  </span>
                  {isAveragePayCalculatorOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>
              {!isAveragePayCalculatorOpen && (
                <p className="text-sm text-gray-600 mt-2">
                  퇴직 전 3개월 급여를 기반으로 평균임금을 계산합니다
                </p>
              )}
            </div>

            {/* 계산기 콘텐츠 - 접기/펼치기 */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isAveragePayCalculatorOpen ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="p-6 pt-4">

            <div className="space-y-4">
              {/* 퇴사일 분리 입력 */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">퇴사일</label>
                <div className="flex items-center gap-1">
                  <input
                    type="text" inputMode="numeric" placeholder="YYYY"
                    value={retireY} onChange={(e) => handleRetireY(e.target.value)}
                    className="w-16 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                  <span className="text-gray-400 text-sm">년</span>
                  <input
                    ref={retireMRef} type="text" inputMode="numeric" placeholder="MM"
                    value={retireM} onChange={(e) => handleRetireM(e.target.value)}
                    className="w-12 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                  <span className="text-gray-400 text-sm">월</span>
                  <input
                    ref={retireDRef} type="text" inputMode="numeric" placeholder="DD"
                    value={retireD} onChange={(e) => handleRetireD(e.target.value)}
                    className="w-12 px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                  <span className="text-gray-400 text-sm">일</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  퇴사일 입력 시 직전 3개월 기간이 자동으로 계산됩니다. 직접 수정도 가능합니다.
                </p>
              </div>

              {/* 기본급/수당 일괄 입력 */}
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                <h3 className="text-base font-semibold text-black mb-3">기본급·수당 일괄 입력</h3>
                <p className="text-xs text-gray-500 mb-3">
                  아래에 월 기본급과 수당을 입력하고 <strong>일괄 적용</strong>하면 각 기간에 맞게 자동으로 일할 계산되어 입력됩니다. 이후 개별 수정 가능합니다.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">월 기본급</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={defaultBaseSalary}
                        onChange={(e) => setDefaultBaseSalary(formatNumber(e.target.value))}
                        placeholder="예: 3,000,000"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                      />
                      <span className="absolute right-3 top-2 text-black">원</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">수당 (여러 개 가능)</label>
                    {defaultAllowances.map((a, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={a}
                            onChange={(e) => {
                              const next = [...defaultAllowances];
                              next[idx] = formatNumber(e.target.value);
                              setDefaultAllowances(next);
                            }}
                            placeholder={`수당${idx + 1}`}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                          />
                          <span className="absolute right-3 top-2 text-black">원</span>
                        </div>
                        {defaultAllowances.length > 1 && (
                          <button
                            onClick={() => setDefaultAllowances(defaultAllowances.filter((_, i) => i !== idx))}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setDefaultAllowances([...defaultAllowances, ""])}
                      className="flex items-center text-gray-600 hover:text-gray-800 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      수당 추가
                    </button>
                  </div>
                </div>
                <button
                  onClick={applyDefaultSalary}
                  className="w-full py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 font-medium text-sm"
                >
                  각 기간에 일괄 적용
                </button>
              </div>

              {/* 퇴사 직전 3개월 급여 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-black">퇴사 직전 3개월 급여</h3>

                {/* 4개월차 (만 3개월 시작 부분 달 — 퇴직일이 월 중간인 경우만 표시) */}
                {month4Data.startDate && (
                <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h4 className="font-medium text-black min-w-fit">{month4Data.monthName || "4개월차"}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <input type="text" placeholder="YYYY-MM-DD"
                        value={month4Data.startDate}
                        onChange={(e) => updateMonthData(month4Data, setMonth4Data, 'startDate', e.target.value)}
                        className="w-28 px-2 py-1 border border-purple-200 rounded text-center text-xs bg-white focus:ring-1 focus:ring-purple-400 text-purple-700"
                      />
                      <span className="text-gray-400">~</span>
                      <input type="text" placeholder="YYYY-MM-DD"
                        value={month4Data.endDate}
                        onChange={(e) => updateMonthData(month4Data, setMonth4Data, 'endDate', e.target.value)}
                        className="w-28 px-2 py-1 border border-purple-200 rounded text-center text-xs bg-white focus:ring-1 focus:ring-purple-400 text-purple-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        이수일수 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={month4Data.workingDays}
                          onChange={(e) => updateMonthData(month4Data, setMonth4Data, 'workingDays', e.target.value)}
                          placeholder="예: 15"
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        />
                        <span className="absolute right-3 top-2 text-black">일</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        기본급 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={month4Data.baseSalary}
                          onChange={(e) => updateMonthData(month4Data, setMonth4Data, 'baseSalary', e.target.value)}
                          placeholder="예: 2,500,000"
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                        />
                        <span className="absolute right-3 top-2 text-black">원</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-black mb-2">수당</label>
                    {month4Data.allowances.map((allowance, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={allowance}
                            onChange={(e) => updateMonthData(month4Data, setMonth4Data, 'allowance', e.target.value, index)}
                            placeholder={`수당${index + 1}`}
                            className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
                          />
                          <span className="absolute right-3 top-2 text-black">원</span>
                        </div>
                        {month4Data.allowances.length > 1 && (
                          <button
                            onClick={() => removeAllowance(month4Data, setMonth4Data, index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addAllowance(month4Data, setMonth4Data)}
                      className="flex items-center text-purple-600 hover:text-purple-700 text-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      수당 추가
                    </button>
                  </div>

                  <div className="mt-4 bg-white p-3 rounded border">
                    <div className="flex justify-between text-sm">
                      <span>월 총 급여:</span>
                      <span className="font-medium text-purple-600">{month4Data.monthlyTotal}원</span>
                    </div>
                  </div>
                </div>
                )}

                {/* 3개월차 */}
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h4 className="font-medium text-black min-w-fit">
                      {month3Data.monthName || "3개월 전"}
                    </h4>
                    <div className="flex items-center gap-1 text-sm">
                      <input
                        type="text" placeholder="YYYY-MM-DD"
                        value={month3Data.startDate}
                        onChange={(e) => updateMonthData(month3Data, setMonth3Data, 'startDate', e.target.value)}
                        className="w-28 px-2 py-1 border border-blue-200 rounded text-center text-xs bg-white focus:ring-1 focus:ring-blue-400 text-blue-700"
                      />
                      <span className="text-gray-400">~</span>
                      <input
                        type="text" placeholder="YYYY-MM-DD"
                        value={month3Data.endDate}
                        onChange={(e) => updateMonthData(month3Data, setMonth3Data, 'endDate', e.target.value)}
                        className="w-28 px-2 py-1 border border-blue-200 rounded text-center text-xs bg-white focus:ring-1 focus:ring-blue-400 text-blue-700"
                      />
                    </div>
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
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h4 className="font-medium text-black min-w-fit">{month2Data.monthName || "2개월 전"}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <input type="text" placeholder="YYYY-MM-DD"
                        value={month2Data.startDate}
                        onChange={(e) => updateMonthData(month2Data, setMonth2Data, 'startDate', e.target.value)}
                        className="w-28 px-2 py-1 border border-green-200 rounded text-center text-xs bg-white focus:ring-1 focus:ring-green-400 text-green-700"
                      />
                      <span className="text-gray-400">~</span>
                      <input type="text" placeholder="YYYY-MM-DD"
                        value={month2Data.endDate}
                        onChange={(e) => updateMonthData(month2Data, setMonth2Data, 'endDate', e.target.value)}
                        className="w-28 px-2 py-1 border border-green-200 rounded text-center text-xs bg-white focus:ring-1 focus:ring-green-400 text-green-700"
                      />
                    </div>
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
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h4 className="font-medium text-black min-w-fit">{month1Data.monthName || "1개월 전"}</h4>
                    <div className="flex items-center gap-1 text-sm">
                      <input type="text" placeholder="YYYY-MM-DD"
                        value={month1Data.startDate}
                        onChange={(e) => updateMonthData(month1Data, setMonth1Data, 'startDate', e.target.value)}
                        className="w-28 px-2 py-1 border border-yellow-200 rounded text-center text-xs bg-white focus:ring-1 focus:ring-yellow-400 text-yellow-700"
                      />
                      <span className="text-gray-400">~</span>
                      <input type="text" placeholder="YYYY-MM-DD"
                        value={month1Data.endDate}
                        onChange={(e) => updateMonthData(month1Data, setMonth1Data, 'endDate', e.target.value)}
                        className="w-28 px-2 py-1 border border-yellow-200 rounded text-center text-xs bg-white focus:ring-1 focus:ring-yellow-400 text-yellow-700"
                      />
                    </div>
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
                  <div className="space-y-2 text-sm text-black">
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
                {result.workingDays < 365 && (result.retirementType === "DB형 (확정급여형)" || result.retirementType === "혼합형") && (
                  <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-orange-800">계속근로기간 1년 미만 — 퇴직급여 지급 불가</p>
                      <p className="text-xs text-orange-700 mt-1">
                        근로자퇴직급여 보장법 제4조에 따라 계속근로기간이 1년 미만인 경우 퇴직급여 지급 의무가 없습니다.
                      </p>
                    </div>
                  </div>
                )}
                <div className={`border rounded-lg p-4 ${result.workingDays < 365 && result.retirementType !== "DC형 (확정기여형)" ? "bg-gray-50 border-gray-200" : "bg-green-50 border-green-200"}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${result.workingDays < 365 && result.retirementType !== "DC형 (확정기여형)" ? "text-gray-600" : "text-green-800"}`}>퇴직급여</h3>
                  <div className={`text-3xl font-bold ${result.workingDays < 365 && result.retirementType !== "DC형 (확정기여형)" ? "text-gray-400" : "text-green-600"}`}>
                    {result.totalAmount.toLocaleString()}원
                  </div>
                  <p className={`text-sm mt-1 ${result.workingDays < 365 && result.retirementType !== "DC형 (확정기여형)" ? "text-gray-500" : "text-green-700"}`}>
                    {result.retirementType} 기준
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">입사일</span>
                    <span className="font-medium text-black">{result.startDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">퇴사일</span>
                    <span className="font-medium text-black">{result.endDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">근속기간</span>
                    <span className="font-medium text-black">{result.workingYears}년 {result.workingMonths % 12}개월</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">근속일수</span>
                    <span className="font-medium text-black">{result.workingDays}일</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">평균임금 (월급)</span>
                    <span className="font-medium text-black">{result.monthlyPay.toLocaleString()}원/월</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">평균임금 (일급)</span>
                    <span className="font-medium text-black">{result.averagePay.toLocaleString()}원/일</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-black">기본 퇴직급여</span>
                    <span className="font-medium text-black">{result.retirementPay.toLocaleString()}원</span>
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
            <p className="text-xs text-black mt-3">
              ※ 시행일: 2022.1.1 (법률 제18473호, 2021.8.17, 일부개정)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}