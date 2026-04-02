const content = `
<div class="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
  <p class="text-sm font-semibold text-blue-800 mb-2">📌 이 글에서 알 수 있는 것</p>
  <ul class="text-sm text-blue-700 space-y-1 list-none pl-0">
    <li>✓ 2026년 최저임금 기준</li>
    <li>✓ 월급제·시급제별 최저임금 위반 여부 확인법</li>
    <li>✓ 최저임금에 산입되는 임금과 제외되는 임금</li>
    <li>✓ 위반 시 처벌 수위</li>
  </ul>
</div>

<h2>2026년 최저임금 한눈에 보기</h2>
<div class="grid grid-cols-3 gap-4 my-6">
  <div class="bg-blue-600 text-white rounded-xl p-5 text-center">
    <p class="text-xs font-medium text-blue-200 mb-1">시간급</p>
    <p class="text-2xl font-bold">10,320<span class="text-lg">원</span></p>
  </div>
  <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
    <p class="text-xs font-medium text-blue-400 mb-1">일급 (8시간)</p>
    <p class="text-xl font-bold text-blue-800">82,560원</p>
  </div>
  <div class="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
    <p class="text-xs font-medium text-blue-400 mb-1">월급 (209시간)</p>
    <p class="text-xl font-bold text-blue-800">2,156,880원</p>
  </div>
</div>

<div class="bg-violet-50 border-l-4 border-violet-400 rounded-r-lg p-4 my-4">
  <p class="text-xs font-semibold text-violet-600 mb-1">📋 근거 법령</p>
  <p class="text-sm text-violet-800">최저임금법 제8조, 2026년 최저임금 고시 (2025년 8월 고시)</p>
</div>

<div class="bg-gray-50 rounded-xl p-4 my-4 text-sm text-gray-600">
  <strong>💡 209시간이란?</strong><br/>
  주 40시간 근무 + 주휴시간(8시간) = 주 48시간<br/>
  월 환산 = 48시간 × (365일 / 7일 / 12개월) ≈ 209시간
</div>

<h2>Step 1. 우리 직원의 시급 환산하기</h2>
<p>최저임금 위반 여부는 <strong>시급</strong>으로 환산해서 비교해야 합니다.</p>

<h3>월급제 직원의 시급 환산</h3>
<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  환산 시급 = 월 임금 총액 ÷ 월 소정근로시간<br/>
  <br/>
  <span class="text-gray-400">월 소정근로시간 (주 40시간, 주휴 포함):</span><br/>
  주 48시간 × (365 ÷ 7 ÷ 12) = 약 <span class="text-yellow-300">209시간</span>
</div>

<h3>계산 예시</h3>
<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  월급: 2,200,000원<br/>
  근무 형태: 주 40시간, 월 209시간<br/>
  <br/>
  환산 시급 = 2,200,000 ÷ 209 = <span class="text-yellow-300">10,526원</span><br/>
  최저임금 = 10,320원<br/>
  <br/>
  <span class="text-green-400">→ 10,526원 &gt; 10,320원 ✅ 위반 아님</span>
</div>

<h2>Step 2. 최저임금 산입 여부 확인하기</h2>
<p>모든 임금이 최저임금 비교 대상이 되지는 않습니다.</p>

<div class="grid grid-cols-2 gap-4 my-4">
  <div class="bg-green-50 border border-green-200 rounded-xl p-4">
    <p class="text-xs font-bold text-green-700 mb-2">산입 항목 ✅</p>
    <ul class="text-sm text-green-800 space-y-1 list-none pl-0">
      <li>기본급</li>
      <li>직무수당, 직책수당</li>
      <li>매월 1회 이상 정기 지급 수당</li>
    </ul>
  </div>
  <div class="bg-red-50 border border-red-200 rounded-xl p-4">
    <p class="text-xs font-bold text-red-700 mb-2">제외 항목 ❌</p>
    <ul class="text-sm text-red-800 space-y-1 list-none pl-0">
      <li>연장·야간·휴일 근로수당</li>
      <li>상여금 중 月 환산 15% 초과분</li>
      <li>식대·교통비 중 月 환산 3% 초과분</li>
      <li>가족수당, 근속수당 (비정기)</li>
    </ul>
  </div>
</div>

<h3>산입 범위를 적용한 비교 예시</h3>
<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  기본급: 1,800,000원<br/>
  식대:     200,000원 (매월 지급)<br/>
  교통비:   100,000원 (매월 지급)<br/>
  연장수당: 300,000원<br/>
  <br/>
  식대 산입 한도: 2,156,880 × 3% = <span class="text-yellow-300">64,706원</span><br/>
  <span class="text-gray-400">→ 식대 중 64,706원만 산입 (나머지 제외)</span><br/>
  <span class="text-gray-400">→ 교통비: 한도 초과로 전액 제외</span><br/>
  <span class="text-gray-400">→ 연장수당: 전액 제외</span><br/>
  <br/>
  최저임금 비교 대상 임금 = 1,800,000 + 64,706 = <span class="text-yellow-300">1,864,706원</span><br/>
  환산 시급 = 1,864,706 ÷ 209 = <span class="text-red-400">8,921원</span><br/>
  <br/>
  <span class="text-red-400">→ 8,921원 &lt; 10,320원 ❌ 최저임금 위반!</span>
</div>

<h2>최저임금 위반 시 처벌</h2>
<div class="overflow-x-auto my-6">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="bg-gray-50">
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">위반 내용</th>
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">처벌</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">최저임금 미달 지급</td><td class="border border-gray-200 px-4 py-2.5 font-semibold text-red-600">3년 이하 징역 또는 2천만 원 이하 벌금</td></tr>
      <tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-2.5 text-gray-600">최저임금 주지 의무 위반</td><td class="border border-gray-200 px-4 py-2.5 font-semibold text-orange-600">100만 원 이하 과태료</td></tr>
    </tbody>
  </table>
</div>

<h2>수습 기간 중 최저임금 감액</h2>
<div class="overflow-x-auto my-6">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="bg-gray-50">
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">조건</th>
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">기준</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">대상</td><td class="border border-gray-200 px-4 py-2.5 text-gray-600">수습 기간 중인 근로자</td></tr>
      <tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-2.5 text-gray-600">적용 기간</td><td class="border border-gray-200 px-4 py-2.5 font-semibold text-gray-800">수습 시작 후 3개월 이내</td></tr>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">감액 한도</td><td class="border border-gray-200 px-4 py-2.5 font-semibold text-gray-800">최저임금의 90%</td></tr>
      <tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-2.5 text-gray-600">예외</td><td class="border border-gray-200 px-4 py-2.5 text-red-600">단순 노무 직종은 감액 불가</td></tr>
    </tbody>
  </table>
</div>

<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  2026년 수습 기간 최저 시급 = 10,320원 × 90% = <span class="text-green-400">9,288원</span><br/>
  수습 기간 최저 월급 = 2,156,880원 × 90% = <span class="text-green-400">1,941,192원</span>
</div>

<h2>신입 HR을 위한 체크리스트</h2>
<div class="bg-green-50 border border-green-200 rounded-xl p-5 my-4">
  <ul class="space-y-2 list-none pl-0">
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>전체 직원의 시급 환산값 계산 및 기록</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>최저임금 산입 항목 정확히 구분 (식대·교통비 한도 확인)</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>최저임금 고지 의무 이행 (취업규칙 또는 임금 명세서에 기재)</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>수습 기간 직원의 감액 요건 충족 여부 확인</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>매년 8월 최저임금 고시 후 다음 연도 기준으로 급여 재검토</li>
  </ul>
</div>

<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-sm text-amber-800">
  <strong>💡 TIP</strong>: 최저임금은 매년 8월 5일경 다음 해 기준이 고시됩니다. 달력에 미리 표시해두고, 해당 시점에 전 직원 급여를 재검토하는 루틴을 만들어두세요.
</div>
`;

export default content;
