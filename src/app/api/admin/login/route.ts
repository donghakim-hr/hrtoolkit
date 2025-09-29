import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword, createAdminSession, ADMIN_SESSION_COOKIE } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: '비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: '잘못된 비밀번호입니다.' },
        { status: 401 }
      );
    }

    const sessionData = createAdminSession();
    const response = NextResponse.json({ success: true });

    // 세션 쿠키 설정
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24시간
    });

    return response;
  } catch (error) {
    console.error('로그인 처리 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}