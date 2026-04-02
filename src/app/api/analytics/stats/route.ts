import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function authCheck(request: NextRequest): boolean {
  const token = request.headers.get('x-admin-token');
  return token === process.env.ADMIN_SECRET_TOKEN;
}

export async function GET(request: NextRequest) {
  if (!authCheck(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const days = parseInt(searchParams.get('days') || '30');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // 전체 방문 데이터
  const { data: visits, error } = await supabaseAdmin
    .from('page_visits')
    .select('path, referrer_domain, device_type, session_id, created_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = visits || [];

  // 일별 방문수
  const byDate: Record<string, number> = {};
  const byHour: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  const byReferrer: Record<string, number> = {};
  const byDevice: Record<string, number> = {};
  const sessionSet = new Set<string>();

  for (const v of rows) {
    const d = new Date(v.created_at);
    const dateKey = d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' });
    const hourKey = `${String(d.getHours()).padStart(2, '0')}시`;

    byDate[dateKey] = (byDate[dateKey] || 0) + 1;
    byHour[hourKey] = (byHour[hourKey] || 0) + 1;
    byPath[v.path] = (byPath[v.path] || 0) + 1;
    byReferrer[v.referrer_domain || 'direct'] = (byReferrer[v.referrer_domain || 'direct'] || 0) + 1;
    byDevice[v.device_type || 'unknown'] = (byDevice[v.device_type || 'unknown'] || 0) + 1;
    if (v.session_id) sessionSet.add(v.session_id);
  }

  // 오늘 방문수
  const todayStr = new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' });
  const todayVisits = byDate[todayStr] || 0;

  const toSortedArray = (obj: Record<string, number>) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  return NextResponse.json({
    total: rows.length,
    uniqueSessions: sessionSet.size,
    todayVisits,
    byDate: toSortedArray(byDate).reverse(),  // 날짜순
    byHour: Array.from({ length: 24 }, (_, i) => ({
      name: `${String(i).padStart(2, '0')}시`,
      count: byHour[`${String(i).padStart(2, '0')}시`] || 0,
    })),
    byPath: toSortedArray(byPath).slice(0, 10),
    byReferrer: toSortedArray(byReferrer).slice(0, 10),
    byDevice: toSortedArray(byDevice),
  });
}
