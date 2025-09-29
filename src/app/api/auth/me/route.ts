import { NextResponse } from 'next/server';
import { checkUserAuth } from '@/lib/auth';
import { getUsers } from '@/lib/users';

export async function GET() {
  try {
    const userSession = await checkUserAuth();

    if (!userSession) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 실제 사용자 정보 가져오기
    const users = await getUsers();
    const currentUser = users.find(user => user.id === userSession.userId);

    if (!currentUser) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        username: currentUser.username,
        name: currentUser.name,
        email: currentUser.email,
        createdAt: currentUser.createdAt,
        lastLoginAt: currentUser.lastLoginAt || currentUser.createdAt
      }
    });

  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}