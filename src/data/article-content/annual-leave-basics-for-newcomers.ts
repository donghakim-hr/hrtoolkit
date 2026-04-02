const content = `
<div class="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
  <p class="text-sm font-semibold text-blue-800 mb-2">📌 이 글에서 알 수 있는 것</p>
  <ul class="text-sm text-blue-700 space-y-1 list-none pl-0">
    <li>✓ 입사 첫 해 연차가 몇 개인지 계산하는 방법</li>
    <li>✓ 1년 이상 근속자의 연차가 몇 개인지 계산하는 방법</li>
    <li>✓ 연차를 잘못 계산했을 때 발생하는 법적 리스크</li>
  </ul>
</div>

<h2>먼저 이것부터: 연차는 두 가지로 나뉩니다</h2>
<p>연차를 처음 다루는 분들이 가장 많이 헷갈리는 부분이 바로 이것입니다. <strong>입사 1년 미만</strong>과 <strong>1년 이상</strong>은 계산 방식이 완전히 다릅니다.</p>

<div class="overflow-x-auto my-6">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="bg-gray-50">
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">구분</th>
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">대상</th>
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">발생 방식</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-gray-200 px-4 py-2.5 font-medium text-blue-700">월차형 연차</td>
        <td class="border border-gray-200 px-4 py-2.5 text-gray-600">입사 후 1년 미만</td>
        <td class="border border-gray-200 px-4 py-2.5 text-gray-600">매달 개근 시 1일씩 발생</td>
      </tr>
      <tr class="bg-gray-50">
        <td class="border border-gray-200 px-4 py-2.5 font-medium text-blue-700">연간 연차</td>
        <td class="border border-gray-200 px-4 py-2.5 text-gray-600">1년 이상 근속</td>
        <td class="border border-gray-200 px-4 py-2.5 text-gray-600">연 15일 기본 + 근속 가산</td>
      </tr>
    </tbody>
  </table>
</div>

<h2>Case 1. 입사 1년 미만 직원의 연차</h2>
<h3>기본 원리</h3>
<p>입사 후 <strong>1개월을 개근</strong>하면 <strong>1일의 유급휴가</strong>가 발생합니다. 최대 <strong>11개월 × 1일 = 11일</strong>이 발생 가능합니다.</p>

<div class="bg-violet-50 border-l-4 border-violet-400 rounded-r-lg p-4 my-4">
  <p class="text-xs font-semibold text-violet-600 mb-1">📋 근거 법령</p>
  <p class="text-sm text-violet-800">근로기준법 제60조 제2항 — "1년 미만인 근로자 또는 1년간 80% 미만 출근한 근로자에게 1개월 개근 시 1일의 유급휴가를 준다."</p>
</div>

<h3>계산 예시</h3>
<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  <div class="text-gray-400 text-xs mb-2">예시</div>
  입사일: 2025년 3월 1일<br/>
  기준일: 2025년 9월 1일 (6개월 경과)<br/>
  <br/>
  <span class="text-green-400">→ 연차 발생 = 6일</span> (3월~8월, 각 월 개근 시)
</div>

<h3>⚠️ 주의사항</h3>
<ul>
  <li><strong>개근의 기준</strong>: 해당 월에 1일이라도 결근하면 그달 연차는 발생하지 않습니다.</li>
  <li><strong>연차 사용 차감</strong>: 1년 미만 연차를 사용한 경우, 1년이 지나 발생하는 15일에서 차감됩니다 (근로기준법 제60조 제5항).</li>
  <li><strong>퇴직 시 미사용 연차</strong>: 퇴직 시 남은 연차는 연차수당으로 지급해야 합니다.</li>
</ul>

<h2>Case 2. 1년 이상 근속자의 연차</h2>
<h3>기본 원리</h3>
<p>1년 이상 근속하고, <strong>해당 연도에 80% 이상 출근</strong>한 근로자에게 <strong>15일의 연차</strong>가 부여됩니다.</p>

<div class="bg-violet-50 border-l-4 border-violet-400 rounded-r-lg p-4 my-4">
  <p class="text-xs font-semibold text-violet-600 mb-1">📋 근거 법령</p>
  <p class="text-sm text-violet-800">근로기준법 제60조 제1항</p>
</div>

<h3>근속 연수별 가산 연차</h3>
<p>3년 이상 근속한 경우, <strong>2년마다 1일</strong>이 추가됩니다. 최대 <strong>25일</strong>까지 가산됩니다.</p>

<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  가산 연차 = INT((근속연수 - 1) / 2)<br/>
  총 연차   = 15일 + 가산 연차  <span class="text-gray-400">(최대 25일)</span>
</div>

<div class="overflow-x-auto my-6">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="bg-gray-50">
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">근속연수</th>
        <th class="border border-gray-200 px-4 py-2.5 text-center font-semibold text-gray-700">기본</th>
        <th class="border border-gray-200 px-4 py-2.5 text-center font-semibold text-gray-700">가산</th>
        <th class="border border-gray-200 px-4 py-2.5 text-center font-semibold text-gray-700">총 연차</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">1년</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">15일</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">0일</td><td class="border border-gray-200 px-4 py-2.5 text-center font-bold text-blue-700">15일</td></tr>
      <tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-2.5 text-gray-600">3년</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">15일</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">1일</td><td class="border border-gray-200 px-4 py-2.5 text-center font-bold text-blue-700">16일</td></tr>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">5년</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">15일</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">2일</td><td class="border border-gray-200 px-4 py-2.5 text-center font-bold text-blue-700">17일</td></tr>
      <tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-2.5 text-gray-600">10년</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">15일</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">4일</td><td class="border border-gray-200 px-4 py-2.5 text-center font-bold text-blue-700">19일</td></tr>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">21년 이상</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">15일</td><td class="border border-gray-200 px-4 py-2.5 text-center text-gray-600">10일</td><td class="border border-gray-200 px-4 py-2.5 text-center font-bold text-blue-700">25일 (최대)</td></tr>
    </tbody>
  </table>
</div>

<h3>계산 예시</h3>
<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  입사일: 2020년 1월 1일<br/>
  기준일: 2026년 1월 1일 (6년 근속)<br/>
  <br/>
  가산 연차 = INT((6 - 1) / 2) = <span class="text-yellow-300">2일</span><br/>
  총 연차   = 15 + 2 = <span class="text-green-400">17일</span>
</div>

<h3>⚠️ 주의사항</h3>
<ul>
  <li><strong>80% 미만 출근 시</strong>: 연간 연차 15일이 아닌 1개월 개근 당 1일만 부여됩니다.</li>
  <li><strong>출근율 계산에 포함되는 것</strong>: 연차·병가·출산휴가·육아휴직 등 법정 휴가 기간은 출근으로 간주합니다.</li>
  <li><strong>연차 소멸 시효</strong>: 미사용 연차는 발생일로부터 <strong>1년</strong>이 지나면 소멸됩니다 (연차수당 청구권은 3년).</li>
</ul>

<h2>빠른 계산 공식 요약</h2>
<div class="bg-gray-900 text-gray-100 rounded-xl p-5 my-4 font-mono text-sm leading-relaxed">
  <div class="text-gray-400 text-xs mb-3">📌 공식 요약</div>
  <div class="mb-3">
    <span class="text-blue-300">1년 미만</span><br/>
    월별 연차 = 개근한 달 수 × 1일
  </div>
  <div class="mb-3">
    <span class="text-blue-300">1년 이상</span><br/>
    기본 연차 = 15일<br/>
    가산 연차 = INT((근속연수 - 1) / 2)  <span class="text-gray-400">← 최대 10일</span><br/>
    총 연차   = 기본 + 가산 <span class="text-gray-400">(최대 25일)</span>
  </div>
  <div>
    <span class="text-blue-300">출근율</span><br/>
    출근율(%) = (실제 출근일수 / 소정 근로일수) × 100
  </div>
</div>

<h2>신입 HR이 자주 하는 실수 TOP 3</h2>
<div class="space-y-3 my-4">
  <div class="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
    <span class="text-red-500 font-bold text-lg leading-none">1</span>
    <div>
      <p class="font-semibold text-red-800 text-sm">입사 1년 미만 월차를 별도 관리하지 않음</p>
      <p class="text-sm text-red-600 mt-0.5">→ 엑셀로 월별 개근 여부를 반드시 기록하세요.</p>
    </div>
  </div>
  <div class="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
    <span class="text-red-500 font-bold text-lg leading-none">2</span>
    <div>
      <p class="font-semibold text-red-800 text-sm">1년 미만 연차 사용분을 15일에서 미차감</p>
      <p class="text-sm text-red-600 mt-0.5">→ 1년이 되는 시점에 차감 처리가 누락되지 않도록 확인하세요.</p>
    </div>
  </div>
  <div class="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
    <span class="text-red-500 font-bold text-lg leading-none">3</span>
    <div>
      <p class="font-semibold text-red-800 text-sm">육아휴직 기간을 출근율 계산에서 제외</p>
      <p class="text-sm text-red-600 mt-0.5">→ 육아휴직은 출근으로 간주해야 합니다 (근로기준법 제60조 제6항).</p>
    </div>
  </div>
</div>

<h2>신입 HR을 위한 체크리스트</h2>
<div class="bg-green-50 border border-green-200 rounded-xl p-5 my-4">
  <ul class="space-y-2 list-none pl-0">
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>입사일 기준으로 연차 발생일을 캘린더에 표시해두기</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>1년 미만 직원은 월별 개근 여부 기록 유지</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>연차 사용 시 즉시 시스템 또는 대장에 기록</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>연도 말 미사용 연차 현황 파악 및 촉진 안내</li>
    <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>퇴직 예정자의 미사용 연차 수당 정산 확인</li>
  </ul>
</div>

<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-sm text-amber-800">
  <strong>💡 TIP</strong>: 연차 계산이 복잡하게 느껴진다면, 고용노동부 공식 사이트에서 제공하는 연차휴가 계산기를 활용해보세요. 단, 최종 판단은 반드시 근로기준법 조문을 함께 확인하세요.
</div>
`;

export default content;
