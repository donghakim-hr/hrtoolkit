// 연도별 연차 정보 타입
export interface YearlyLeaveInfo {
  year: number;
  workingYears: number;
  hireBasedLeave: number;
  hireBasedAdditional: number;
  hireTotalLeave: number;
  accountingLeave: number;
  accountingAdditional: number;
  accountingTotalLeave: number;
  difference: number;
  description: string;
  hireDateInfo?: string;
  accountingDateInfo?: string;
}

// 연차 계산 결과 타입
export interface AnnualLeaveResult {
  startDate: string;
  calculateDate: string;
  accountingStart: string;
  workingYears: number;
  workingDaysInYear: number;

  // 입사일 기준 연차
  legalLeave: number;
  additionalLeave: number;
  totalLeave: number;

  // 회계연도 기준 연차
  accountingLeave: number;
  accountingAdditional: number;
  totalAccountingLeave: number;

  // 비교 결과
  leaveDifference: number;

  // 연도별 히스토리
  yearlyHistory: YearlyLeaveInfo[];

  isNewEmployee: boolean;
}

// 퇴직급여 계산 결과 타입
export interface RetirementPayResult {
  startDate: string;
  endDate: string;
  workingDays: number;
  workingYears: number;
  workingMonths: number;
  averagePay: number;
  monthlyPay: number;
  retirementPay: number;
  continuousServiceBonus: number;
  totalAmount: number;
  calculationMethod: string;
  retirementType: string;
}

// 퇴직소득세 계산 결과 타입
export interface RetirementTaxResult {
  retirementAmount: number;
  workingYears: number;
  age: number;
  retirementDeduction: number;
  taxableIncome: number;
  convertedIncome: number;
  taxRate: number;
  calculatedTax: number;
  retirementTax: number;
  localTax: number;
  totalTax: number;
  netAmount: number;
  effectiveRate: string;
}

// 법령 검색 결과 타입
export interface LegalSearchResult {
  law: string;
  article: string;
  title: string;
  content: string;
  lawNumber: string;
  effectiveDate: string;
  id: string;
}

// 법령 조문 타입
export interface LegalArticle {
  제목: string;
  내용: string;
}

// 법령 정보 타입
export interface LegalInfo {
  법령번호: string;
  시행일: string;
  조문: Record<string, LegalArticle | string>;
}

// 전체 법령 데이터 타입
export type LegalData = Record<string, LegalInfo>;

// 공지사항 타입
export interface Notice {
  id: number;
  date: string;
  type: 'update' | 'notice' | 'info' | 'warning';
  title: string;
  content: string;
  important: boolean;
  badge?: string;
}

// 1:1 문의 타입 재내보내기
export type { Inquiry, CreateInquiryRequest } from './inquiry';

// 저장된 계산 결과 타입
export interface SavedCalculation {
  id: string;
  userId: string;
  type: 'annual-leave' | 'retirement-pay' | 'retirement-tax';
  title: string;
  data: AnnualLeaveResult | RetirementPayResult | RetirementTaxResult;
  createdAt: string;
  updatedAt: string;
}