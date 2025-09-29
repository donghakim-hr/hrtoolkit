import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // 세션 쿠키 삭제
  response.cookies.delete(ADMIN_SESSION_COOKIE);

  return response;
}