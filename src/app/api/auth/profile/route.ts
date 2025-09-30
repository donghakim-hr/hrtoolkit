import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { checkUserAuth, createUserSession, USER_SESSION_COOKIE } from '@/lib/auth';

const usersFilePath = path.join(process.cwd(), 'src/data/users.json');

export async function PUT(request: NextRequest) {
  try {
    const user = await checkUserAuth();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json({ error: '이름과 이메일은 필수 입력사항입니다' }, { status: 400 });
    }

    // 사용자 데이터 로드
    interface User {
      id: string;
      username: string;
      name: string;
      email: string;
      password: string;
      birthDate?: string;
      nickname?: string;
      createdAt: string;
      lastLoginAt?: string;
      updatedAt?: string;
    }

    let users: User[] = [];
    try {
      const fileContent = fs.readFileSync(usersFilePath, 'utf-8');
      users = JSON.parse(fileContent);
    } catch {
      return NextResponse.json({ error: '사용자 데이터를 찾을 수 없습니다' }, { status: 404 });
    }

    // 현재 사용자 찾기
    const userIndex = users.findIndex((u: User) => u.id === user.userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 });
    }

    // 이메일 중복 검사 (현재 사용자 제외)
    const emailExists = users.some((u: User, index: number) =>
      u.email === email && index !== userIndex
    );
    if (emailExists) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다' }, { status: 400 });
    }

    // 사용자 정보 업데이트
    users[userIndex] = {
      ...users[userIndex],
      name,
      email,
      updatedAt: new Date().toISOString()
    };

    // 파일에 저장
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

    // 새로운 세션 생성 (업데이트된 정보 반영)
    const updatedUser = users[userIndex];
    const newSessionData = createUserSession({
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.name,
      email: updatedUser.email
    });

    const response = NextResponse.json({
      message: '프로필이 성공적으로 업데이트되었습니다',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });

    // 업데이트된 세션 쿠키 설정
    response.cookies.set(USER_SESSION_COOKIE, newSessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7일
    });

    return response;

  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}