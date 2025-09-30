export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // 실제로는 해시된 비밀번호
  name: string;
  birthDate: string; // YYYY-MM-DD 형식
  nickname: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  birthDate: string;
  nickname: string;
}

export interface UserSession {
  userId: string;
  username: string;
  name: string;
  email: string;
  nickname: string;
  isLoggedIn: boolean;
}