import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername, updateUserPassword } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const { username, newPassword } = await request.json();

    if (!username || !newPassword) {
      return NextResponse.json(
        { error: '사용자명과 새 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 검증 (6자 이상)
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const user = await findUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: '존재하지 않는 사용자명입니다.' },
        { status: 404 }
      );
    }

    const success = await updateUserPassword(user.id, newPassword);

    if (!success) {
      return NextResponse.json(
        { error: '비밀번호 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    return NextResponse.json(
      { error: '비밀번호 재설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}