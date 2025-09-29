"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Clock, Users, DollarSign, Calendar } from "lucide-react";

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      category: "연차 관련",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      items: [
        {
          question: "신입사원도 연차를 받을 수 있나요?",
          answer: "네, 가능합니다. 1년 미만 근로자는 매월 개근 시 1일의 유급휴가를 받을 수 있습니다. 예를 들어 3개월 개근하면 3일의 연차가 발생합니다.",
          legal: "근로기준법 제60조 제3항"
        },
        {
          question: "연차 사용 시기를 회사에서 정할 수 있나요?",
          answer: "원칙적으로 근로자가 청구한 시기에 연차를 주어야 합니다. 다만, 사업 운영에 막대한 지장이 있는 경우에만 회사가 시기를 변경할 수 있습니다.",
          legal: "근로기준법 제60조 제4항"
        },
        {
          question: "사용하지 않은 연차는 어떻게 되나요?",
          answer: "사용하지 않은 연차는 다음 해로 이월됩니다. 다만, 이월된 연차는 2년 내에 사용해야 하며, 그렇지 않으면 소멸됩니다. 회사는 미사용 연차에 대해 수당을 지급해야 합니다.",
          legal: "근로기준법 제61조"
        },
        {
          question: "회계연도와 연차년도가 다른 경우는?",
          answer: "회사의 회계연도에 따라 연차 부여 기준일이 달라질 수 있습니다. 입사일 기준으로 계산하거나, 회계연도 시작일을 기준으로 하는 경우가 있어 취업규칙을 확인해야 합니다.",
          legal: "근로기준법 시행령 제30조"
        }
      ]
    },
    {
      category: "근로시간 관련",
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50",
      items: [
        {
          question: "1일 8시간을 초과해서 일하면 어떻게 되나요?",
          answer: "1일 8시간, 1주 40시간을 초과하는 근로는 연장근로로 50% 이상의 가산임금을 지급해야 합니다. 연장근로는 근로자 대표와의 서면 합의가 있어야 가능합니다.",
          legal: "근로기준법 제50조, 제53조, 제56조"
        },
        {
          question: "야간근로나 휴일근로 수당은?",
          answer: "야간근로(오후 10시~오전 6시)는 50% 가산, 휴일근로는 8시간 이내 50% 가산, 8시간 초과 시 100% 가산임금을 지급해야 합니다.",
          legal: "근로기준법 제56조"
        },
        {
          question: "선택적 근로시간제란?",
          answer: "1개월 이내의 일정 기간 평균하여 1주간 근로시간이 40시간을 초과하지 않는 범위에서 특정 주에 40시간을 초과하여 근로하게 할 수 있는 제도입니다.",
          legal: "근로기준법 제51조"
        }
      ]
    },
    {
      category: "퇴직급여 관련",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      items: [
        {
          question: "1년 미만 근무해도 퇴직금을 받을 수 있나요?",
          answer: "네, 가능합니다. 근속기간이 1년 미만이어도 퇴직급여를 받을 수 있습니다. 다만, 계산 방법이 달라져서 평균임금 × 근속일수로 계산됩니다.",
          legal: "근로자퇴직급여보장법 제8조"
        },
        {
          question: "퇴직금과 퇴직연금의 차이는?",
          answer: "퇴직금제는 회사가 직접 적립하고 지급하는 방식이고, 퇴직연금제는 외부 금융기관에 적립하여 운용하는 방식입니다. 퇴직연금제는 DB형과 DC형으로 나뉩니다.",
          legal: "근로자퇴직급여보장법 제4조"
        },
        {
          question: "평균임금 계산 시 상여금도 포함되나요?",
          answer: "정기상여금은 평균임금에 포함되지만, 임시상여금은 제외됩니다. 퇴직 전 3개월간 지급받은 임금 총액을 총일수로 나누어 계산합니다.",
          legal: "근로기준법 제2조 제1항 제4호"
        },
        {
          question: "퇴직급여는 언제까지 지급받아야 하나요?",
          answer: "퇴직급여는 근로자가 퇴직한 후 14일 이내에 지급해야 합니다. 근로자가 요구하는 경우에는 7일 이내에 지급해야 합니다.",
          legal: "근로자퇴직급여보장법 제9조"
        }
      ]
    },
    {
      category: "채용 및 근로계약 관련",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      items: [
        {
          question: "근로계약서를 꼭 서면으로 작성해야 하나요?",
          answer: "네, 필수입니다. 사용자는 임금, 소정근로시간, 휴일, 연차 유급휴가 등의 주요 근로조건을 서면으로 명시하여 근로자에게 교부해야 합니다.",
          legal: "근로기준법 제15조"
        },
        {
          question: "시용기간 중에도 4대보험에 가입해야 하나요?",
          answer: "네, 시용기간이라도 근로자라면 4대보험(국민연금, 건강보험, 고용보험, 산재보험)에 가입해야 합니다. 다만, 각 보험별로 적용 기준이 다를 수 있습니다.",
          legal: "국민연금법, 국민건강보험법, 고용보험법, 산업재해보상보험법"
        },
        {
          question: "외국인 근로자 채용 시 주의사항은?",
          answer: "외국인 근로자는 체류자격에 따라 취업 가능 여부가 달라집니다. 불법취업 방지를 위해 외국인등록증과 체류자격을 반드시 확인해야 합니다.",
          legal: "출입국관리법, 외국인근로자의 고용 등에 관한 법률"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-black hover:text-gray-700 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                홈으로
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <HelpCircle className="h-6 w-6 text-red-600" />
                <h1 className="text-xl font-bold text-gray-900">자주 묻는 질문</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 소개 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            HR 업무 중 자주 묻는 질문들
          </h2>
          <p className="text-black">
            HR 신입들이 자주 궁금해하는 질문들을 관련 법령 조문과 함께 정리했습니다.
            더 정확한 정보가 필요한 경우에는 해당 법령을 직접 확인하시기 바랍니다.
          </p>
        </div>

        {/* FAQ 섹션들 */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <div key={categoryIndex} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className={`${category.bgColor} px-6 py-4 border-b`}>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Icon className={`h-6 w-6 mr-3 ${category.color}`} />
                    {category.category}
                  </h3>
                </div>

                <div className="divide-y divide-gray-100">
                  {category.items.map((item, itemIndex) => {
                    const globalIndex = categoryIndex * 1000 + itemIndex;
                    const isOpen = openItems.includes(globalIndex);

                    return (
                      <div key={itemIndex} className="p-6">
                        <button
                          onClick={() => toggleItem(globalIndex)}
                          className="w-full text-left flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2"
                        >
                          <h4 className="text-lg font-medium text-black pr-4">
                            {item.question}
                          </h4>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-black flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-black flex-shrink-0" />
                          )}
                        </button>

                        {isOpen && (
                          <div className="mt-4 space-y-3">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-black leading-relaxed">
                                {item.answer}
                              </p>
                            </div>

                            <div className="flex items-start space-x-2 text-sm">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium flex-shrink-0">
                                법적근거
                              </span>
                              <span className="text-blue-700 font-medium">
                                {item.legal}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            📋 추가 도움이 필요하다면
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">국가법령정보센터</h4>
              <p className="text-sm text-blue-700 mb-2">최신 법령 정보 및 해석례</p>
              <a
                href="https://www.law.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                law.go.kr →
              </a>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">고용노동부</h4>
              <p className="text-sm text-green-700 mb-2">근로조건, 고용정책 관련 문의</p>
              <a
                href="https://www.moel.go.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline text-sm"
              >
                moel.go.kr →
              </a>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">근로복지공단</h4>
              <p className="text-sm text-purple-700 mb-2">산재보험, 고용보험 관련</p>
              <a
                href="https://www.comwel.or.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline text-sm"
              >
                comwel.or.kr →
              </a>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">고용노동부 상담센터</h4>
              <p className="text-sm text-orange-700 mb-2">전화 상담: 1350</p>
              <p className="text-orange-600 text-sm">
                평일 09:00~18:00
              </p>
            </div>
          </div>
        </div>

        {/* 면책 조항 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
            ⚠️ 중요한 안내사항
          </h4>
          <p className="text-sm text-yellow-800 leading-relaxed">
            본 FAQ의 내용은 일반적인 상황을 기준으로 작성되었으며, 개별 사안의 특수성이나 최신 법령 개정사항이 반영되지 않을 수 있습니다.
            정확한 법률 해석이나 구체적인 사안에 대해서는 반드시 관련 전문가나 관계 기관에 문의하시기 바랍니다.
          </p>
        </div>
      </div>
    </div>
  );
}