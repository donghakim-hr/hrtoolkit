import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/users';
import { createUserSession, USER_SESSION_COOKIE } from '@/lib/auth';
import { LoginCredentials } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const credentials: LoginCredentials = await request.json();

    // 입력 검증
    if (!credentials.username || !credentials.password) {
      return NextResponse.json(
        { error: '사용자명과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(credentials);

    if (!user) {
      return NextResponse.json(
        { error: '사용자명 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }

    // 세션 생성
    const sessionData = createUserSession({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email
    });

    const response = NextResponse.json({
      success: true,
      message: '로그인되었습니다.',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      }
    });

    // 세션 쿠키 설정
    response.cookies.set(USER_SESSION_COOKIE, sessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7일
    });

    return response;

  } catch (error) {
    console.error('로그인 오류:', error);
    return NextResponse.json(
      { error: '로그인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}