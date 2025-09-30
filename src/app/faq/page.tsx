"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Clock, Users, DollarSign, Calendar } from "lucide-react";
import { FaqCategory } from '@/lib/faq';

export default function FaqPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [faqData, setFaqData] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqData();
  }, []);

  const fetchFaqData = async () => {
    try {
      const response = await fetch('/api/admin/faq');
      if (response.ok) {
        const data = await response.json();
        setFaqData(data.faq);
      } else {
        // Fallback to empty array if API fails
        setFaqData([]);
      }
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
      setFaqData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Calendar': return Calendar;
      case 'Clock': return Clock;
      case 'DollarSign': return DollarSign;
      case 'Users': return Users;
      default: return HelpCircle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">FAQ 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
          {faqData.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-black mb-2">아직 FAQ가 등록되지 않았습니다.</p>
              <p className="text-sm text-black">관리자가 FAQ를 등록하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            faqData.map((category, categoryIndex) => {
              const Icon = getIconComponent(category.icon);
              return (
                <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                        <div key={item.id} className="p-6">
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

                              {item.legal && (
                                <div className="flex items-start space-x-2 text-sm">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium flex-shrink-0">
                                    법적근거
                                  </span>
                                  <span className="text-blue-700 font-medium">
                                    {item.legal}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
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