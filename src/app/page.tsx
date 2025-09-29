import Link from "next/link";
import { Calculator, FileText, DollarSign, Search, HelpCircle, Briefcase } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Calculator,
      title: "연차 산정 계산기",
      description: "입사일과 회계연도를 기준으로 정확한 연차를 계산합니다",
      href: "/annual-leave",
      color: "bg-blue-500"
    },
    {
      icon: DollarSign,
      title: "퇴직급여 계산기",
      description: "근속기간과 평균임금을 기준으로 퇴직급여를 산정합니다",
      href: "/retirement-pay",
      color: "bg-green-500"
    },
    {
      icon: FileText,
      title: "퇴직소득세 계산기",
      description: "퇴직급여에 따른 세금과 실수령액을 확인합니다",
      href: "/retirement-tax",
      color: "bg-purple-500"
    },
    {
      icon: Search,
      title: "법령 조문 검색",
      description: "근로기준법, 고용노동부 지침 등 관련 법령을 검색합니다",
      href: "/legal-search",
      color: "bg-orange-500"
    },
    {
      icon: HelpCircle,
      title: "자주 묻는 질문",
      description: "HR 업무 중 자주 발생하는 질문과 답변을 확인합니다",
      href: "/faq",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">HR-Toolkit</h1>
            </div>
            <p className="text-sm text-black hidden sm:block">
              HR 신입을 위한 필수 계산 도구
            </p>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            HR 업무가
            <span className="text-blue-600"> 쉬워집니다</span>
          </h1>
          <p className="mt-4 text-xl text-black max-w-2xl mx-auto">
            복잡한 연차 계산부터 퇴직급여까지, HR 신입이 자주 헷갈리는 계산을
            간편하게 해결하세요
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  href={feature.href}
                  className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300 p-6"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`${feature.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-black mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Briefcase className="h-6 w-6" />
              <span className="text-lg font-semibold">HR-Toolkit</span>
            </div>
            <p className="text-black text-sm">
              © 2024 HR-Toolkit. 모든 계산은 관련 법령에 근거합니다.
            </p>
            <p className="text-black text-xs mt-2">
              ⚠️ 본 도구의 계산 결과는 참고용이며, 정확한 업무 처리를 위해서는 관련 법령을 반드시 확인하시기 바랍니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}