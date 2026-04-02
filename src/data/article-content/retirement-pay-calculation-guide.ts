const content = `
<div class="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
  <p class="text-sm font-semibold text-blue-800 mb-2">📌 이 글에서 알 수 있는 것</p>
  <ul class="text-sm text-blue-700 space-y-1 list-none pl-0">
    <li>✓ 퇴직금이 발생하는 조건</li>
    <li>✓ 평균임금 계산 방법</li>
    <li>✓ 퇴직금 최종 금액 산출 방법</li>
    <li>✓ 지급 기한과 미지급 시 법적 리스크</li>
  </ul>
</div>

<h2>퇴직금이란?</h2>
<p>퇴직금은 <strong>1년 이상 근속한 근로자</strong>가 퇴직할 때 사용자가 지급해야 하는 <strong>법정 의무 급여</strong>입니다. "고마워서 드리는 것"이 아니라, 반드시 지급해야 하는 법적 권리입니다.</p>

<div class="bg-violet-50 border-l-4 border-violet-400 rounded-r-lg p-4 my-4">
  <p class="text-xs font-semibold text-violet-600 mb-1">📋 근거 법령</p>
  <p class="text-sm text-violet-800">근로자퇴직급여 보장법 제8조 제1항 — "사용자는 퇴직하는 근로자에게 계속근로기간 1년에 대하여 30일분 이상의 평균임금을 퇴직금으로 지급하여야 한다."</p>
</div>

<h2>Step 1. 퇴직금 발생 요건 확인</h2>
<p>퇴직금을 계산하기 전에, 해당 직원이 퇴직금 지급 대상인지 먼저 확인하세요.</p>

<div class="overflow-x-auto my-6">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="bg-gray-50">
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">요건</th>
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">기준</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">계속근로기간</td><td class="border border-gray-200 px-4 py-2.5 font-semibold text-gray-800">1년 이상</td></tr>
      <tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-2.5 text-gray-600">소정근로시간</td><td class="border border-gray-200 px-4 py-2.5 font-semibold text-gray-800">주 15시간 이상</td></tr>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">고용 형태</td><td class="border border-gray-200 px-4 py-2.5 text-gray-600">정규직·계약직·아르바이트 무관 (요건 충족 시 모두 해당)</td></tr>
    </tbody>
  </table>
</div>

<div class="bg-gray-50 rounded-xl p-5 my-4 space-y-3">
  <div>
    <p class="text-sm font-semibold text-gray-700">Q. 계약직도 퇴직금을 받나요?</p>
    <p class="text-sm text-gray-600 mt-1">A. 네. 고용 형태와 관계없이 1년 이상, 주 15시간 이상 근무했다면 퇴직금이 발생합니다.</p>
  </div>
  <div>
    <p class="text-sm font-semibold text-gray-700">Q. 육아휴직 기간도 근속기간에 포함되나요?</p>
    <p class="text-sm text-gray-600 mt-1">A. 포함됩니다. 단, 평균임금 계산 시에는 제외 기간으로 처리합니다.</p>
  </div>
</div>

<h2>Step 2. 평균임금 계산하기</h2>
<h3>평균임금이란?</h3>
<p>퇴직 전 <strong>3개월간 받은 임금의 일평균액</strong>입니다. 퇴직금 계산의 핵심이 되는 수치입니다.</p>

<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  <div class="text-gray-400 text-xs mb-2">공식</div>
  평균임금 = <span class="text-yellow-300">퇴직 전 3개월간 총 임금</span><br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;────────────────────────<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-yellow-300">퇴직 전 3개월간 총 일수</span>
</div>

<h3>총 임금에 포함되는 항목</h3>
<div class="grid grid-cols-2 gap-4 my-4">
  <div class="bg-green-50 border border-green-200 rounded-xl p-4">
    <p class="text-xs font-bold text-green-700 mb-2">포함 ✅</p>
    <ul class="text-sm text-green-800 space-y-1 list-none pl-0">
      <li>기본급</li>
      <li>각종 수당 (직책수당, 식대, 교통비 등)</li>
      <li>상여금 (연간 상여의 3/12)</li>
      <li>연장·야간·휴일 근로수당</li>
    </ul>
  </div>
  <div class="bg-red-50 border border-red-200 rounded-xl p-4">
    <p class="text-xs font-bold text-red-700 mb-2">제외 ❌</p>
    <ul class="text-sm text-red-800 space-y-1 list-none pl-0">
      <li>결혼축하금, 조의금 등 일시금</li>
      <li>실비 변상적 성격의 비용</li>
      <li>퇴직금 자체</li>
    </ul>
  </div>
</div>

<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4 text-sm text-amber-800">
  <strong>💡 포인트</strong>: 상여금은 연간 지급액의 <strong>3개월치 비율(3/12)</strong>만 평균임금에 포함합니다.
</div>

<h3>계산 예시</h3>
<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  퇴직일: 2026년 3월 31일<br/>
  3개월 기간: 2026년 1월 1일 ~ 3월 31일 (90일)<br/>
  <br/>
  월 기본급: 300만 원<br/>
  월 식대:    10만 원<br/>
  연간 상여: 300만 원<br/>
  <br/>
  3개월 총 임금 = (300 + 10) × 3 + 300 × (3/12)<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= 930 + 75 = <span class="text-yellow-300">1,005만 원</span><br/>
  <br/>
  평균임금 = 1,005만 원 ÷ 90일 = <span class="text-green-400">111,667원/일</span>
</div>

<h2>Step 3. 퇴직금 최종 계산</h2>
<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  <div class="text-gray-400 text-xs mb-2">공식</div>
  퇴직금 = 평균임금 × 30일 × (계속근로기간 / 365일)
</div>

<h3>계산 예시</h3>
<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  평균임금: 111,667원/일<br/>
  근속기간: 2024년 1월 1일 ~ 2026년 3월 31일 = 821일<br/>
  <br/>
  퇴직금 = 111,667 × 30 × (821 / 365)<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= 3,350,010 × 2.249...<br/>
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;≈ <span class="text-green-400">7,532,000원</span>
</div>

<h2>퇴직금 지급 기한</h2>
<div class="overflow-x-auto my-6">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="bg-gray-50">
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">항목</th>
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">기준</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">지급 기한</td><td class="border border-gray-200 px-4 py-2.5 font-bold text-gray-800">퇴직일로부터 14일 이내</td></tr>
      <tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-2.5 text-gray-600">합의에 의한 연장</td><td class="border border-gray-200 px-4 py-2.5 text-gray-600">당사자 간 합의 시 기한 연장 가능</td></tr>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">미지급 시</td><td class="border border-gray-200 px-4 py-2.5 text-red-600 font-semibold">연 20%의 지연이자 발생</td></tr>
      <tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-2.5 text-gray-600">형사 처벌</td><td class="border border-gray-200 px-4 py-2.5 text-red-600 font-semibold">3년 이하 징역 또는 3천만 원 이하 벌금</td></tr>
    </tbody>
  </table>
</div>

<h2>신입 HR이 자주 하는 실수 TOP 3</h2>
<div class="space-y-3 my-4">
  <div class="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
    <span class="text-red-500 font-bold text-lg leading-none">1</span>
    <div>
      <p class="font-semibold text-red-800 text-sm">상여금 포함 계산을 빠뜨림</p>
      <p class="text-sm text-red-600 mt-0.5">→ 연간 상여금의 3/12을 평균임금에 포함하는 것을 잊지 마세요.</p>
    </div>
  </div>
  <div class="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
    <span class="text-red-500 font-bold text-lg leading-none">2</span>
    <div>
      <p class="font-semibold text-red-800 text-sm">육아휴직 기간 처리 오류</p>
      <p class="text-sm text-red-600 mt-0.5">→ 근속기간엔 포함, 평균임금 계산 기간에서는 제외해야 합니다.</p>
    </div>
  </div>
  <div class="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
    <span class="text-red-500 font-bold text-lg leading-none">3</span>
    <div>
      <p class="font-semibold text-red-800 text-sm">통상임금 vs 평균임금 혼동</p>
      <p class="text-sm text-red-600 mt-0.5">→ 평균임금이 통상임금보다 낮을 때는 통상임금 기준으로 계산해야 합니다.</p>
    </div>
  </div>
</div>

<h2>신입 HR을 위한 체크리스트</h2>
<div class="bg-green-50 border border-green-200 rounded-xl p-5 my-4">
  <ul class="space-y-2 list-none pl-0">
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>퇴직 예정자의 입사일·퇴직일 정확히 확인</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>최근 3개월 급여 명세서 수집 (상여금 포함 여부 확인)</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>평균임금 vs 통상임금 비교 후 높은 쪽 적용</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>퇴직일 기준 14일 이내 지급 일정 수립</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>DC형/DB형 퇴직연금 가입 여부 확인 (가입 시 별도 정산)</li>
  </ul>
</div>

<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-sm text-amber-800">
  <strong>💡 TIP</strong>: 퇴직연금(DC형·DB형)에 가입한 회사라면 퇴직금 정산 방식이 다릅니다. 퇴직연금 유형을 먼저 확인하고, 각 유형에 맞는 절차를 별도로 학습하세요.
</div>
`;

export default content;
