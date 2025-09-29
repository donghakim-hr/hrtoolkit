import { cookies } from 'next/headers';
import { UserSession } from '@/types/user';

export const ADMIN_SESSION_COOKIE = 'hr-toolkit-admin-session';
export const USER_SESSION_COOKIE = 'hr-toolkit-user-session';

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);

  if (!session) return false;

  try {
    const sessionData = JSON.parse(session.value);
    const expiresAt = new Date(sessionData.expiresAt);
    return new Date() < expiresAt;
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.');
    return false;
  }
  return password === adminPassword;
}

export function createAdminSession(): string {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24시간 유효

  return JSON.stringify({
    isAdmin: true,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString()
  });
}

// 사용자 세션 관련 함수들
export async function checkUserAuth(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(USER_SESSION_COOKIE);

  if (!session) return null;

  try {
    const sessionData = JSON.parse(session.value);
    const expiresAt = new Date(sessionData.expiresAt);

    if (new Date() >= expiresAt) {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

export function createUserSession(user: { id: string; username: string; name: string; email: string }): string {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7일 유효

  return JSON.stringify({
    userId: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    isLoggedIn: true,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString()
  });
}