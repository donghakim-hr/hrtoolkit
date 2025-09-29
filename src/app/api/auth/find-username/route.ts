import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 검증
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: '해당 이메일로 등록된 계정을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 실제 서비스에서는 이메일 발송을 하겠지만, 여기서는 직접 반환
    return NextResponse.json({
      success: true,
      message: '사용자명을 찾았습니다.',
      username: user.username
    });

  } catch (error) {
    console.error('사용자명 찾기 오류:', error);
    return NextResponse.json(
      { error: '사용자명 찾기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}