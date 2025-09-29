# HR-Toolkit

HR 신입을 위한 필수 계산 도구 웹사이트

## 📋 프로젝트 소개

HR-Toolkit은 인사팀 신입 직원들이 자주 헷갈리거나 계산하기 어려운 업무들을 간편하게 처리할 수 있도록 도와주는 웹 애플리케이션입니다.

### 🎯 주요 기능

1. **연차 산정 계산기** - 입사일과 회계연도를 기준으로 정확한 연차 산정
2. **퇴직급여 계산기** - 근속기간과 평균임금을 기준으로 퇴직급여 산정
3. **퇴직소득세 계산기** - 퇴직급여에 따른 세금과 실수령액 계산
4. **법령 조문 검색** - 근로기준법, 고용노동부 지침 등 관련 법령 검색
5. **자주 묻는 질문** - HR 업무 중 자주 발생하는 질문과 답변

### 🛠 기술 스택

- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React
- **Development**: ESLint, Turbopack

## 🚀 설치 및 실행

### 필수 요구사항

- Node.js 16 이상
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone [repository-url]
cd hr-toolkit

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 으로 접속하여 확인할 수 있습니다.

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 린팅
npm run lint
```

## 📁 프로젝트 구조

```
hr-toolkit/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── annual-leave/       # 연차 산정 계산기
│   │   ├── retirement-pay/     # 퇴직급여 계산기
│   │   ├── retirement-tax/     # 퇴직소득세 계산기
│   │   ├── legal-search/       # 법령 조문 검색
│   │   ├── faq/               # 자주 묻는 질문
│   │   ├── layout.tsx         # 레이아웃 컴포넌트
│   │   └── page.tsx           # 메인 홈페이지
│   ├── data/                  # 정적 데이터
│   │   └── legal-articles.json # 법령 조문 데이터
│   └── types/                 # TypeScript 타입 정의
│       └── index.ts
├── public/                    # 정적 파일
├── tailwind.config.js        # Tailwind CSS 설정
├── tsconfig.json             # TypeScript 설정
└── package.json              # 프로젝트 의존성
```

## ⚡ 주요 계산 로직

### 연차 계산
- 1년 이상 근속: 15일 + 가산연차(3년 이상, 2년마다 1일씩 최대 25일)
- 1년 미만 근속: 매월 1일씩 부여
- 근로기준법 제60조 기준

### 퇴직급여 계산
- 퇴직금 = 평균임금 × 30일 × 근속연수
- 평균임금 = 퇴직일 이전 3개월간 임금총액 ÷ 총일수
- 근로자퇴직급여보장법 제8조 기준

### 퇴직소득세 계산
- 퇴직소득공제 → 과세표준 → 환산소득 → 세액계산
- 2024년 소득세법 기준 적용
- 20% 감면 적용

## 📚 법령 데이터

현재 수록된 법령:
- 근로기준법 (법률 제18469호)
- 근로기준법 시행령 (대통령령 제32412호)
- 남녀고용평등과일가정양립지원에관한법률 (법률 제18063호)
- 고용노동부 지침 (고용노동부 예규)

## ⚠️ 중요 안내사항

- 본 도구의 계산 결과는 **참고용**입니다
- 정확한 업무 처리를 위해서는 관련 법령을 반드시 확인하시기 바랍니다
- 개별 사안의 특수성이나 최신 법령 개정사항이 반영되지 않을 수 있습니다
- 구체적인 사안에 대해서는 관련 전문가나 관계 기관에 문의하세요

## 🔗 관련 링크

- [국가법령정보센터](https://www.law.go.kr) - 최신 법령 정보
- [고용노동부](https://www.moel.go.kr) - 근로조건, 고용정책 관련
- [근로복지공단](https://www.comwel.or.kr) - 산재보험, 고용보험 관련
- 고용노동부 상담센터: **1350**

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트 관련 문의사항이나 버그 리포트는 Issues를 통해 남겨주세요.

---

**HR-Toolkit** - HR 업무가 쉬워집니다 ✨
