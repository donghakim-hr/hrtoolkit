const content = `
<div class="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
  <p class="text-sm font-semibold text-blue-800 mb-2">📌 이 글에서 알 수 있는 것</p>
  <ul class="text-sm text-blue-700 space-y-1 list-none pl-0">
    <li>✓ 근로계약서에 법적으로 반드시 포함해야 할 항목</li>
    <li>✓ 서면 계약서 미작성 시 처벌 수위</li>
    <li>✓ 유형별(정규직/계약직/단시간) 추가 주의사항</li>
    <li>✓ 실제 작성 시 자주 빠지는 항목 체크리스트</li>
  </ul>
</div>

<h2>근로계약서란?</h2>
<p>근로계약서는 사용자와 근로자 사이의 <strong>근로조건을 명시한 법적 문서</strong>입니다. 구두 계약은 효력은 있으나, <strong>서면 작성은 법적 의무</strong>입니다. 작성하지 않으면 처벌받습니다.</p>

<div class="bg-violet-50 border-l-4 border-violet-400 rounded-r-lg p-4 my-4">
  <p class="text-xs font-semibold text-violet-600 mb-1">📋 근거 법령</p>
  <p class="text-sm text-violet-800">근로기준법 제17조 — "사용자는 근로계약을 체결할 때 근로자에게 임금, 소정근로시간, 휴일, 연차유급휴가 등 대통령령으로 정하는 근로조건을 명시하여야 한다."</p>
</div>

<h2>법정 필수 기재 항목 10가지</h2>

<div class="space-y-4 my-6">

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">임금 (급여)</h3>
    </div>
    <div class="p-4">
      <p class="text-sm text-gray-600 mb-3">단순히 금액만 쓰면 안 됩니다. 구성 항목까지 명시해야 합니다.</p>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-green-50 rounded-lg p-3">
          <p class="text-xs font-bold text-green-700 mb-1">✅ 올바른 예시</p>
          <p class="text-xs text-green-800 font-mono leading-relaxed">기본급: 월 2,500,000원<br/>식대: 월 100,000원<br/>합계: 2,600,000원<br/>지급일: 매월 25일</p>
        </div>
        <div class="bg-red-50 rounded-lg p-3">
          <p class="text-xs font-bold text-red-700 mb-1">❌ 잘못된 예시</p>
          <p class="text-xs text-red-800 font-mono leading-relaxed">급여: 월 2,600,000원<br/>(항목 구분 없음)</p>
        </div>
      </div>
    </div>
  </div>

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">소정근로시간</h3>
    </div>
    <div class="p-4">
      <p class="text-sm text-gray-600 mb-2">하루, 주간 단위로 명시해야 합니다.</p>
      <div class="bg-green-50 rounded-lg p-3 text-xs text-green-800 font-mono">소정근로시간: 1일 8시간, 주 40시간<br/>근무 시간: 09:00 ~ 18:00 (휴게 1시간 포함)</div>
    </div>
  </div>

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">휴일</h3>
    </div>
    <div class="p-4">
      <p class="text-sm text-gray-600 mb-2">주휴일과 공휴일을 명확히 기재합니다.</p>
      <div class="bg-green-50 rounded-lg p-3 text-xs text-green-800 font-mono mb-3">주휴일: 매주 일요일<br/>관공서 공휴일에 관한 규정에 따른 공휴일</div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800">
        ⚠️ 2022년부터 5인 이상 사업장은 관공서 공휴일을 <strong>유급 휴일</strong>로 보장해야 합니다.
      </div>
    </div>
  </div>

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">4</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">연차유급휴가</h3>
    </div>
    <div class="p-4">
      <p class="text-sm text-gray-600 mb-2">연차 일수와 사용 방식을 기재합니다.</p>
      <div class="bg-green-50 rounded-lg p-3 text-xs text-green-800 font-mono">입사 후 1년 미만: 1개월 개근 시 1일 발생 (최대 11일)<br/>1년 이상: 근로기준법 제60조에 따라 부여</div>
    </div>
  </div>

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">5</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">취업 장소</h3>
    </div>
    <div class="p-4">
      <div class="bg-green-50 rounded-lg p-3 text-xs text-green-800 font-mono mb-3">취업 장소: 서울특별시 강남구 OO로 OO (본사)<br/>단, 업무상 필요 시 변경될 수 있음</div>
      <p class="text-xs text-gray-500">⚠️ 명시된 장소 외 근무를 요청할 경우, 근로자 동의가 필요합니다.</p>
    </div>
  </div>

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">6</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">업무 내용 (직종)</h3>
    </div>
    <div class="p-4">
      <div class="bg-green-50 rounded-lg p-3 text-xs text-green-800 font-mono">직종: 인사총무<br/>담당 업무: 채용, 급여 관리, 4대보험 처리 등</div>
    </div>
  </div>

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">7</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">근로계약 기간</h3>
    </div>
    <div class="p-4">
      <div class="overflow-x-auto">
        <table class="w-full text-xs border-collapse mb-3">
          <thead><tr class="bg-gray-50"><th class="border border-gray-200 px-3 py-2 text-left">고용 유형</th><th class="border border-gray-200 px-3 py-2 text-left">기재 방법</th></tr></thead>
          <tbody>
            <tr><td class="border border-gray-200 px-3 py-2 text-gray-600">정규직</td><td class="border border-gray-200 px-3 py-2 text-gray-600">기간의 정함이 없는 근로계약</td></tr>
            <tr class="bg-gray-50"><td class="border border-gray-200 px-3 py-2 text-gray-600">계약직</td><td class="border border-gray-200 px-3 py-2 text-gray-600">2026년 4월 1일 ~ 2027년 3월 31일 (1년)</td></tr>
          </tbody>
        </table>
      </div>
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800">
        ⚠️ 계약기간이 2년을 초과하면 <strong>무기계약직 전환 의무</strong>가 발생합니다.
      </div>
    </div>
  </div>

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">8</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">사회보험 가입 여부</h3>
    </div>
    <div class="p-4">
      <div class="bg-green-50 rounded-lg p-3 text-xs text-green-800 font-mono">4대보험(국민연금, 건강보험, 고용보험, 산재보험) 가입</div>
    </div>
  </div>

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">9</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">퇴직급여 관련 사항</h3>
    </div>
    <div class="p-4">
      <div class="bg-green-50 rounded-lg p-3 text-xs text-green-800 font-mono">퇴직급여: 근로자퇴직급여 보장법에 따라 지급<br/>퇴직연금제도 유형: DC형 (확정기여형)</div>
    </div>
  </div>

  <div class="border border-gray-200 rounded-xl overflow-hidden">
    <div class="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-200">
      <span class="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">10</span>
      <h3 class="font-semibold text-gray-800 text-base m-0">서명 및 교부</h3>
    </div>
    <div class="p-4">
      <p class="text-sm text-gray-600 mb-2">근로계약서는 <strong>2부 작성 후 각 1부씩 보관</strong>해야 합니다.</p>
      <div class="bg-green-50 rounded-lg p-3 text-xs text-green-800 space-y-1">
        <p>1. 근로자와 사용자 모두 서명 또는 날인</p>
        <p>2. 사본 1부를 근로자에게 즉시 교부</p>
        <p>3. 원본 1부를 회사에 보관 (3년간 보존 의무)</p>
      </div>
    </div>
  </div>

</div>

<h2>고용 유형별 추가 체크사항</h2>
<div class="space-y-4 my-4">
  <div class="bg-gray-50 rounded-xl p-4">
    <p class="text-sm font-semibold text-gray-800 mb-2">📄 계약직 (기간제)</p>
    <ul class="text-sm text-gray-600 space-y-1 list-disc pl-4">
      <li>계약 기간 명시 (최대 2년, 초과 시 무기계약직 전환)</li>
      <li>계약 갱신 조건 또는 자동 만료 조건 기재</li>
      <li>갱신 기대권 유발 표현 주의 ("갱신 가능성 있음" 등)</li>
    </ul>
  </div>
  <div class="bg-gray-50 rounded-xl p-4">
    <p class="text-sm font-semibold text-gray-800 mb-2">⏱️ 단시간 근로자 (파트타임)</p>
    <ul class="text-sm text-gray-600 space-y-1 list-disc pl-4">
      <li>시간급 또는 일급 명시</li>
      <li>초과근무 동의 조항 별도 기재 필수 (미기재 시 초과 근무 요청 불가)</li>
      <li>주휴수당 지급 여부 (주 15시간 이상 근무 시 발생)</li>
    </ul>
  </div>
  <div class="bg-gray-50 rounded-xl p-4">
    <p class="text-sm font-semibold text-gray-800 mb-2">🔰 수습 기간이 있는 경우</p>
    <ul class="text-sm text-gray-600 space-y-1 list-disc pl-4">
      <li>수습 기간 명시 (통상 3개월)</li>
      <li>수습 기간 중 임금 감액 여부 (최저임금의 90%까지 가능)</li>
      <li>수습 종료 후 본 채용 조건 기재</li>
    </ul>
  </div>
</div>

<h2>근로계약서 미작성 시 처벌</h2>
<div class="overflow-x-auto my-4">
  <table class="w-full text-sm border-collapse">
    <thead>
      <tr class="bg-gray-50">
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">위반 내용</th>
        <th class="border border-gray-200 px-4 py-2.5 text-left font-semibold text-gray-700">처벌</th>
      </tr>
    </thead>
    <tbody>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">서면 계약서 미작성</td><td class="border border-gray-200 px-4 py-2.5 font-semibold text-red-600">500만 원 이하 벌금</td></tr>
      <tr class="bg-gray-50"><td class="border border-gray-200 px-4 py-2.5 text-gray-600">계약서 미교부</td><td class="border border-gray-200 px-4 py-2.5 font-semibold text-red-600">동일 처벌</td></tr>
      <tr><td class="border border-gray-200 px-4 py-2.5 text-gray-600">명시 사항 누락</td><td class="border border-gray-200 px-4 py-2.5 font-semibold text-orange-600">500만 원 이하 과태료</td></tr>
    </tbody>
  </table>
</div>

<h2>신입 HR을 위한 최종 체크리스트</h2>
<div class="space-y-3 my-4">
  <div class="bg-green-50 border border-green-200 rounded-xl p-4">
    <p class="text-xs font-bold text-green-700 mb-2">계약서 작성 전</p>
    <ul class="space-y-1.5 list-none pl-0">
      <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>고용 유형 확인 (정규직 / 계약직 / 단시간)</li>
      <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>임금 항목 구체적으로 확정</li>
      <li class="flex items-center gap-2 text-sm text-green-800"><span class="w-4 h-4 border-2 border-green-400 rounded inline-block flex-shrink-0"></span>근무 시간, 장소, 업무 내용 확정</li>
    </ul>
  </div>
  <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
    <p class="text-xs font-bold text-blue-700 mb-2">계약서 작성 시</p>
    <ul class="space-y-1.5 list-none pl-0">
      <li class="flex items-center gap-2 text-sm text-blue-800"><span class="w-4 h-4 border-2 border-blue-400 rounded inline-block flex-shrink-0"></span>10가지 필수 항목 모두 포함 여부 확인</li>
      <li class="flex items-center gap-2 text-sm text-blue-800"><span class="w-4 h-4 border-2 border-blue-400 rounded inline-block flex-shrink-0"></span>임금 구성 항목 세분화 기재</li>
      <li class="flex items-center gap-2 text-sm text-blue-800"><span class="w-4 h-4 border-2 border-blue-400 rounded inline-block flex-shrink-0"></span>2부 작성 및 쌍방 서명</li>
    </ul>
  </div>
  <div class="bg-purple-50 border border-purple-200 rounded-xl p-4">
    <p class="text-xs font-bold text-purple-700 mb-2">계약서 작성 후</p>
    <ul class="space-y-1.5 list-none pl-0">
      <li class="flex items-center gap-2 text-sm text-purple-800"><span class="w-4 h-4 border-2 border-purple-400 rounded inline-block flex-shrink-0"></span>근로자에게 1부 즉시 교부</li>
      <li class="flex items-center gap-2 text-sm text-purple-800"><span class="w-4 h-4 border-2 border-purple-400 rounded inline-block flex-shrink-0"></span>사본을 3년간 보관할 폴더에 보관</li>
      <li class="flex items-center gap-2 text-sm text-purple-800"><span class="w-4 h-4 border-2 border-purple-400 rounded inline-block flex-shrink-0"></span>4대보험 취득 신고 (취득일로부터 14일 이내)</li>
    </ul>
  </div>
</div>

<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-sm text-amber-800">
  <strong>💡 TIP</strong>: 고용노동부 홈페이지(moel.go.kr)에서 <strong>표준근로계약서 양식</strong>을 무료로 다운로드할 수 있습니다. 정규직·계약직·단시간 근로자용 양식이 모두 구비되어 있으니 참고하세요.
</div>
`;

export default content;
