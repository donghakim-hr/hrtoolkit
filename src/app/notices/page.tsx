"use client";

import Link from "next/link";
import { ArrowLeft, Bell, Calendar } from "lucide-react";
import { Notice } from "@/types";
import noticesData from "@/data/notices.json";

export default function NoticesPage() {
  const notices = noticesData as Notice[];

  // 날짜순으로 정렬 (최신순)
  const sortedNotices = notices.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getTypeColor = (type: Notice['type']) => {
    switch (type) {
      case 'update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'notice':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'info':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'warning':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: Notice['type']) => {
    switch (type) {
      case 'update':
        return '업데이트';
      case 'notice':
        return '공지';
      case 'info':
        return '안내';
      case 'warning':
        return '중요';
      default:
        return '일반';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
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
                <Bell className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">공지사항</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 소개 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            HR-Toolkit 업데이트 소식
          </h2>
          <p className="text-black">
            새로운 기능 추가, 개선사항, 그리고 중요한 안내사항을 확인하세요.
            모든 업데이트는 사용자 경험 향상을 위해 지속적으로 이루어집니다.
          </p>
        </div>

        {/* 공지사항 목록 */}
        <div className="space-y-6">
          {sortedNotices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                notice.important
                  ? 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white'
                  : 'border-l-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(notice.type)}`}>
                    {getTypeLabel(notice.type)}
                  </div>
                  {notice.badge && (
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {notice.badge}
                    </div>
                  )}
                  {notice.important && (
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      중요
                    </div>
                  )}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(notice.date)}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {notice.title}
              </h3>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-black leading-relaxed whitespace-pre-line">
                  {notice.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 안내사항 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
            💡 공지사항 안내
          </h4>
          <div className="text-sm text-yellow-800 space-y-2">
            <p>• 중요한 업데이트는 홈페이지 상단 배너에도 표시됩니다</p>
            <p>• 모든 기능 개선은 사용자 피드백을 바탕으로 이루어집니다</p>
            <p>• 문의사항이나 개선 요청은 GitHub 이슈를 통해 알려주세요</p>
          </div>
        </div>
      </div>
    </div>
  );
}