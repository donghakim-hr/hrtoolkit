import fs from 'fs';
import path from 'path';
import { User, RegisterData, LoginCredentials } from '@/types/user';

const USERS_FILE_PATH = path.join(process.cwd(), 'src/data/users.json');

// 간단한 해시 함수 (실제 프로덕션에서는 bcrypt 사용 권장)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  return Math.abs(hash).toString(16);
}

export async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.promises.readFile(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('사용자 데이터 읽기 오류:', error);
    return [];
  }
}

export async function saveUsers(users: User[]): Promise<void> {
  try {
    await fs.promises.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('사용자 데이터 저장 오류:', error);
    throw error;
  }
}

export async function registerUser(userData: RegisterData): Promise<User> {
  const users = await getUsers();

  // 중복 검사 (이메일 기반)
  const existingUser = users.find(
    user => user.email.toLowerCase() === userData.email.toLowerCase()
  );

  if (existingUser) {
    throw new Error('이미 사용중인 이메일입니다.');
  }

  // 사용자명 중복 검사
  const existingUsername = users.find(
    user => user.username === userData.username
  );

  if (existingUsername) {
    throw new Error('이미 사용중인 아이디입니다.');
  }

  // 닉네임 중복 검사
  const existingNickname = users.find(
    user => user.nickname === userData.nickname
  );

  if (existingNickname) {
    throw new Error('이미 사용중인 닉네임입니다.');
  }

  const newUser: User = {
    id: Date.now().toString(),
    username: userData.username,
    email: userData.email,
    password: simpleHash(userData.password),
    name: userData.name,
    birthDate: userData.birthDate,
    nickname: userData.nickname,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  return newUser;
}

export async function authenticateUser(credentials: LoginCredentials): Promise<User | null> {
  const users = await getUsers();
  const hashedPassword = simpleHash(credentials.password);

  const user = users.find(
    user => user.username === credentials.username && user.password === hashedPassword
  );

  if (user) {
    // 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date().toISOString();
    await saveUsers(users);
  }

  return user || null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.username === username) || null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.email === email) || null;
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const users = await getUsers();
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex === -1) {
    return false;
  }

  users[userIndex].password = simpleHash(newPassword);
  await saveUsers(users);

  return true;
}