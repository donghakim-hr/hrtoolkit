import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/users';
import { RegisterData } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const userData: RegisterData = await request.json();

    // 입력 검증
    if (!userData.username || !userData.email || !userData.password || !userData.name) {
      return NextResponse.json(
        { error: '모든 필드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자명 검증 (3-20자, 영숫자)
    if (!/^[a-zA-Z0-9]{3,20}$/.test(userData.username)) {
      return NextResponse.json(
        { error: '사용자명은 3-20자의 영문, 숫자만 사용 가능합니다.' },
        { status: 400 }
      );
    }

    // 이메일 검증
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 검증 (6자 이상)
    if (userData.password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 이름 검증 (2-20자)
    if (userData.name.length < 2 || userData.name.length > 20) {
      return NextResponse.json(
        { error: '이름은 2-20자 사이여야 합니다.' },
        { status: 400 }
      );
    }

    const newUser = await registerUser(userData);

    // 비밀번호 제외하고 응답
    const { password: _, ...userResponse } = newUser;

    return NextResponse.json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: userResponse
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('회원가입 오류:', error);

    if (error instanceof Error && error.message.includes('이미 존재하는')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: '회원가입 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}