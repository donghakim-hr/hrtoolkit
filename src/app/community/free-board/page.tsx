"use client";

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Eye, Clock, User, Edit3, Send } from 'lucide-react';
import { CommunityPost } from '@/types/community';

interface UserSession {
  userId: string;
  username: string;
  name: string;
  email: string;
}

export default function FreeBoard() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isAnonymous: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    fetchPosts();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUserSession(data.user);
      }
    } catch (error) {
      console.error("인증 상태 확인 오류:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/community/posts?board=free-board');
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('게시글 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          boardType: 'free-board'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setFormData({ title: '', content: '', isAnonymous: false });
        setShowWriteForm(false);
        fetchPosts();
      } else {
        const error = await response.json();
        alert(error.error || '게시글 작성에 실패했습니다.');
      }
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      alert('서버 연결에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: '2-digit',
        day: '2-digit'
      });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-black">💬 자유게시판</h1>
                <p className="text-sm text-black mt-1">자유롭게 이야기를 나누는 공간입니다</p>
              </div>
            </div>
            <button
              onClick={() => setShowWriteForm(!showWriteForm)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              글쓰기
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Write Form */}
        {showWriteForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center">
              <Edit3 className="h-5 w-5 mr-2 text-blue-600" />
              새 글 작성
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="제목을 입력하세요"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={submitting}
                />
              </div>
              <div>
                <textarea
                  placeholder="내용을 입력하세요"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  disabled={submitting}
                />
              </div>
              {userSession && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                    className="mr-2"
                    disabled={submitting}
                  />
                  <label htmlFor="anonymous" className="text-sm text-black">
                    익명으로 작성하기
                  </label>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-black">
                  {userSession ?
                    `${userSession.name}님으로 로그인됨${formData.isAnonymous ? ' (익명으로 작성)' : ''}` :
                    '비회원으로 작성됨 (자동 익명)'
                  }
                </p>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowWriteForm(false);
                      setFormData({ title: '', content: '', isAnonymous: false });
                    }}
                    className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={submitting}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.title.trim() || !formData.content.trim()}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitting ? '작성 중...' : '작성하기'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-black mb-2">아직 작성된 글이 없습니다</p>
              <p className="text-sm text-black">첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-black mb-2">{post.title}</h3>
                    <p className="text-black text-sm mb-3 line-clamp-3">{post.content}</p>
                    <div className="flex items-center space-x-4 text-xs text-black">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(post.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {post.views}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}