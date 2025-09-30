import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { getUsers } from '@/lib/users';

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const users = await getUsers();

    // 비밀번호 정보 제외하고 반환
    const safeUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    }));

    return NextResponse.json({
      users: safeUsers,
      total: safeUsers.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: '회원 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}