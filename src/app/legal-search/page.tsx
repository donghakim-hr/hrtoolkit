"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Book, Calendar, FileText, Bookmark, ExternalLink, Eye, Download } from "lucide-react";
import legalData from "@/data/legal-articles.json";
import { LegalData, LegalSearchResult } from "@/types";

export default function LegalSearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLaw, setSelectedLaw] = useState<string>("전체");
  const [searchResults, setSearchResults] = useState<LegalSearchResult[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expandedArticles, setExpandedArticles] = useState<string[]>([]);
  const [fullTextCache, setFullTextCache] = useState<Record<string, string>>({});

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

  // 법령 전문 가져오기 함수
  const fetchFullLegalText = async (lawName: string, article: string): Promise<string> => {
    const cacheKey = `${lawName}-${article}`;
    
    // 캐시에 있으면 반환
    if (fullTextCache[cacheKey]) {
      return fullTextCache[cacheKey];
    }

    try {
      // 실제로는 국가법령정보센터 API를 사용하거나 웹 스크래핑을 해야 하지만,
      // 여기서는 시뮬레이션으로 더 상세한 내용을 제공
      const simulatedFullText = await simulateFullTextFetch(lawName, article);
      
      // 캐시에 저장
      setFullTextCache(prev => ({
        ...prev,
        [cacheKey]: simulatedFullText
      }));

      return simulatedFullText;
    } catch (error) {
      console.error('법령 전문 가져오기 오류:', error);
      return '법령 전문을 가져오는 중 오류가 발생했습니다.';
    }
  };

  // 법령 전문 시뮬레이션 함수 (실제 구현에서는 API 호출)
  const simulateFullTextFetch = async (lawName: string, article: string): Promise<string> => {
    // 실제 구현에서는 여기에 API 호출 로직이 들어갑니다
    await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션

    const data = legalData as LegalData;
    const lawInfo = data[lawName];
    
    if (!lawInfo || !lawInfo.조문[article]) {
      return '해당 조문의 전문을 찾을 수 없습니다.';
    }

    const articleInfo = lawInfo.조문[article];
    const basicContent = typeof articleInfo === 'object' ? articleInfo.내용 : articleInfo;

    // 실제 조문은 더 상세한 내용을 포함할 수 있습니다
    const expandedContent = `${basicContent}

📋 상세 해설:
이 조문은 ${lawName}의 핵심 규정 중 하나로, HR 실무에서 중요하게 다뤄지는 사항입니다.

🔍 적용 시 고려사항:
- 본 조문은 강행법규로서 근로자에게 불리하게 적용될 수 없습니다.
- 관련 판례 및 행정해석을 함께 참고하시기 바랍니다.
- 단체협약이나 취업규칙으로 근로자에게 유리하게 정할 수 있습니다.

⚖️ 관련 조문:
법령의 다른 조문들과 유기적으로 해석되어야 합니다.

⚠️ 주의사항:
정확한 법령 적용을 위해서는 반드시 국가법령정보센터(law.go.kr)에서 최신 법령을 확인하시기 바랍니다.`;

    return expandedContent;
  };

  // 조문 전문 토글
  const toggleArticleExpansion = async (articleId: string) => {
    if (expandedArticles.includes(articleId)) {
      setExpandedArticles(prev => prev.filter(id => id !== articleId));
    } else {
      setExpandedArticles(prev => [...prev, articleId]);
      
      // 전문이 캐시에 없으면 가져오기
      const [lawName, article] = articleId.split('-');
      if (!fullTextCache[articleId]) {
        await fetchFullLegalText(lawName, article);
      }
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
    if (searchTerm.trim().length < 2) {
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
    if (searchTerm.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        searchLegalArticles();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedLaw]);

  // 전체 조문 보기 (검색어 없이 선택된 법령의 모든 조문 표시)
  const showAllArticles = () => {
    if (selectedLaw === "전체" || searchTerm) return false;
    
    const data = legalData as LegalData;
    const lawInfo = data[selectedLaw];
    
    if (!lawInfo) return false;
    
    const allArticles: LegalSearchResult[] = [];
    Object.entries(lawInfo.조문).forEach(([articleKey, articleInfo]) => {
      const title = typeof articleInfo === 'object' && articleInfo.제목
        ? articleInfo.제목
        : articleKey;
      const content = typeof articleInfo === 'object' && articleInfo.내용
        ? articleInfo.내용
        : (typeof articleInfo === 'string' ? articleInfo : '');

      allArticles.push({
        law: selectedLaw,
        article: articleKey,
        title: title,
        content: content,
        lawNumber: lawInfo.법령번호,
        effectiveDate: lawInfo.시행일,
        id: `${selectedLaw}-${articleKey}`
      });
    });

    return allArticles;
  };

  const allArticlesData = showAllArticles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-black hover:text-black transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                홈으로
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <Search className="h-6 w-6 text-orange-600" />
                <h1 className="text-xl font-bold text-black">법령 조문 검색</h1>
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
                  placeholder="2자 이상 입력하여 조문 내용, 제목, 조항 번호를 검색하세요..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              {searchTerm.trim().length === 1 && (
                <p className="text-xs text-orange-500 mt-1">2글자 이상 입력해야 검색됩니다.</p>
              )}
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
              <h2 className="text-xl font-bold text-black">
                검색 결과 ({searchResults.length}건)
              </h2>
              {searchResults.length > 0 && (
                <p className="text-sm text-black">
                  &quot;{searchTerm}&quot;에 대한 검색 결과
                </p>
              )}
            </div>
          )}

          {/* 전체 조문 보기 */}
          {allArticlesData && (
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-black">
                📖 {selectedLaw} 전체 조문 ({allArticlesData.length}개)
              </h2>
              <button
                onClick={() => setSelectedLaw("전체")}
                className="text-sm text-orange-600 hover:text-orange-800 transition-colors"
              >
                전체 법령으로 돌아가기
              </button>
            </div>
          )}

          {(searchResults.length > 0 || allArticlesData) ? (
            <div className="grid gap-6">
              {(allArticlesData || searchResults).map((result, index) => (
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
                      <h3 className="text-lg font-bold text-black mb-2">
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
                    
                    {/* 조문 전문 보기 버튼 */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleArticleExpansion(result.id)}
                          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          disabled={expandedArticles.includes(result.id) && !fullTextCache[result.id]}
                        >
                          <Eye className="h-4 w-4" />
                          <span>
                            {expandedArticles.includes(result.id) ? '조문 전문 숨기기' : '조문 전문 보기'}
                          </span>
                          {expandedArticles.includes(result.id) && !fullTextCache[result.id] && (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </button>
                        
                        <a
                          href={getLawUrl(result.law, result.lawNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-800 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>원문 다운로드</span>
                        </a>
                      </div>
                    </div>

                    {/* 확장된 조문 전문 */}
                    {expandedArticles.includes(result.id) && fullTextCache[result.id] && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-blue-800">📖 조문 전문 및 해설</h4>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            상세 정보
                          </span>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                            {fullTextCache[result.id]}
                          </pre>
                        </div>
                        <div className="mt-3 text-xs text-blue-600">
                          💡 <strong>팁:</strong> 이 정보는 참고용이며, 정확한 법령 적용을 위해서는 국가법령정보센터에서 최신 법령을 확인하세요.
                        </div>
                      </div>
                    )}
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
          ) : searchTerm.trim().length >= 2 || allArticlesData ? (
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
              <p className="text-black">검색어를 2자 이상 입력해주세요.</p>
              <p className="text-sm text-black mt-2">
                법령 조문, 제목, 조항 번호를 검색할 수 있습니다.
              </p>
            </div>
          )}
        </div>

        {/* 즐겨찾기 */}
        {favorites.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center">
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
                      <p className="font-medium text-black">
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
          <h3 className="text-lg font-bold text-black mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-orange-600" />
            수록된 법령 정보
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(legalData).map(([lawName, lawInfo]) => (
              <div key={lawName} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-black mb-2">
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
                <div className="text-sm text-black space-y-1 mb-3">
                  <p>법령번호: {lawInfo.법령번호}</p>
                  <p>시행일: {lawInfo.시행일}</p>
                  <p>수록 조문: {Object.keys(lawInfo.조문).length}개</p>
                </div>
                
                {/* 수록 조문 목록 */}
                <div className="border-t border-gray-200 pt-2">
                  <p className="text-xs text-gray-600 mb-2">📋 주요 수록 조문:</p>
                  <div className="space-y-1">
                    {Object.entries(lawInfo.조문).slice(0, 3).map(([articleKey, articleInfo]) => {
                      const title = typeof articleInfo === 'object' && articleInfo.제목
                        ? articleInfo.제목
                        : articleKey;
                      return (
                        <div key={articleKey} className="text-xs text-gray-700">
                          <span className="font-medium">{articleKey}</span>: {title}
                        </div>
                      );
                    })}
                    {Object.keys(lawInfo.조문).length > 3 && (
                      <div className="text-xs text-gray-500">
                        ... 외 {Object.keys(lawInfo.조문).length - 3}개 조문
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      // 해당 법령으로 필터링하여 전체 조문 보기
                      setSelectedLaw(lawName);
                      setSearchTerm('');
                      // 페이지 상단으로 스크롤
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    전체 조문 보기
                  </button>
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