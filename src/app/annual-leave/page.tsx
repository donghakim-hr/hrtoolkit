"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Calculator, Calendar, Info,
  FileText, FileSpreadsheet, Save, Check, Scale, ChevronDown, ChevronUp
} from "lucide-react";
import { AnnualLeaveResult, YearlyLeaveInfo } from "@/types";
import { exportAnnualLeaveToPDF, exportAnnualLeaveToExcel } from "@/utils/exportUtils";

interface UserSession {
  userId: string; username: string; name: string; email: string;
}

interface YearlyUsage {
  adjusted: number | null; // null = use calculated (hire-based)
  used: number;
  settled: number;
  expired: number;
}

// ── 2018.5.29 개정 근로기준법 제60조 제3항 효력 판단 ─────────────
// 개정 전: 1년 미만 근로자 연차 없음
// 개정 후: 1개월 개근 시 1일 유급휴가 (최대 11일)
// 시행일: 2018년 5월 29일 (법률 제15513호)
function getLawStatus(hireDateStr: string): 'full' | 'partial' | 'old' {
  if (!hireDateStr) return 'full';
  const hireDate = new Date(hireDateStr);
  const effectiveDate = new Date('2018-05-29');  // 신법 시행일
  const oneYearBefore = new Date('2017-05-29');  // 시행일 1년 전 (이 날 이전 입사자는 1년차가 구법 시대)

  if (hireDate >= effectiveDate) {
    return 'full';    // 신법 완전 적용
  } else if (hireDate > oneYearBefore) {
    return 'partial'; // 시행 당시 재직 1년 미만 → 2018.5.29부터 신법 적용
  } else {
    return 'old';     // 1년 미만 기간이 구법 시대에 완료 → 구법 적용
  }
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
  const [expandLawDetail, setExpandLawDetail] = useState(false);

  // 연도별 사용/정산/소멸 추적
  const [leaveUsage, setLeaveUsage] = useState<Record<number, YearlyUsage>>({});

  // 입사일 개별 필드
  const [startYear, setStartYear] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [startDay, setStartDay] = useState("");

  // 계산 기준일 개별 필드
  const [calcYear, setCalcYear] = useState("");
  const [calcMonth, setCalcMonth] = useState("");
  const [calcDay, setCalcDay] = useState("");

  const startMonthRef = useRef<HTMLInputElement>(null);
  const startDayRef = useRef<HTMLInputElement>(null);
  const calcYearRef = useRef<HTMLInputElement>(null);
  const calcMonthRef = useRef<HTMLInputElement>(null);
  const calcDayRef = useRef<HTMLInputElement>(null);

  useEffect(() => { checkAuthStatus(); }, []);

  // 결과 갱신 시 신규 연도만 초기화 (기존 입력값 유지)
  useEffect(() => {
    if (result) {
      setLeaveUsage(prev => {
        const next = { ...prev };
        result.yearlyHistory.forEach(y => {
          if (!next[y.year]) {
            next[y.year] = { adjusted: null, used: 0, settled: 0, expired: 0 };
          }
        });
        return next;
      });
    }
  }, [result]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) { const d = await res.json(); setUserSession(d.user); }
    } catch { /* ignore */ }
  };

  const saveCalculation = async () => {
    if (!result || !userSession) return;
    setSaving(true);
    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'annual-leave', title: saveTitle || `연차 계산 - ${result.startDate}`, data: result })
      });
      if (res.ok) { setSaveSuccess(true); setShowSaveDialog(false); setSaveTitle(""); setTimeout(() => setSaveSuccess(false), 3000); }
      else alert('저장 중 오류가 발생했습니다.');
    } catch { alert('저장 중 오류가 발생했습니다.'); }
    finally { setSaving(false); }
  };

  const handleDateInput = (value: string, setter: (v: string) => void, maxLen: number, nextRef?: React.RefObject<HTMLInputElement | null>) => {
    const n = value.replace(/\D/g, '');
    if (n.length <= maxLen) { setter(n); if (n.length === maxLen && nextRef?.current) nextRef.current.focus(); }
  };

  const combineDate = (y: string, m: string, d: string) =>
    y.length === 4 && m.length === 2 && d.length === 2 ? `${y}-${m}-${d}` : "";

  const updateUsage = (year: number, field: keyof YearlyUsage, value: number | null) => {
    setLeaveUsage(prev => ({ ...prev, [year]: { ...prev[year], [field]: value } }));
  };

  const getGranted = (yearData: YearlyLeaveInfo) => {
    const usage = leaveUsage[yearData.year];
    if (usage?.adjusted !== null && usage?.adjusted !== undefined) return usage.adjusted;
    return yearData.hireTotalLeave; // 기본값: 입사일 기준
  };

  const getRemaining = (yearData: YearlyLeaveInfo) => {
    const u = leaveUsage[yearData.year];
    if (!u) return getGranted(yearData);
    return getGranted(yearData) - u.used - u.settled - u.expired;
  };

  // ── 연차 계산 핵심 로직 ────────────────────────────────────────
  const calculateAnnualLeave = () => {
    if (!startDate || !calculateDate) { alert("입사일과 계산 기준일을 입력해주세요."); return; }

    const start = new Date(startDate);
    const calc = new Date(calculateDate);
    const currentYear = calc.getFullYear();

    const [month, day] = accountingYearStart.split('-');
    const accountingStart = new Date(currentYear, parseInt(month) - 1, parseInt(day));
    if (accountingStart > calc) accountingStart.setFullYear(currentYear - 1);

    const totalWorkingDays = Math.floor((calc.getTime() - start.getTime()) / 86400000);
    const totalWorkingYears = Math.floor(totalWorkingDays / 365.25);
    const totalWorkingMonths = Math.floor(totalWorkingDays / 30.4375);

    // 입사일 기준
    let hireBasedLeave = 0, hireBasedAdditional = 0;
    if (totalWorkingYears >= 1) {
      hireBasedLeave = 15;
      if (totalWorkingYears >= 3) hireBasedAdditional = Math.min(Math.floor((totalWorkingYears - 1) / 2), 10);
    } else {
      hireBasedLeave = Math.floor(totalWorkingMonths);
    }

    // 회계연도 기준
    const workingYearsAtAccounting = Math.floor((accountingStart.getTime() - start.getTime()) / (365.25 * 86400000));
    let accountingBasedLeave = 0, accountingBasedAdditional = 0;
    if (workingYearsAtAccounting >= 1) {
      accountingBasedLeave = 15;
      if (workingYearsAtAccounting >= 3) accountingBasedAdditional = Math.min(Math.floor((workingYearsAtAccounting - 1) / 2), 10);
    } else if (workingYearsAtAccounting >= 0) {
      const months = Math.floor((calc.getTime() - (start > accountingStart ? start.getTime() : accountingStart.getTime())) / (30.4375 * 86400000));
      accountingBasedLeave = Math.min(months, 12);
    }

    // 연도별 히스토리
    const yearlyHistory: YearlyLeaveInfo[] = [];
    const sYear = start.getFullYear(), eYear = calc.getFullYear();

    for (let year = sYear; year <= eYear; year++) {
      const yearEndDate = new Date(year, 11, 31);
      const actualEnd = year === eYear ? calc : yearEndDate;
      if (actualEnd < start) continue;

      const wDays = Math.floor((actualEnd.getTime() - start.getTime()) / 86400000);
      const wYears = Math.floor(wDays / 365.25);
      const wMonths = Math.floor(wDays / 30.4375);

      const hireAnniv = new Date(year, start.getMonth(), start.getDate());

      let hireLeave = 0, hireAdditional = 0;
      if (wYears >= 1) {
        hireLeave = 15;
        if (wYears >= 3) hireAdditional = Math.min(Math.floor((wYears - 1) / 2), 10);
      } else {
        hireLeave = Math.floor(wMonths);
      }

      const [mStr, dStr] = accountingYearStart.split('-');
      const accYearStart = new Date(year, parseInt(mStr) - 1, parseInt(dStr));
      const effectiveAccStart = accYearStart < start ? start : accYearStart;
      const wYearsAcc = Math.floor((effectiveAccStart.getTime() - start.getTime()) / (365.25 * 86400000));

      let accLeave = 0, accAdditional = 0;
      if (wYearsAcc >= 1) {
        accLeave = 15;
        if (wYearsAcc >= 3) accAdditional = Math.min(Math.floor((wYearsAcc - 1) / 2), 10);
      } else if (effectiveAccStart.getFullYear() === year) {
        const months = Math.floor((actualEnd.getTime() - effectiveAccStart.getTime()) / (30.4375 * 86400000));
        accLeave = Math.min(months, 12);
      }

      const hireTotalLeave = hireLeave + hireAdditional;
      const accTotalLeave = accLeave + accAdditional;

      const description = wYears < 1 ? `입사 ${wMonths}개월차` : `근속 ${wYears}년차`;
      let hireDateInfo = wYears < 1 ? "매월 1일씩 발생" : "";
      let accountingDateInfo = "";

      if (wYears >= 1) {
        if (hireAnniv <= actualEnd && hireAnniv >= new Date(year, 0, 1)) {
          hireDateInfo = `${hireAnniv.toLocaleDateString('ko-KR')} 발생`;
        } else if (year === sYear) {
          hireDateInfo = `${start.toLocaleDateString('ko-KR')} 입사`;
        } else {
          hireDateInfo = `${hireAnniv.toLocaleDateString('ko-KR')} 예정`;
        }
      }
      if (effectiveAccStart <= actualEnd) {
        accountingDateInfo = `${effectiveAccStart.toLocaleDateString('ko-KR')} 발생`;
      }

      yearlyHistory.push({
        year, workingYears: wYears,
        hireBasedLeave: hireLeave, hireBasedAdditional: hireAdditional, hireTotalLeave,
        accountingLeave: accLeave, accountingAdditional: accAdditional, accountingTotalLeave: accTotalLeave,
        difference: hireTotalLeave - accTotalLeave,
        description, hireDateInfo, accountingDateInfo
      });
    }

    setResult({
      startDate: start.toLocaleDateString('ko-KR'),
      calculateDate: calc.toLocaleDateString('ko-KR'),
      accountingStart: accountingStart.toLocaleDateString('ko-KR'),
      workingYears: totalWorkingYears,
      workingDaysInYear: Math.floor((calc.getTime() - (start > accountingStart ? start.getTime() : accountingStart.getTime())) / 86400000),
      legalLeave: hireBasedLeave, additionalLeave: hireBasedAdditional,
      totalLeave: hireBasedLeave + hireBasedAdditional,
      accountingLeave: accountingBasedLeave, accountingAdditional: accountingBasedAdditional,
      totalAccountingLeave: accountingBasedLeave + accountingBasedAdditional,
      leaveDifference: (hireBasedLeave + hireBasedAdditional) - (accountingBasedLeave + accountingBasedAdditional),
      yearlyHistory,
      isNewEmployee: totalWorkingYears < 1
    });
  };

  // ── 법조문 효력 판단 UI 헬퍼 ──────────────────────────────────
  const lawStatus = startDate ? getLawStatus(startDate) : null;

  const LAW_CONFIG = {
    full: {
      bg: 'bg-emerald-50 border-emerald-200',
      badge: 'bg-emerald-600',
      icon: '✅',
      label: '신법 완전 적용',
      title: '개정 근로기준법 제60조 제3항 적용',
      desc: '이 직원의 입사일은 2018년 5월 29일 이후로, 개정 근로기준법이 완전히 적용됩니다. 입사 후 1년 미만 기간 동안 매월 1일의 유급휴가가 발생합니다.',
    },
    partial: {
      bg: 'bg-amber-50 border-amber-200',
      badge: 'bg-amber-500',
      icon: '⚠️',
      label: '부분 적용',
      title: '시행 시점 재직 중 → 신법 부분 적용',
      desc: '이 직원은 2018년 5월 29일 시행 당시 재직 1년 미만 상태였습니다. 시행일(2018.5.29)부터 1주년 입사일까지의 미경과 개월 수에 대해 신법이 적용되어 월 1일 연차가 발생합니다. 시행일 이전 기간은 구법 적용(연차 미발생).',
    },
    old: {
      bg: 'bg-gray-50 border-gray-200',
      badge: 'bg-gray-500',
      icon: '📋',
      label: '구법 적용',
      title: '개정 전 법률 적용 (1년 미만 연차 없음)',
      desc: '이 직원의 입사 1주년이 2018년 5월 29일 이전에 도래했습니다. 1년 미만 근무 기간에는 연차가 발생하지 않는 구법이 적용되었습니다.',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-black hover:text-black transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />홈으로
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <Calculator className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-black">연차 산정 계산기</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">

        {/* ── 입력 폼 ──────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />기본 정보 입력
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 입사일 */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">입사일</label>
              <div className="flex space-x-2">
                {[
                  { placeholder: "년도", value: startYear, setter: setStartYear, maxLen: 4, nextRef: startMonthRef, label: "년" },
                  { placeholder: "월", value: startMonth, setter: setStartMonth, maxLen: 2, nextRef: startDayRef, label: "월", ref: startMonthRef },
                  { placeholder: "일", value: startDay, setter: setStartDay, maxLen: 2, nextRef: calcYearRef, label: "일", ref: startDayRef },
                ].map((f, i) => (
                  <div key={i} className="flex-1">
                    <input
                      ref={'ref' in f ? f.ref : undefined}
                      type="text" placeholder={f.placeholder} value={f.value}
                      onChange={(e) => {
                        handleDateInput(e.target.value, f.setter, f.maxLen, f.nextRef);
                        const vals = [startYear, startMonth, startDay];
                        vals[i] = e.target.value.replace(/\D/g, '');
                        setStartDate(combineDate(vals[0], vals[1], vals[2]));
                      }}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-black text-sm"
                      maxLength={f.maxLen}
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 회계연도 */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">회계연도 시작일</label>
              <select
                value={accountingYearStart}
                onChange={(e) => setAccountingYearStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-green-50 text-black"
              >
                <option value="01-01">1월 1일 (일반적) ✓</option>
                <option value="04-01">4월 1일</option>
                <option value="07-01">7월 1일</option>
                <option value="10-01">10월 1일</option>
              </select>
              <p className="text-xs text-green-600 mt-1">회사 취업규칙 기준 선택</p>
            </div>

            {/* 계산 기준일 */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">계산 기준일</label>
              <div className="flex space-x-2">
                {[
                  { placeholder: "년도", value: calcYear, setter: setCalcYear, maxLen: 4, nextRef: calcMonthRef, label: "년", ref: calcYearRef },
                  { placeholder: "월", value: calcMonth, setter: setCalcMonth, maxLen: 2, nextRef: calcDayRef, label: "월", ref: calcMonthRef },
                  { placeholder: "일", value: calcDay, setter: setCalcDay, maxLen: 2, label: "일", ref: calcDayRef },
                ].map((f, i) => (
                  <div key={i} className="flex-1">
                    <input
                      ref={f.ref} type="text" placeholder={f.placeholder} value={f.value}
                      onChange={(e) => {
                        handleDateInput(e.target.value, f.setter, f.maxLen, 'nextRef' in f ? f.nextRef : undefined);
                        const vals = [calcYear, calcMonth, calcDay];
                        vals[i] = e.target.value.replace(/\D/g, '');
                        setCalculateDate(combineDate(vals[0], vals[1], vals[2]));
                      }}
                      className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center text-black text-sm"
                      maxLength={f.maxLen}
                    />
                    <p className="text-xs text-gray-500 text-center mt-1">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={calculateAnnualLeave}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base"
          >
            연차 계산하기
          </button>
        </div>

        {result && (
          <>
            {/* ── STEP 1: 법조문 효력 판단 ──────────────────────── */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">STEP 1</span>
                <h2 className="text-lg font-bold text-gray-900">개정 법조문 효력 판단</h2>
              </div>

              {lawStatus && (() => {
                const cfg = LAW_CONFIG[lawStatus];
                return (
                  <div className={`border rounded-xl p-5 ${cfg.bg}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{cfg.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-white text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm mb-1">{cfg.title}</h3>
                          <p className="text-sm text-gray-700 leading-relaxed">{cfg.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandLawDetail(!expandLawDetail)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 shrink-0 mt-1"
                      >
                        법조문 보기 {expandLawDetail ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    {expandLawDetail && (
                      <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-semibold text-blue-700">근로기준법 제60조 제3항 (개정 2018.3.20, 시행 2018.5.29)</span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            &quot;사용자는 근로자가 취업한 후 1년 미만인 경우 또는 1년간 8할 미만 출근한 경우에는 1개월 개근 시 1일의 유급휴가를 주어야 한다.&quot;
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Scale className="h-4 w-4 text-gray-500" />
                            <span className="text-xs font-semibold text-gray-600">근로기준법 제60조 제3항 (개정 전 구법)</span>
                          </div>
                          <p className="text-sm text-gray-500 leading-relaxed">
                            &quot;사용자는 근로자가 1년간 8할 이상 출근하면 15일의 유급휴가를 주어야 한다.&quot; — 1년 미만자에 대한 월차 규정 없음
                          </p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                          <p className="text-xs text-amber-800">
                            <strong>주의:</strong> 단, 개정법 제60조 제5항에 따라 1년 미만 기간에 사용한 유급휴가 일수는 다음 해 15일에서 차감됩니다.
                            (입사 1년차에 11일 사용 → 2년차 연차 = 15일 - 11일 = 4일)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* ── STEP 2: 연차 계산 결과 요약 ───────────────────── */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">STEP 2</span>
                <h2 className="text-lg font-bold text-gray-900">연차 계산 결과</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 입사일 기준 */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-blue-700 mb-1">📅 입사일 기준 (법정 연차)</h3>
                  <div className="text-3xl font-extrabold text-blue-600">{result.totalLeave}일</div>
                  <p className="text-xs text-blue-600 mt-1">기본 {result.legalLeave}일 + 가산 {result.additionalLeave}일</p>
                  <p className="text-xs text-blue-500 mt-2">근로기준법 기준, 받았어야 할 연차</p>
                </div>

                {/* 회계연도 기준 */}
                <div className="bg-violet-50 border border-violet-200 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-violet-700 mb-1">🏢 회계연도 기준</h3>
                  <div className="text-3xl font-extrabold text-violet-600">{result.totalAccountingLeave}일</div>
                  <p className="text-xs text-violet-600 mt-1">기본 {result.accountingLeave}일 + 가산 {result.accountingAdditional}일</p>
                  <p className="text-xs text-violet-500 mt-2">회사 기준일로 산정한 연차</p>
                </div>

                {/* 비교 결과 */}
                <div className={`rounded-xl p-5 border ${
                  result.leaveDifference > 0 ? 'bg-red-50 border-red-200' :
                  result.leaveDifference < 0 ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`text-sm font-semibold mb-1 ${
                    result.leaveDifference > 0 ? 'text-red-700' :
                    result.leaveDifference < 0 ? 'text-green-700' : 'text-gray-700'
                  }`}>⚖️ 비교 결과</h3>
                  <div className={`text-3xl font-extrabold ${
                    result.leaveDifference > 0 ? 'text-red-600' :
                    result.leaveDifference < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {result.leaveDifference > 0 ? `+${result.leaveDifference}` : result.leaveDifference}일
                  </div>
                  <p className={`text-xs mt-2 ${
                    result.leaveDifference > 0 ? 'text-red-600' :
                    result.leaveDifference < 0 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {result.leaveDifference > 0 ? '법정 기준 대비 부족하게 지급' :
                     result.leaveDifference < 0 ? '법정 기준보다 더 많이 지급' : '법정 기준과 동일'}
                  </p>
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { label: '입사일', value: result.startDate },
                    { label: '계산 기준일', value: result.calculateDate },
                    { label: '회계연도 시작', value: result.accountingStart },
                    { label: '총 근속연수', value: `${result.workingYears}년` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-gray-500 text-xs">{label}</p>
                      <p className="font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── STEP 3: 연도별 연차 대장 ──────────────────────── */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">STEP 3</span>
                <h2 className="text-lg font-bold text-gray-900">연도별 연차 대장</h2>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs text-gray-600">
                    · <strong>실제부여</strong>: 계산값이 자동 반영됩니다. 회사에서 실제 부여받은 연차가 다를 경우 직접 수정하세요.
                    &nbsp;· <strong>사용/정산/소멸</strong>은 직접 입력하세요. 잔여 = 실제부여 − 사용 − 정산 − 소멸
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">연도</th>
                        <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">상태</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-blue-600 whitespace-nowrap">입사일기준</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-violet-600 whitespace-nowrap">회계연도기준</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-gray-800 whitespace-nowrap bg-yellow-50">실제부여<br/><span className="text-gray-400 font-normal">(수기입력)</span></th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-green-700 whitespace-nowrap">사용</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-orange-600 whitespace-nowrap">정산</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-red-500 whitespace-nowrap">소멸</th>
                        <th className="py-3 px-4 text-center text-xs font-semibold text-gray-700 whitespace-nowrap bg-blue-50">잔여</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyHistory.map((y, idx) => {
                        const u = leaveUsage[y.year] ?? { adjusted: null, used: 0, settled: 0, expired: 0 };
                        const granted = getGranted(y);
                        const remaining = getRemaining(y);
                        const isOdd = idx % 2 === 1;

                        return (
                          <tr key={y.year} className={`border-b border-gray-100 ${isOdd ? 'bg-gray-50/50' : 'bg-white'}`}>
                            {/* 연도 */}
                            <td className="py-3 px-4 font-semibold text-gray-900">{y.year}</td>

                            {/* 상태 */}
                            <td className="py-3 px-4 text-xs text-gray-600 whitespace-nowrap">
                              {y.description}
                            </td>

                            {/* 입사일 기준 */}
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-blue-600">{y.hireTotalLeave}일</span>
                              {y.hireDateInfo && <div className="text-xs text-blue-400 mt-0.5">{y.hireDateInfo}</div>}
                            </td>

                            {/* 회계연도 기준 */}
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-violet-600">{y.accountingTotalLeave}일</span>
                              {y.accountingDateInfo && <div className="text-xs text-violet-400 mt-0.5">{y.accountingDateInfo}</div>}
                            </td>

                            {/* 실제부여 (수기조정) */}
                            <td className="py-3 px-4 text-center bg-yellow-50/60">
                              <input
                                type="number"
                                value={u.adjusted !== null ? u.adjusted : granted}
                                onChange={(e) => updateUsage(y.year, 'adjusted', parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 text-sm border border-yellow-300 rounded-lg text-center font-semibold text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-white"
                                min="0"
                              />
                              {u.adjusted !== null && (
                                <button
                                  onClick={() => updateUsage(y.year, 'adjusted', null)}
                                  className="block text-xs text-gray-400 hover:text-gray-600 mt-0.5 mx-auto"
                                >
                                  초기화
                                </button>
                              )}
                            </td>

                            {/* 사용 */}
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                value={u.used}
                                onChange={(e) => updateUsage(y.year, 'used', parseInt(e.target.value) || 0)}
                                className="w-14 px-2 py-1 text-sm border border-green-200 rounded-lg text-center text-green-700 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                                min="0"
                              />
                            </td>

                            {/* 정산 */}
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                value={u.settled}
                                onChange={(e) => updateUsage(y.year, 'settled', parseInt(e.target.value) || 0)}
                                className="w-14 px-2 py-1 text-sm border border-orange-200 rounded-lg text-center text-orange-700 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                min="0"
                              />
                            </td>

                            {/* 소멸 */}
                            <td className="py-3 px-4 text-center">
                              <input
                                type="number"
                                value={u.expired}
                                onChange={(e) => updateUsage(y.year, 'expired', parseInt(e.target.value) || 0)}
                                className="w-14 px-2 py-1 text-sm border border-red-200 rounded-lg text-center text-red-600 focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                min="0"
                              />
                            </td>

                            {/* 잔여 */}
                            <td className="py-3 px-4 text-center bg-blue-50/60">
                              <span className={`font-bold text-base ${
                                remaining > 0 ? 'text-blue-600' :
                                remaining < 0 ? 'text-red-600' : 'text-gray-400'
                              }`}>
                                {remaining}일
                              </span>
                              {remaining < 0 && (
                                <div className="text-xs text-red-500 mt-0.5">초과</div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* 합계 행 */}
                    <tfoot>
                      <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
                        <td className="py-3 px-4 text-gray-700" colSpan={2}>합계</td>
                        <td className="py-3 px-4 text-center text-blue-700">
                          {result.yearlyHistory.reduce((s, y) => s + y.hireTotalLeave, 0)}일
                        </td>
                        <td className="py-3 px-4 text-center text-violet-700">
                          {result.yearlyHistory.reduce((s, y) => s + y.accountingTotalLeave, 0)}일
                        </td>
                        <td className="py-3 px-4 text-center text-gray-900 bg-yellow-50">
                          {result.yearlyHistory.reduce((s, y) => s + getGranted(y), 0)}일
                        </td>
                        <td className="py-3 px-4 text-center text-green-700">
                          {result.yearlyHistory.reduce((s, y) => s + (leaveUsage[y.year]?.used ?? 0), 0)}일
                        </td>
                        <td className="py-3 px-4 text-center text-orange-600">
                          {result.yearlyHistory.reduce((s, y) => s + (leaveUsage[y.year]?.settled ?? 0), 0)}일
                        </td>
                        <td className="py-3 px-4 text-center text-red-500">
                          {result.yearlyHistory.reduce((s, y) => s + (leaveUsage[y.year]?.expired ?? 0), 0)}일
                        </td>
                        <td className="py-3 px-4 text-center text-blue-700 bg-blue-50">
                          {result.yearlyHistory.reduce((s, y) => s + getRemaining(y), 0)}일
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500 flex flex-wrap gap-4">
                  <span><span className="font-medium text-gray-700">실제부여</span> = 계산값(기본) or 수기입력</span>
                  <span><span className="font-medium text-green-600">사용</span> = 휴가 사용일</span>
                  <span><span className="font-medium text-orange-600">정산</span> = 미사용 연차수당 지급</span>
                  <span><span className="font-medium text-red-500">소멸</span> = 2년 경과 소멸</span>
                  <span><span className="font-medium text-blue-600">잔여</span> = 실제부여 − 사용 − 정산 − 소멸</span>
                </div>
              </div>

              {result.isNewEmployee && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-amber-800">
                    <strong>1년 미만 신입사원</strong>: 개정법 적용 시 매월 1일씩 최대 11일 발생.
                    단, 1년 만근 후 지급되는 15일에서 해당 기간 사용한 연차를 차감합니다 (근로기준법 제60조 제5항).
                  </p>
                </div>
              )}
            </div>

            {/* ── 저장 / 출력 ───────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              {saveSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
                  <Check className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 text-sm">계산 결과가 성공적으로 저장되었습니다!</span>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {userSession && (
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Save className="h-4 w-4" />내 계정에 저장
                  </button>
                )}
                <button
                  onClick={() => exportAnnualLeaveToPDF(result)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />PDF 다운로드
                </button>
                <button
                  onClick={() => exportAnnualLeaveToExcel(result)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <FileSpreadsheet className="h-4 w-4" />Excel 다운로드
                </button>
              </div>
            </div>
          </>
        )}

        {!result && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
            <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">위 양식을 입력하고 <strong>연차 계산하기</strong> 버튼을 눌러주세요.</p>
          </div>
        )}
      </div>

      {/* 저장 다이얼로그 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-black mb-4">계산 결과 저장</h3>
            <input
              type="text" value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder={`연차 계산 - ${result?.startDate || ''}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4 text-black"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowSaveDialog(false); setSaveTitle(""); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >취소</button>
              <button
                onClick={saveCalculation} disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />저장 중...</> : '저장하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
