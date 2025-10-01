import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/users-supabase';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    // 입력 검증
    if (!username) {
      return NextResponse.json(
        { error: '사용자명을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자명 형식 검증 (3-20자, 영숫자)
    if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
      return NextResponse.json(
        { 
          available: false,
          error: '사용자명은 3-20자의 영문, 숫자만 사용 가능합니다.' 
        },
        { status: 400 }
      );
    }

    // 중복 확인
    const existingUser = await findUserByUsername(username);

    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: '이미 사용중인 아이디입니다.'
      });
    }

    return NextResponse.json({
      available: true,
      message: '사용 가능한 아이디입니다.'
    });

  } catch (error) {
    console.error('아이디 중복확인 오류:', error);
    return NextResponse.json(
      { error: '아이디 중복확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}