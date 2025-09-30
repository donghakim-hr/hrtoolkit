import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { AnnualLeaveResult, RetirementPayResult, RetirementTaxResult } from '@/types';

// 한글 폰트 설정을 위한 유틸리티
const addKoreanFont = (doc: jsPDF) => {
  // jsPDF는 기본적으로 한글을 지원하지 않으므로 영문과 숫자로만 구성
  doc.setFont('helvetica');
};

// 연차 계산 결과 PDF 출력
export const exportAnnualLeaveToPDF = (result: AnnualLeaveResult) => {
  const doc = new jsPDF();
  addKoreanFont(doc);

  let yPosition = 20;

  // 제목
  doc.setFontSize(18);
  doc.text('Annual Leave Calculation Report', 20, yPosition);
  yPosition += 20;

  // 기본 정보
  doc.setFontSize(12);
  doc.text('=== Basic Information ===', 20, yPosition);
  yPosition += 10;

  doc.text(`Start Date: ${result.startDate}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Calculation Date: ${result.calculateDate}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Accounting Year Start: ${result.accountingStart}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Working Years: ${result.workingYears} years`, 20, yPosition);
  yPosition += 15;

  // 연차 비교 결과
  doc.text('=== Leave Comparison ===', 20, yPosition);
  yPosition += 10;

  doc.text(`Hire-based Leave: ${result.totalLeave} days`, 20, yPosition);
  yPosition += 8;
  doc.text(`- Basic: ${result.legalLeave} days`, 30, yPosition);
  yPosition += 8;
  doc.text(`- Additional: ${result.additionalLeave} days`, 30, yPosition);
  yPosition += 10;

  doc.text(`Accounting-based Leave: ${result.totalAccountingLeave} days`, 20, yPosition);
  yPosition += 8;
  doc.text(`- Basic: ${result.accountingLeave} days`, 30, yPosition);
  yPosition += 8;
  doc.text(`- Additional: ${result.accountingAdditional} days`, 30, yPosition);
  yPosition += 10;

  doc.text(`Difference: ${result.leaveDifference} days`, 20, yPosition);
  yPosition += 15;

  // 연도별 히스토리
  doc.text('=== Yearly History ===', 20, yPosition);
  yPosition += 10;

  result.yearlyHistory.forEach((yearData, index) => {
    if (yPosition > 270) { // 페이지 끝에 가까우면 새 페이지
      doc.addPage();
      yPosition = 20;
    }

    doc.text(`${yearData.year}: Hire(${yearData.hireTotalLeave}) vs Accounting(${yearData.accountingTotalLeave}) = ${yearData.difference > 0 ? '+' : ''}${yearData.difference}`, 20, yPosition);
    yPosition += 8;
  });

  // 생성일
  yPosition += 10;
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('ko-KR')}`, 20, yPosition);

  // 다운로드
  doc.save(`annual-leave-calculation-${new Date().toISOString().split('T')[0]}.pdf`);
};

// 연차 계산 결과 Excel 출력
export const exportAnnualLeaveToExcel = (result: AnnualLeaveResult) => {
  // 기본 정보 시트
  const basicData = [
    ['항목', '값'],
    ['입사일', result.startDate],
    ['계산 기준일', result.calculateDate],
    ['회계연도 시작일', result.accountingStart],
    ['총 근속연수', `${result.workingYears}년`],
    [''],
    ['=== 연차 비교 결과 ===', ''],
    ['입사일 기준 총 연차', `${result.totalLeave}일`],
    ['- 기본 연차', `${result.legalLeave}일`],
    ['- 가산 연차', `${result.additionalLeave}일`],
    [''],
    ['회계연도 기준 총 연차', `${result.totalAccountingLeave}일`],
    ['- 기본 연차', `${result.accountingLeave}일`],
    ['- 가산 연차', `${result.accountingAdditional}일`],
    [''],
    ['차이', `${result.leaveDifference}일`],
  ];

  // 연도별 히스토리 데이터
  const historyData = [
    ['연도', '상태', '입사일 기준 연차', '회계연도 기준 연차', '차이', '입사일 기준 발생일', '회계연도 기준 발생일'],
    ...result.yearlyHistory.map(yearData => [
      yearData.year,
      yearData.description,
      `${yearData.hireTotalLeave}일`,
      `${yearData.accountingTotalLeave}일`,
      `${yearData.difference > 0 ? '+' : ''}${yearData.difference}`,
      yearData.hireDateInfo || '',
      yearData.accountingDateInfo || ''
    ])
  ];

  // 워크북 생성
  const wb = XLSX.utils.book_new();

  // 기본 정보 시트
  const ws1 = XLSX.utils.aoa_to_sheet(basicData);
  XLSX.utils.book_append_sheet(wb, ws1, '기본정보');

  // 연도별 히스토리 시트
  const ws2 = XLSX.utils.aoa_to_sheet(historyData);
  XLSX.utils.book_append_sheet(wb, ws2, '연도별히스토리');

  // 다운로드
  XLSX.writeFile(wb, `annual-leave-calculation-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// 퇴직급여 계산 결과 PDF 출력
export const exportRetirementPayToPDF = (result: RetirementPayResult) => {
  const doc = new jsPDF();
  addKoreanFont(doc);

  let yPosition = 20;

  // 제목
  doc.setFontSize(18);
  doc.text('Retirement Pay Calculation Report', 20, yPosition);
  yPosition += 20;

  // 기본 정보
  doc.setFontSize(12);
  doc.text('=== Basic Information ===', 20, yPosition);
  yPosition += 10;

  doc.text(`Start Date: ${result.startDate}`, 20, yPosition);
  yPosition += 8;
  doc.text(`End Date: ${result.endDate}`, 20, yPosition);
  yPosition += 8;
  doc.text(`Working Years: ${result.workingYears} years`, 20, yPosition);
  yPosition += 8;
  doc.text(`Working Days: ${result.workingDays} days`, 20, yPosition);
  yPosition += 8;
  doc.text(`Monthly Salary: ${result.monthlyPay.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Daily Average Pay: ${result.averagePay.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 15;

  // 퇴직급여 계산 결과
  doc.text('=== Retirement Pay Calculation ===', 20, yPosition);
  yPosition += 10;

  doc.text(`Basic Retirement Pay: ${result.retirementPay.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Continuous Service Bonus: ${result.continuousServiceBonus.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Total Amount: ${result.totalAmount.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 15;

  // 계산 방식
  doc.text('=== Calculation Method ===', 20, yPosition);
  yPosition += 10;
  doc.text(result.calculationMethod, 20, yPosition, { maxWidth: 170 });
  yPosition += 20;

  // 생성일
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('ko-KR')}`, 20, yPosition);

  // 다운로드
  doc.save(`retirement-pay-calculation-${new Date().toISOString().split('T')[0]}.pdf`);
};

// 퇴직급여 계산 결과 Excel 출력
export const exportRetirementPayToExcel = (result: RetirementPayResult) => {
  const data = [
    ['항목', '값'],
    ['입사일', result.startDate],
    ['퇴사일', result.endDate],
    ['근속연수', `${result.workingYears}년`],
    ['근속개월수', `${result.workingMonths}개월`],
    ['근속일수', `${result.workingDays}일`],
    ['월급', `${result.monthlyPay.toLocaleString()}원`],
    ['평균임금(일급)', `${result.averagePay.toLocaleString()}원`],
    [''],
    ['=== 퇴직급여 계산 결과 ===', ''],
    ['기본 퇴직급여', `${result.retirementPay.toLocaleString()}원`],
    ['계속근로가산금', `${result.continuousServiceBonus.toLocaleString()}원`],
    ['총 퇴직급여', `${result.totalAmount.toLocaleString()}원`],
    [''],
    ['계산 방식', result.calculationMethod],
    ['퇴직급여 제도', result.retirementType],
    [''],
    ['생성일', new Date().toLocaleDateString('ko-KR')]
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, '퇴직급여계산');

  XLSX.writeFile(wb, `retirement-pay-calculation-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// 퇴직소득세 계산 결과 PDF 출력
export const exportRetirementTaxToPDF = (result: RetirementTaxResult) => {
  const doc = new jsPDF();
  addKoreanFont(doc);

  let yPosition = 20;

  // 제목
  doc.setFontSize(18);
  doc.text('Retirement Tax Calculation Report', 20, yPosition);
  yPosition += 20;

  // 기본 정보
  doc.setFontSize(12);
  doc.text('=== Basic Information ===', 20, yPosition);
  yPosition += 10;

  doc.text(`Retirement Amount: ${result.retirementAmount.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Working Years: ${result.workingYears} years`, 20, yPosition);
  yPosition += 8;
  doc.text(`Age: ${result.age} years old`, 20, yPosition);
  yPosition += 15;

  // 세금 계산 결과
  doc.text('=== Tax Calculation ===', 20, yPosition);
  yPosition += 10;

  doc.text(`Retirement Deduction: ${result.retirementDeduction.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Taxable Income: ${result.taxableIncome.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Converted Income: ${result.convertedIncome.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Tax Rate: ${result.taxRate}%`, 20, yPosition);
  yPosition += 8;
  doc.text(`Calculated Tax: ${result.calculatedTax.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Retirement Tax: ${result.retirementTax.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Local Tax: ${result.localTax.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Total Tax: ${result.totalTax.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Net Amount: ${result.netAmount.toLocaleString()} KRW`, 20, yPosition);
  yPosition += 8;
  doc.text(`Effective Rate: ${result.effectiveRate}`, 20, yPosition);
  yPosition += 15;

  // 생성일
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('ko-KR')}`, 20, yPosition);

  // 다운로드
  doc.save(`retirement-tax-calculation-${new Date().toISOString().split('T')[0]}.pdf`);
};

// 퇴직소득세 계산 결과 Excel 출력
export const exportRetirementTaxToExcel = (result: RetirementTaxResult) => {
  const data = [
    ['항목', '값'],
    ['퇴직급여액', `${result.retirementAmount.toLocaleString()}원`],
    ['근속연수', `${result.workingYears}년`],
    ['나이', `${result.age}세`],
    [''],
    ['=== 세금 계산 결과 ===', ''],
    ['퇴직소득공제', `${result.retirementDeduction.toLocaleString()}원`],
    ['과세표준', `${result.taxableIncome.toLocaleString()}원`],
    ['환산소득', `${result.convertedIncome.toLocaleString()}원`],
    ['세율', `${result.taxRate}%`],
    ['산출세액', `${result.calculatedTax.toLocaleString()}원`],
    ['퇴직소득세', `${result.retirementTax.toLocaleString()}원`],
    ['지방소득세', `${result.localTax.toLocaleString()}원`],
    ['총 세액', `${result.totalTax.toLocaleString()}원`],
    ['실수령액', `${result.netAmount.toLocaleString()}원`],
    ['실효세율', result.effectiveRate],
    [''],
    ['생성일', new Date().toLocaleDateString('ko-KR')]
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, '퇴직소득세계산');

  XLSX.writeFile(wb, `retirement-tax-calculation-${new Date().toISOString().split('T')[0]}.xlsx`);
};