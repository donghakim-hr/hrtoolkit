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
  Calendar
} from "lucide-react";
import { Notice } from "@/types";

export default function AdminDashboardPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewNoticeForm, setShowNewNoticeForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [error, setError] = useState("");
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

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

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

  const getTypeColor = (type: Notice['type']) => {
    switch (type) {
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'notice': return 'bg-green-100 text-green-800';
      case 'info': return 'bg-purple-100 text-purple-800';
      case 'warning': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-black';
    }
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
      </div>
    </div>
  );
}