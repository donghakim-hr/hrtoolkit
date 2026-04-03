export const metadata = {
  title: '개인정보처리방침 | HR-Toolkit',
  description: 'HR-Toolkit 개인정보처리방침',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">개인정보처리방침</h1>

      <div className="prose prose-sm text-gray-700 space-y-8">

        <section>
          <h2 className="text-lg font-semibold mb-2">1. 수집하는 개인정보 항목</h2>
          <p>HR-Toolkit(이하 "사이트")은 서비스 제공을 위해 아래와 같은 개인정보를 수집합니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>1:1 문의: 이메일 주소, 문의 내용</li>
            <li>커뮤니티: 닉네임, 이메일 주소, 작성 내용</li>
            <li>자동 수집: 접속 IP, 쿠키, 방문 일시, 서비스 이용 기록</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">2. 개인정보 수집 및 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>서비스 제공 및 운영</li>
            <li>1:1 문의 응답</li>
            <li>커뮤니티 서비스 운영</li>
            <li>서비스 개선을 위한 통계 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">3. 개인정보 보유 및 이용 기간</h2>
          <p>수집된 개인정보는 서비스 이용 종료 시 또는 이용자의 삭제 요청 시 즉시 파기합니다.</p>
          <p className="mt-1">단, 관련 법령에 따라 아래 정보는 일정 기간 보존합니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>소비자 불만 또는 분쟁 처리 기록: 3년 (전자상거래법)</li>
            <li>접속 로그 기록: 3개월 (통신비밀보호법)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">4. 개인정보 제3자 제공</h2>
          <p>사이트는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 단, 이용자의 동의가 있거나 법령에 의한 경우는 예외로 합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">5. 쿠키 운용</h2>
          <p>사이트는 서비스 개선을 위해 쿠키를 사용합니다. 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>개인정보 열람 요청</li>
            <li>개인정보 정정·삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
          </ul>
          <p className="mt-2">문의: <a href="/inquiry" className="text-blue-600 underline">1:1 문의하기</a></p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">7. 개인정보 보호책임자</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>서비스명: HR-Toolkit</li>
            <li>문의: <a href="/inquiry" className="text-blue-600 underline">1:1 문의</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">8. 방침 변경</h2>
          <p>본 방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며, 변경 시 사이트 공지사항을 통해 안내합니다.</p>
          <p className="mt-2 text-gray-500 text-sm">시행일: 2026년 4월 3일</p>
        </section>

      </div>
    </main>
  )
}
