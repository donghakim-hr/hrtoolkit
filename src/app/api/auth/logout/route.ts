import { NextResponse } from 'next/server';
import { USER_SESSION_COOKIE } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: '로그아웃되었습니다.'
  });

  // 사용자 세션 쿠키 삭제
  response.cookies.delete(USER_SESSION_COOKIE);

  return response;
}