"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft, Wallet, Calculator, Info, AlertCircle, Users, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── 2026년 기준 요율 ────────────────────────────────────────────────────────
const RATES = {
  nationalPension: 0.045,     // 국민연금 4.5%
  healthInsurance: 0.03545,   // 건강보험 3.545%
  longTermCare: 0.1295,       // 장기요양보험 = 건강보험료 × 12.95%
  employmentInsurance: 0.009, // 고용보험 0.9%
};
const NP_UPPER = 6170000; // 국민연금 상한 617만원/월
const NP_LOWER = 350000;  // 국민연금 하한 35만원/월

// ─── 근로소득공제 (소득세법 제47조) ─────────────────────────────────────────
function calcEarnedIncomeDeduction(salary: number): number {
  let d = 0;
  if (salary <= 5_000_000)        d = salary * 0.7;
  else if (salary <= 15_000_000)  d = 3_500_000 + (salary - 5_000_000) * 0.4;
  else if (salary <= 45_000_000)  d = 7_500_000 + (salary - 15_000_000) * 0.15;
  else if (salary <= 100_000_000) d = 12_000_000 + (salary - 45_000_000) * 0.05;
  else                            d = 14_750_000 + (salary - 100_000_000) * 0.02;
  return Math.min(Math.floor(d), 20_000_000);
}

// ─── 소득세 누진세율 (소득세법 제55조) ───────────────────────────────────────
function calcIncomeTax(base: number): number {
  if (base <= 0)              return 0;
  if (base <= 14_000_000)     return Math.floor(base * 0.06);
  if (base <= 50_000_000)     return Math.floor(840_000 + (base - 14_000_000) * 0.15);
  if (base <= 88_000_000)     return Math.floor(6_240_000 + (base - 50_000_000) * 0.24);
  if (base <= 150_000_000)    return Math.floor(15_360_000 + (base - 88_000_000) * 0.35);
  if (base <= 300_000_000)    return Math.floor(37_060_000 + (base - 150_000_000) * 0.38);
  if (base <= 500_000_000)    return Math.floor(94_060_000 + (base - 300_000_000) * 0.40);
  if (base <= 1_000_000_000)  return Math.floor(174_060_000 + (base - 500_000_000) * 0.42);
  return Math.floor(384_060_000 + (base - 1_000_000_000) * 0.45);
}

// ─── 근로소득 세액공제 (소득세법 제59조) ─────────────────────────────────────
function calcEarnedIncomeCredit(taxAmount: number, totalSalary: number): number {
  const credit = taxAmount <= 1_300_000
    ? Math.floor(taxAmount * 0.55)
    : Math.floor(715_000 + (taxAmount - 1_300_000) * 0.30);

  let limit: number;
  if (totalSalary <= 33_000_000) {
    limit = 740_000;
  } else if (totalSalary <= 70_000_000) {
    limit = Math.max(660_000, Math.floor(740_000 - (totalSalary - 33_000_000) * 0.008));
  } else {
    limit = Math.max(500_000, Math.floor(660_000 - (totalSalary - 70_000_000) * 0.5));
  }
  return Math.min(credit, limit);
}

// ─── 핵심 계산 로직 ───────────────────────────────────────────────────────────
interface CalcResult {
  monthlyGross: number;
  monthlyNonTaxable: number;
  monthlyTaxable: number;
  monthlyNP: number;
  monthlyHI: number;
  monthlyLTC: number;
  monthlyEI: number;
  monthlyIT: number;
  monthlyLIT: number;
  monthlyDeduction: number;
  monthlyNet: number;
}

function calcSalary(annualSalary: number, dependents: number, mealExempt: boolean): CalcResult {
  const annualNonTaxable = mealExempt ? 2_400_000 : 0;
  const taxableSalary = Math.max(0, annualSalary - annualNonTaxable);

  const monthlyGross = Math.round(annualSalary / 12);
  const monthlyNonTaxable = Math.round(annualNonTaxable / 12);

  // 4대보험 (월 급여 기준)
  const npBase = Math.min(Math.max(monthlyGross, NP_LOWER), NP_UPPER);
  const monthlyNP  = Math.round(npBase * RATES.nationalPension);
  const monthlyHI  = Math.round(monthlyGross * RATES.healthInsurance);
  const monthlyLTC = Math.round(monthlyHI * RATES.longTermCare);
  const monthlyEI  = Math.round(monthlyGross * RATES.employmentInsurance);

  // 근로소득세 (연간 계산 후 /12)
  const earnedDeduction = calcEarnedIncomeDeduction(taxableSalary);
  const personalDeduction = 1_500_000 * Math.max(1, dependents);
  const taxableBase = Math.max(0, taxableSalary - earnedDeduction - personalDeduction);
  const grossTax = calcIncomeTax(taxableBase);
  const earnedCredit = calcEarnedIncomeCredit(grossTax, taxableSalary);
  const annualIT = Math.max(0, grossTax - earnedCredit - 130_000); // 표준세액공제 13만원
  const monthlyIT  = Math.round(annualIT / 12);
  const monthlyLIT = Math.round(monthlyIT * 0.1);

  const monthlyDeduction = monthlyNP + monthlyHI + monthlyLTC + monthlyEI + monthlyIT + monthlyLIT;
  const monthlyNet = monthlyGross - monthlyDeduction;

  return {
    monthlyGross,
    monthlyNonTaxable,
    monthlyTaxable: monthlyGross - monthlyNonTaxable,
    monthlyNP,
    monthlyHI,
    monthlyLTC,
    monthlyEI,
    monthlyIT,
    monthlyLIT,
    monthlyDeduction,
    monthlyNet,
  };
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────
export default function SalaryPage() {
  const [salaryInput, setSalaryInput] = useState("");
  const [dependents, setDependents] = useState(1);
  const [mealExempt, setMealExempt] = useState(true);
  const [view, setView] = useState<"monthly" | "annual">("monthly");
  const [showDetail, setShowDetail] = useState(false);

  const annualSalary = parseInt(salaryInput.replace(/,/g, "")) || 0;

  const result = useMemo(
    () => (annualSalary > 0 ? calcSalary(annualSalary, dependents, mealExempt) : null),
    [annualSalary, dependents, mealExempt]
  );

  const fmt = (n: number) => n.toLocaleString();
  const mul = (n: number) => view === "annual" ? n * 12 : n;
  const label = view === "annual" ? "연간" : "월";

  const formatInput = (v: string) => {
    const n = v.replace(/[^0-9]/g, "");
    return n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 빠른 연봉 버튼
  const presets = [30_000_000, 40_000_000, 50_000_000, 60_000_000, 80_000_000, 100_000_000];

  const deductionItems = result
    ? [
        { label: "국민연금 (4.5%)",          value: mul(result.monthlyNP),  color: "bg-blue-400" },
        { label: "건강보험 (3.545%)",          value: mul(result.monthlyHI),  color: "bg-cyan-400" },
        { label: "장기요양보험 (건강보험×12.95%)", value: mul(result.monthlyLTC), color: "bg-teal-400" },
        { label: "고용보험 (0.9%)",            value: mul(result.monthlyEI),  color: "bg-indigo-400" },
        { label: "근로소득세",                  value: mul(result.monthlyIT),  color: "bg-rose-400" },
        { label: "지방소득세 (소득세×10%)",      value: mul(result.monthlyLIT), color: "bg-pink-400" },
      ]
    : [];

  const totalDeduction = deductionItems.reduce((s, i) => s + i.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center text-gray-400 hover:text-amber-600 transition-colors text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />홈
            </Link>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-amber-500" />
              <h1 className="text-sm font-semibold text-gray-700">연봉 실수령액 계산기</h1>
            </div>
          </div>
          <span className="text-xs text-gray-400 hidden sm:block">2026년 기준</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 안내 */}
        <p className="text-xs text-gray-400 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          2026년 기준 4대보험료율 및 소득세법이 반영된 근사값입니다. 실제 원천징수액과 차이가 있을 수 있습니다.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── 입력 패널 ── */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-amber-500" />
              급여 정보 입력
            </h2>

            {/* 연봉 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">연봉 (세전)</label>
              <div className="relative">
                <input
                  type="text"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(formatInput(e.target.value))}
                  placeholder="예: 40,000,000"
                  className="w-full px-3 py-2.5 pr-8 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-transparent text-gray-900 text-sm"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-sm">원</span>
              </div>
              {/* 빠른 선택 */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {presets.map((v) => (
                  <button
                    key={v}
                    onClick={() => setSalaryInput(v.toLocaleString())}
                    className={`px-2 py-1 text-xs rounded-full border transition-all ${
                      annualSalary === v
                        ? "bg-amber-100 border-amber-400 text-amber-700 font-semibold"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-amber-300"
                    }`}
                  >
                    {v / 10_000_000}천만
                  </button>
                ))}
              </div>
            </div>

            {/* 부양가족 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                부양가족 수 (본인 포함)
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDependents(Math.max(1, dependents - 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold hover:bg-amber-100 transition-colors"
                >−</button>
                <span className="text-lg font-bold text-gray-800 w-6 text-center">{dependents}</span>
                <button
                  onClick={() => setDependents(Math.min(10, dependents + 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold hover:bg-amber-100 transition-colors"
                >+</button>
                <span className="text-xs text-gray-500">명</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">인당 기본공제 150만원 적용</p>
            </div>

            {/* 식대 비과세 */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setMealExempt(!mealExempt)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${mealExempt ? "bg-amber-500" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${mealExempt ? "left-6" : "left-1"}`} />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">식대 비과세 적용</span>
                  <p className="text-xs text-gray-400">월 20만원 × 12개월 = 연 240만원 비과세</p>
                </div>
              </label>
            </div>

            {/* 월별/연도별 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">계산 단위</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setView("monthly")}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    view === "monthly" ? "bg-amber-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  월별
                </button>
                <button
                  onClick={() => setView("annual")}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    view === "annual" ? "bg-amber-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  연도별
                </button>
              </div>
            </div>
          </div>

          {/* ── 결과 패널 ── */}
          <div className="lg:col-span-3 space-y-4">
            {result ? (
              <>
                {/* 실수령액 요약 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">{label} 실수령액</p>
                      <p className="text-4xl font-black text-amber-600 mt-1">
                        {fmt(mul(result.monthlyNet))}
                        <span className="text-lg font-medium text-gray-400 ml-1">원</span>
                      </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{label} 세전 급여</p>
                      <p className="font-semibold text-gray-800">{fmt(mul(result.monthlyGross))}원</p>
                    </div>
                  </div>

                  {/* 총 공제 vs 실수령 비율 바 */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>실수령액 {((mul(result.monthlyNet) / mul(result.monthlyGross)) * 100).toFixed(1)}%</span>
                      <span>공제합계 {((totalDeduction / mul(result.monthlyGross)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden flex">
                      <div
                        className="bg-amber-400 rounded-l-full transition-all"
                        style={{ width: `${(mul(result.monthlyNet) / mul(result.monthlyGross)) * 100}%` }}
                      />
                      <div className="flex-1 bg-rose-300 rounded-r-full" />
                    </div>
                  </div>

                  {/* 비과세 식대 표시 */}
                  {mealExempt && (
                    <div className="mt-3 text-xs text-teal-600 bg-teal-50 rounded-lg px-3 py-1.5">
                      비과세 식대 {fmt(mul(result.monthlyNonTaxable))}원 포함 (과세급여 {fmt(mul(result.monthlyTaxable))}원)
                    </div>
                  )}
                </div>

                {/* 공제 항목 상세 */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-700 mb-4">공제 항목 상세</h3>
                  <div className="space-y-3">
                    {deductionItems.map((item) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-semibold text-gray-800">{fmt(item.value)}원</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color} transition-all`}
                            style={{
                              width: `${Math.min(100, (item.value / mul(result.monthlyGross)) * 100 * 8)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-bold">
                      <span className="text-gray-700">공제 합계</span>
                      <span className="text-rose-600">{fmt(totalDeduction)}원</span>
                    </div>
                  </div>
                </div>

                {/* 상세 요약표 (접기/펼치기) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setShowDetail(!showDetail)}
                    className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>전체 급여 명세 ({label})</span>
                    {showDetail ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>

                  {showDetail && (
                    <div className="px-6 pb-5 border-t border-gray-100">
                      <table className="w-full text-sm mt-4">
                        <tbody className="divide-y divide-gray-50">
                          <tr className="py-2">
                            <td className="py-2 text-gray-500">세전 {label} 급여</td>
                            <td className="py-2 text-right font-semibold">{fmt(mul(result.monthlyGross))}원</td>
                          </tr>
                          {mealExempt && (
                            <tr>
                              <td className="py-2 text-gray-500 pl-4 text-xs">└ 식대 비과세</td>
                              <td className="py-2 text-right text-xs text-teal-600">{fmt(mul(result.monthlyNonTaxable))}원</td>
                            </tr>
                          )}
                          <tr>
                            <td className="py-2 text-gray-500 pl-4 text-xs">└ 과세 급여</td>
                            <td className="py-2 text-right text-xs">{fmt(mul(result.monthlyTaxable))}원</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-2 px-2 text-gray-600 font-medium">4대보험</td>
                            <td />
                          </tr>
                          <tr>
                            <td className="py-2 pl-4 text-gray-500">국민연금 (4.5%)</td>
                            <td className="py-2 text-right text-blue-600">-{fmt(mul(result.monthlyNP))}원</td>
                          </tr>
                          <tr>
                            <td className="py-2 pl-4 text-gray-500">건강보험 (3.545%)</td>
                            <td className="py-2 text-right text-blue-600">-{fmt(mul(result.monthlyHI))}원</td>
                          </tr>
                          <tr>
                            <td className="py-2 pl-4 text-gray-500">장기요양보험 (×12.95%)</td>
                            <td className="py-2 text-right text-blue-600">-{fmt(mul(result.monthlyLTC))}원</td>
                          </tr>
                          <tr>
                            <td className="py-2 pl-4 text-gray-500">고용보험 (0.9%)</td>
                            <td className="py-2 text-right text-blue-600">-{fmt(mul(result.monthlyEI))}원</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-2 px-2 text-gray-600 font-medium">세금</td>
                            <td />
                          </tr>
                          <tr>
                            <td className="py-2 pl-4 text-gray-500">근로소득세</td>
                            <td className="py-2 text-right text-rose-600">-{fmt(mul(result.monthlyIT))}원</td>
                          </tr>
                          <tr>
                            <td className="py-2 pl-4 text-gray-500">지방소득세 (소득세×10%)</td>
                            <td className="py-2 text-right text-rose-600">-{fmt(mul(result.monthlyLIT))}원</td>
                          </tr>
                          <tr className="border-t-2 border-gray-200 font-bold">
                            <td className="py-3 text-gray-800">{label} 실수령액</td>
                            <td className="py-3 text-right text-amber-600 text-base">{fmt(mul(result.monthlyNet))}원</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                <Wallet className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">연봉을 입력하면 실수령액과 공제 내역을 확인할 수 있습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* 법적 근거 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-amber-500" />
            계산 기준 및 법적 근거 (2026년)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-600">
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-700 mb-1">4대보험 요율 (근로자 부담분)</p>
                <ul className="space-y-0.5 text-gray-500">
                  <li>• 국민연금: 4.5% (상한 617만원, 하한 35만원/월)</li>
                  <li>• 건강보험: 3.545%</li>
                  <li>• 장기요양보험: 건강보험료 × 12.95%</li>
                  <li>• 고용보험: 0.9%</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">비과세 항목</p>
                <ul className="space-y-0.5 text-gray-500">
                  <li>• 식대: 월 200,000원 (소득세법 제12조)</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-700 mb-1">근로소득세 계산 흐름</p>
                <ol className="space-y-0.5 text-gray-500 list-none">
                  <li>1. 과세급여 = 연봉 - 비과세</li>
                  <li>2. 근로소득공제 (최대 2,000만원)</li>
                  <li>3. 기본공제 (인당 150만원)</li>
                  <li>4. 과세표준에 누진세율 6%~45% 적용</li>
                  <li>5. 근로소득 세액공제 차감</li>
                  <li>6. 표준세액공제 130,000원 차감</li>
                  <li>7. 지방소득세 = 근로소득세 × 10%</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">소득세 과세표준 구간</p>
                <ul className="space-y-0.5 text-gray-500">
                  <li>• 1,400만원 이하: 6%</li>
                  <li>• 5,000만원 이하: 15%</li>
                  <li>• 8,800만원 이하: 24%</li>
                  <li>• 1.5억원 이하: 35%</li>
                  <li>• 3억원 이하: 38% / 5억원 이하: 40%</li>
                </ul>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-red-500">
            ⚠️ 본 계산기는 연간 세액을 12개월로 균등 배분하는 방식으로 근사값을 제공합니다. 실제 간이세액표 적용 결과 및 연말정산 후 최종 세액과 차이가 있을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
