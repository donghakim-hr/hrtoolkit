"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { Users, Eye, TrendingUp, Smartphone, Monitor, Tablet, RefreshCw, Lock } from "lucide-react";

interface StatsData {
  total: number;
  uniqueSessions: number;
  todayVisits: number;
  byDate: { name: string; count: number }[];
  byHour: { name: string; count: number }[];
  byPath: { name: string; count: number }[];
  byReferrer: { name: string; count: number }[];
  byDevice: { name: string; count: number }[];
}

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  mobile: <Smartphone className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
  desktop: <Monitor className="h-4 w-4" />,
};

export default function AnalyticsDashboard() {
  const [token, setToken] = useState("");
  const [inputToken, setInputToken] = useState("");
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  const fetchStats = useCallback(async (t: string, d: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/analytics/stats?days=${d}`, {
        headers: { "x-admin-token": t },
      });
      if (res.status === 401) { setError("인증 실패: 토큰을 확인해주세요."); setToken(""); return; }
      if (!res.ok) { setError("데이터 조회 실패"); return; }
      const data = await res.json();
      setStats(data);
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchStats(token, days);
  }, [token, days, fetchStats]);

  // 로그인 화면
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-black">관리자 인증</h1>
          </div>
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <input
            type="password"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setToken(inputToken)}
            placeholder="관리자 토큰 입력"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-black focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => setToken(inputToken)}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium"
          >
            접속
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-black">방문자 통계 대시보드</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-black"
            >
              <option value={7}>최근 7일</option>
              <option value={14}>최근 14일</option>
              <option value={30}>최근 30일</option>
              <option value={90}>최근 90일</option>
            </select>
            <button
              onClick={() => fetchStats(token, days)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              새로고침
            </button>
            <button
              onClick={() => { setToken(""); setStats(null); }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {loading && !stats && (
          <div className="text-center py-16 text-gray-500">데이터 불러오는 중...</div>
        )}
        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

        {stats && (
          <>
            {/* 요약 카드 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "오늘 방문", value: stats.todayVisits.toLocaleString(), icon: <Eye className="h-5 w-5 text-blue-600" />, bg: "bg-blue-50" },
                { label: `${days}일 총 방문`, value: stats.total.toLocaleString(), icon: <TrendingUp className="h-5 w-5 text-indigo-600" />, bg: "bg-indigo-50" },
                { label: "순방문자(세션)", value: stats.uniqueSessions.toLocaleString(), icon: <Users className="h-5 w-5 text-green-600" />, bg: "bg-green-50" },
                { label: "일평균 방문", value: Math.round(stats.total / days).toLocaleString(), icon: <TrendingUp className="h-5 w-5 text-purple-600" />, bg: "bg-purple-50" },
              ].map((c) => (
                <div key={c.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                  <div className={`${c.bg} p-3 rounded-lg`}>{c.icon}</div>
                  <div>
                    <p className="text-sm text-gray-500">{c.label}</p>
                    <p className="text-2xl font-bold text-black">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 일별 방문 차트 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-black mb-4">일별 방문수</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.byDate} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#555" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#555" }} />
                  <Tooltip />
                  <Bar dataKey="count" name="방문수" fill="#4F46E5" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 시간별 방문 차트 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-black mb-4">시간대별 방문수 (전체 기간 합산)</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.byHour} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#555" }} interval={1} />
                  <YAxis tick={{ fontSize: 11, fill: "#555" }} />
                  <Tooltip />
                  <Bar dataKey="count" name="방문수" fill="#0EA5E9" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 인기 페이지 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-base font-semibold text-black mb-4">인기 페이지 TOP 10</h2>
                <div className="space-y-2">
                  {stats.byPath.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-0.5">
                          <span className="text-black truncate">{p.name || "/"}</span>
                          <span className="text-gray-500 ml-2 shrink-0">{p.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(p.count / stats.byPath[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 유입 경로 */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-base font-semibold text-black mb-4">유입 경로 (Referrer)</h2>
                <div className="space-y-2">
                  {stats.byReferrer.map((r, i) => (
                    <div key={r.name} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm mb-0.5">
                          <span className="text-black truncate">{r.name}</span>
                          <span className="text-gray-500 ml-2 shrink-0">{r.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(r.count / stats.byReferrer[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 디바이스 분포 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-base font-semibold text-black mb-4">디바이스 분포</h2>
              <div className="flex flex-wrap gap-4">
                {stats.byDevice.map((d) => {
                  const total = stats.byDevice.reduce((s, v) => s + v.count, 0);
                  const pct = total ? Math.round((d.count / total) * 100) : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 min-w-32">
                      <span className="text-gray-600">{DEVICE_ICONS[d.name] ?? <Monitor className="h-4 w-4" />}</span>
                      <div>
                        <p className="text-xs text-gray-500 capitalize">{d.name}</p>
                        <p className="font-bold text-black">{pct}% <span className="text-xs font-normal text-gray-400">({d.count.toLocaleString()})</span></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
