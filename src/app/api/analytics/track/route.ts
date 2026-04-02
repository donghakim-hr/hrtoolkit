import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile';
  if (/tablet|ipad/i.test(userAgent)) return 'tablet';
  return 'desktop';
}

function getReferrerDomain(referrer: string): string {
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace(/^www\./, '');
    if (host.includes('hrtoolkit.co.kr')) return 'internal';
    if (host.includes('google')) return 'google';
    if (host.includes('naver')) return 'naver';
    if (host.includes('daum') || host.includes('kakao')) return 'kakao/daum';
    if (host.includes('bing')) return 'bing';
    return host;
  } catch {
    return 'direct';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { path, referrer, sessionId, userAgent } = await request.json();

    if (!path) return NextResponse.json({ ok: false }, { status: 400 });

    // 봇 필터링
    if (userAgent && /bot|crawler|spider|headless/i.test(userAgent)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await supabaseAdmin.from('page_visits').insert({
      path,
      referrer: referrer || null,
      referrer_domain: getReferrerDomain(referrer || ''),
      device_type: getDeviceType(userAgent || ''),
      session_id: sessionId || null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('analytics track error:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
