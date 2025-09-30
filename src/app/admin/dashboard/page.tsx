"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
  Bell,
  Calendar,
  Users,
  MessageSquare,
  Eye,
  Clock,
  HelpCircle,
  DollarSign,
  User as UserIcon
} from "lucide-react";
import { Notice } from "@/types";
import { CommunityPost } from "@/types/community";
import { FaqCategory } from "@/lib/faq";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  birthDate: string;
  nickname: string;
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'notices' | 'users' | 'posts' | 'faq'>('notices');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [faqData, setFaqData] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewNoticeForm, setShowNewNoticeForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [error, setError] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<'all' | 'free-board' | 'hr-chat'>('all');
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('');
  const [showNewFaqForm, setShowNewFaqForm] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [editingFaqItem, setEditingFaqItem] = useState<{id: string, question: string, answer: string} | null>(null);
  const router = useRouter();

  // 새 공지사항 폼 상태
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    type: "notice" as Notice['type'],
    important: false,
    badge: ""
  });

  // 공지사항 불러오기
  const fetchNotices = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/notices");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setNotices(data);
      } else {
        setError("공지사항을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 조회 오류:", error);
      setError("서버 연결에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 회원 목록 불러오기
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError("회원 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("회원 목록 조회 오류:", error);
      setError("서버 연결에 실패했습니다.");
    }
  }, [router]);

  // 게시글 목록 불러오기
  const fetchPosts = useCallback(async () => {
    try {
      const url = selectedBoard === 'all'
        ? "/api/admin/community"
        : `/api/admin/community?board=${selectedBoard}`;

      const response = await fetch(url);
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
      } else {
        setError("게시글 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 목록 조회 오류:", error);
      setError("서버 연결에 실패했습니다.");
    }
  }, [router, selectedBoard]);

  // FAQ 데이터 불러오기
  const fetchFaq = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/faq");
      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setFaqData(data.faq);
      } else {
        setError("FAQ 데이터를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("FAQ 조회 오류:", error);
      setError("서버 연결에 실패했습니다.");
    }
  }, [router]);

  useEffect(() => {
    if (activeTab === 'notices') {
      fetchNotices();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'posts') {
      fetchPosts();
    } else if (activeTab === 'faq') {
      fetchFaq();
    }
  }, [activeTab, fetchNotices, fetchUsers, fetchPosts, fetchFaq]);

  // 로그아웃
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  // 새 공지사항 추가
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotice)
      });

      if (response.ok) {
        setNewNotice({ title: "", content: "", type: "notice", important: false, badge: "" });
        setShowNewNoticeForm(false);
        fetchNotices();
      } else {
        const data = await response.json();
        setError(data.error || "공지사항 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 생성 오류:", error);
      setError("서버 연결에 실패했습니다.");
    }
  };

  // 공지사항 수정
  const handleUpdateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;

    try {
      const response = await fetch(`/api/admin/notices/${editingNotice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingNotice)
      });

      if (response.ok) {
        setEditingNotice(null);
        fetchNotices();
      } else {
        const data = await response.json();
        setError(data.error || "공지사항 수정에 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 수정 오류:", error);
      setError("서버 연결에 실패했습니다.");
    }
  };

  // 공지사항 삭제
  const handleDeleteNotice = async (id: number) => {
    if (!confirm("정말로 이 공지사항을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/admin/notices/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        fetchNotices();
      } else {
        const data = await response.json();
        setError(data.error || "공지사항 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("공지사항 삭제 오류:", error);
      setError("서버 연결에 실패했습니다.");
    }
  };

  // 게시글 삭제
  const handleDeletePost = async (postId: string) => {
    if (!confirm("이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/community/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchPosts();
      } else {
        const data = await response.json();
        setError(data.error || "게시글 삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("게시글 삭제 오류:", error);
      setError("서버 연결에 실패했습니다.");
    }
  };

  const getTypeColor = (type: Notice['type']) => {
    switch (type) {
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'notice': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-purple-100 text-purple-800';
      case 'warning': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-black';
    }
  };

  const getBoardName = (boardType: string) => {
    switch (boardType) {
      case 'free-board': return '자유게시판';
      case 'hr-chat': return 'HR수다';
      default: return boardType;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-black hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" />
                홈으로
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-black">관리자 대시보드</h1>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-black hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('notices')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-black hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="h-4 w-4 inline mr-2" />
                공지사항 관리
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-black hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                회원 관리
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-black hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                게시글 관리
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'faq'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-black hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <HelpCircle className="h-4 w-4 inline mr-2" />
                FAQ 관리
              </button>
            </nav>
          </div>
        </div>

        {/* 공지사항 관리 탭 */}
        {activeTab === 'notices' && (
          <>
        {/* 액션 버튼 */}
        <div className="mb-6">
          <button
            onClick={() => setShowNewNoticeForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>새 공지사항</span>
          </button>
        </div>

        {/* 새 공지사항 폼 */}
        {showNewNoticeForm && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border">
            <h2 className="text-lg font-semibold mb-4">새 공지사항 작성</h2>
            <form onSubmit={handleCreateNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">제목</label>
                <input
                  type="text"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="공지사항 제목을 입력하세요"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">내용</label>
                <textarea
                  value={newNotice.content}
                  onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="공지사항 내용을 입력하세요"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">타입</label>
                  <select
                    value={newNotice.type}
                    onChange={(e) => setNewNotice({ ...newNotice, type: e.target.value as Notice['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="notice">공지</option>
                    <option value="update">업데이트</option>
                    <option value="info">안내</option>
                    <option value="warning">중요</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">배지 (선택)</label>
                  <input
                    type="text"
                    value={newNotice.badge}
                    onChange={(e) => setNewNotice({ ...newNotice, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="NEW, HOT, UPDATE 등"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newNotice.important}
                      onChange={(e) => setNewNotice({ ...newNotice, important: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-black">중요 공지</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewNoticeForm(false)}
                  className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>저장</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 공지사항 목록 */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">공지사항 목록 ({notices.length}개)</h2>
          {notices.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Bell className="h-12 w-12 text-black mx-auto mb-4" />
              <p className="text-black">등록된 공지사항이 없습니다.</p>
              <p className="text-black text-sm mt-1">첫 번째 공지사항을 작성해보세요.</p>
            </div>
          ) : (
            notices.map((notice) => (
              <div key={notice.id} className="bg-white rounded-xl shadow-sm p-6 border">
                {editingNotice?.id === notice.id ? (
                  // 수정 폼
                  <form onSubmit={handleUpdateNotice} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={editingNotice.title}
                        onChange={(e) => setEditingNotice({ ...editingNotice, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <textarea
                        value={editingNotice.content}
                        onChange={(e) => setEditingNotice({ ...editingNotice, content: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <select
                        value={editingNotice.type}
                        onChange={(e) => setEditingNotice({ ...editingNotice, type: e.target.value as Notice['type'] })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="notice">공지</option>
                        <option value="update">업데이트</option>
                        <option value="info">안내</option>
                        <option value="warning">중요</option>
                      </select>
                      <input
                        type="text"
                        value={editingNotice.badge || ""}
                        onChange={(e) => setEditingNotice({ ...editingNotice, badge: e.target.value })}
                        placeholder="배지"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editingNotice.important}
                          onChange={(e) => setEditingNotice({ ...editingNotice, important: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">중요 공지</span>
                      </label>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setEditingNotice(null)}
                        className="px-3 py-1.5 text-black border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        저장
                      </button>
                    </div>
                  </form>
                ) : (
                  // 일반 표시
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notice.type)}`}>
                          {notice.type}
                        </div>
                        {notice.badge && (
                          <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-xs font-medium">
                            {notice.badge}
                          </div>
                        )}
                        {notice.important && (
                          <div className="px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full text-xs font-medium">
                            중요
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-black flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(notice.date).toLocaleDateString('ko-KR')}
                        </span>
                        <button
                          onClick={() => setEditingNotice(notice)}
                          className="p-1 text-black hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="p-1 text-black hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-2">{notice.title}</h3>
                    <p className="text-black whitespace-pre-line">{notice.content}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
          </>
        )}

        {/* 회원 관리 탭 */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-black flex items-center">
                <Users className="h-5 w-5 mr-2" />
                회원 관리 ({users.length}명)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      회원정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      가입일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      마지막 로그인
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-black">{user.name}</div>
                          <div className="text-sm text-black">{user.email}</div>
                          <div className="text-xs text-black">
                            닉네임: {user.nickname || '미설정'} | @{user.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : '로그인 이력 없음'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-black">등록된 회원이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 게시글 관리 탭 */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-xl shadow-lg border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  게시글 관리 ({posts.length}개)
                </h2>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedBoard}
                    onChange={(e) => setSelectedBoard(e.target.value as 'all' | 'free-board' | 'hr-chat')}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value="all">전체 게시판</option>
                    <option value="free-board">자유게시판</option>
                    <option value="hr-chat">HR수다</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <div key={post.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.boardType === 'free-board'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {getBoardName(post.boardType)}
                        </span>
                        {post.isAnonymous && (
                          <span className="px-2 py-1 bg-gray-100 text-black rounded-full text-xs font-medium">
                            익명
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-black mb-2">{post.title}</h3>
                      <p className="text-black text-sm mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-black">
                        <div className="flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
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
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="ml-4 p-2 text-black hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-black">
                    {selectedBoard === 'all'
                      ? '작성된 게시글이 없습니다.'
                      : `${getBoardName(selectedBoard)}에 작성된 게시글이 없습니다.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FAQ 관리 탭 */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">FAQ 관리</h2>
                <div className="space-x-2">
                  <button
                    onClick={() => setShowNewCategoryForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>카테고리 추가</span>
                  </button>
                  <button
                    onClick={() => setShowNewFaqForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>FAQ 추가</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-black">FAQ 데이터를 불러오는 중...</p>
                </div>
              ) : faqData.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-black mb-2">등록된 FAQ가 없습니다.</p>
                  <p className="text-sm text-black">새로운 FAQ 카테고리와 항목을 추가해보세요.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {faqData.map((category) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg">
                      <div className={`${category.bgColor} px-4 py-3 border-b flex items-center justify-between`}>
                        <div className="flex items-center">
                          <span className={`h-5 w-5 mr-2 ${category.color}`}>
                            {category.icon === 'Calendar' && <Calendar className="h-5 w-5" />}
                            {category.icon === 'Clock' && <Clock className="h-5 w-5" />}
                            {category.icon === 'DollarSign' && <DollarSign className="h-5 w-5" />}
                            {category.icon === 'Users' && <Users className="h-5 w-5" />}
                            {!['Calendar', 'Clock', 'DollarSign', 'Users'].includes(category.icon) && <HelpCircle className="h-5 w-5" />}
                          </span>
                          <h3 className="font-semibold text-gray-900">{category.category}</h3>
                          <span className="ml-2 text-sm text-gray-600">({category.items.length}개 항목)</span>
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => {
                              setSelectedFaqCategory(category.id);
                              setShowNewFaqForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            항목 추가
                          </button>
                          <button className="text-gray-600 hover:text-gray-800 text-sm">
                            수정
                          </button>
                          <button className="text-red-600 hover:text-red-800 text-sm">
                            삭제
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {category.items.map((item) => (
                          <div key={item.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                                <p className="text-gray-700 text-sm mb-2 line-clamp-2">{item.answer}</p>
                                {item.legal && (
                                  <p className="text-blue-600 text-xs">법적근거: {item.legal}</p>
                                )}
                              </div>
                              <div className="ml-4 space-x-2">
                                <button
                                  onClick={() => setEditingFaqItem(item)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-800 text-sm">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {category.items.length === 0 && (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            이 카테고리에는 아직 FAQ 항목이 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}