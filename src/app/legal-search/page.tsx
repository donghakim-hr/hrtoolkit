"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Book, Calendar, FileText, Bookmark, ExternalLink } from "lucide-react";
import legalData from "@/data/legal-articles.json";
import { LegalData, LegalSearchResult } from "@/types";

export default function LegalSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLaw, setSelectedLaw] = useState<string>("전체");
  const [searchResults, setSearchResults] = useState<LegalSearchResult[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const laws = ["전체", ...Object.keys(legalData)];

  // 국가법령정보센터 URL 생성 함수
  const getLawUrl = (lawName: string, lawNumber?: string) => {
    // 기본 국가법령정보센터 검색 URL
    const baseUrl = "https://www.law.go.kr/LSW/lsInfoP.do";

    // 법령명에서 불필요한 문자 제거하고 검색어로 사용
    const searchTerm = lawName.replace(/\s+/g, '');

    // 법령번호가 있으면 법령번호로 검색, 없으면 법령명으로 검색
    if (lawNumber) {
      return `${baseUrl}?lsiSeq=${lawNumber}`;
    } else {
      return `${baseUrl}?efYd=&lsNm=${encodeURIComponent(searchTerm)}`;
    }
  };

  useEffect(() => {
    // 로컬 스토리지에서 즐겨찾기 불러오기
    const savedFavorites = localStorage.getItem("hr-toolkit-favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const searchLegalArticles = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const results: LegalSearchResult[] = [];
    const data = legalData as LegalData;

    Object.entries(data).forEach(([lawName, lawInfo]) => {
      // 선택된 법령이 있고 현재 법령이 아니면 스킵
      if (selectedLaw !== "전체" && selectedLaw !== lawName) return;

      Object.entries(lawInfo.조문).forEach(([articleKey, articleInfo]) => {
        const title = typeof articleInfo === 'object' && articleInfo.제목
          ? articleInfo.제목
          : articleKey;
        const content = typeof articleInfo === 'object' && articleInfo.내용
          ? articleInfo.내용
          : (typeof articleInfo === 'string' ? articleInfo : '');

        // 검색어가 제목이나 내용에 포함되는지 확인
        if (
          title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          articleKey.includes(searchTerm)
        ) {
          results.push({
            law: lawName,
            article: articleKey,
            title: title,
            content: content,
            lawNumber: lawInfo.법령번호,
            effectiveDate: lawInfo.시행일,
            id: `${lawName}-${articleKey}`
          });
        }
      });
    });

    setSearchResults(results);
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];

    setFavorites(newFavorites);
    localStorage.setItem("hr-toolkit-favorites", JSON.stringify(newFavorites));
  };

  const highlightText = (text: string, term: string) => {
    if (!term) return text;

    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ?
        <mark key={index} className="bg-yellow-200 px-1">{part}</mark> :
        part
    );
  };

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        searchLegalArticles();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedLaw]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
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
                <Search className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-bold text-gray-900">법령 조문 검색</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 검색 영역 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-black mb-2">
                검색어
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="조문 내용, 제목, 조항 번호를 검색하세요..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="md:w-64">
              <label className="block text-sm font-medium text-black mb-2">
                법령 선택
              </label>
              <select
                value={selectedLaw}
                onChange={(e) => setSelectedLaw(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {laws.map(law => (
                  <option key={law} value={law}>{law}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="space-y-6">
          {searchTerm && (
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                검색 결과 ({searchResults.length}건)
              </h2>
              {searchResults.length > 0 && (
                <p className="text-sm text-black">
                  &quot;{searchTerm}&quot;에 대한 검색 결과
                </p>
              )}
            </div>
          )}

          {searchResults.length > 0 ? (
            <div className="grid gap-6">
              {searchResults.map((result, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Book className="h-5 w-5 text-orange-600" />
                        <a
                          href={getLawUrl(result.law, result.lawNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-orange-600 hover:text-orange-800 hover:underline transition-colors inline-flex items-center gap-1"
                          title="국가법령정보센터에서 전체 법령 보기"
                        >
                          {result.law}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-sm text-black">
                          {result.article}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {highlightText(result.title, searchTerm)}
                      </h3>
                    </div>
                    <button
                      onClick={() => toggleFavorite(result.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        favorites.includes(result.id)
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-black hover:text-yellow-600'
                      }`}
                    >
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <pre className="whitespace-pre-wrap text-sm text-black font-sans leading-relaxed">
                      {highlightText(result.content, searchTerm)}
                    </pre>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-black">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{result.lawNumber}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>시행일: {result.effectiveDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-black" />
              <p className="text-black">검색 결과가 없습니다.</p>
              <p className="text-sm text-black mt-2">
                다른 키워드로 검색해보세요.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Book className="h-12 w-12 mx-auto mb-4 text-black" />
              <p className="text-black">검색어를 입력해주세요.</p>
              <p className="text-sm text-black mt-2">
                법령 조문, 제목, 조항 번호를 검색할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* 즐겨찾기 */}
        {favorites.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Bookmark className="h-5 w-5 mr-2 text-yellow-600" />
              즐겨찾기 ({favorites.length}개)
            </h3>
            <div className="grid gap-4">
              {favorites.map(favoriteId => {
                const [lawName, articleKey] = favoriteId.split('-');
                const lawInfo = (legalData as LegalData)[lawName];
                if (!lawInfo) return null;

                const articleInfo = lawInfo.조문[articleKey];
                if (!articleInfo) return null;

                const title = typeof articleInfo === 'object' && articleInfo.제목
                  ? articleInfo.제목
                  : articleKey;

                return (
                  <div key={favoriteId} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        <a
                          href={getLawUrl(lawName, lawInfo.법령번호)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-800 hover:underline transition-colors inline-flex items-center gap-1"
                          title="국가법령정보센터에서 전체 법령 보기"
                        >
                          {lawName}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {' '}{articleKey}
                      </p>
                      <p className="text-sm text-black">{title}</p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(favoriteId)}
                      className="p-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                    >
                      <Bookmark className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 법령 정보 */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-orange-600" />
            수록된 법령 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(legalData).map(([lawName, lawInfo]) => (
              <div key={lawName} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  <a
                    href={getLawUrl(lawName, lawInfo.법령번호)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-800 hover:underline transition-colors inline-flex items-center gap-1"
                    title="국가법령정보센터에서 전체 법령 보기"
                  >
                    {lawName}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </h4>
                <div className="text-sm text-black space-y-1">
                  <p>법령번호: {lawInfo.법령번호}</p>
                  <p>시행일: {lawInfo.시행일}</p>
                  <p>수록 조문: {Object.keys(lawInfo.조문).length}개</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📋 참고사항:</strong> 본 법령 정보는 HR 업무에 자주 사용되는 주요 조문을 발췌한 것입니다.
              정확한 법령 해석 및 적용을 위해서는 국가법령정보센터(law.go.kr)에서 최신 법령을 확인하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}