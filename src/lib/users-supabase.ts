import { supabaseAdmin } from './supabase';
import { User } from './supabase';
import bcrypt from 'bcrypt';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  birthDate: string;
  nickname: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const SALT_ROUNDS = 12;

// 비밀번호 해시 함수
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// 비밀번호 검증 함수
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// 모든 사용자 조회
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('사용자 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('사용자 조회 중 오류:', error);
    return [];
  }
}

// 사용자 등록
export async function registerUser(userData: RegisterData): Promise<User> {
  try {
    // 이메일 중복 검사
    const { data: existingEmailUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', userData.email.toLowerCase())
      .single();

    if (existingEmailUser) {
      throw new Error('이미 사용중인 이메일입니다.');
    }

    // 사용자명 중복 검사
    const { data: existingUsernameUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', userData.username)
      .single();

    if (existingUsernameUser) {
      throw new Error('이미 사용중인 아이디입니다.');
    }

    // 닉네임 중복 검사
    const { data: existingNicknameUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('nickname', userData.nickname)
      .single();

    if (existingNicknameUser) {
      throw new Error('이미 사용중인 닉네임입니다.');
    }

    // 비밀번호 해시화
    const passwordHash = await hashPassword(userData.password);

    // 사용자 생성
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        username: userData.username,
        email: userData.email.toLowerCase(),
        password_hash: passwordHash,
        name: userData.name,
        birth_date: userData.birthDate,
        nickname: userData.nickname,
      })
      .select()
      .single();

    if (error) {
      console.error('사용자 생성 오류:', error);
      throw new Error('회원가입 중 오류가 발생했습니다.');
    }

    return newUser;
  } catch (error) {
    console.error('회원가입 오류:', error);
    throw error;
  }
}

// 사용자 인증
export async function authenticateUser(credentials: LoginCredentials): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', credentials.username)
      .single();

    if (error || !user) {
      return null;
    }

    // 비밀번호 검증
    const isValidPassword = await verifyPassword(credentials.password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }

    // 마지막 로그인 시간 업데이트
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    return user;
  } catch (error) {
    console.error('사용자 인증 오류:', error);
    return null;
  }
}

// 사용자명으로 사용자 찾기
export async function findUserByUsername(username: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('사용자명으로 검색 오류:', error);
    return null;
  }
}

// 이메일로 사용자 찾기
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('이메일로 검색 오류:', error);
    return null;
  }
}

// 사용자 비밀번호 업데이트
export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(newPassword);

    const { error } = await supabaseAdmin
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);

    if (error) {
      console.error('비밀번호 업데이트 오류:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('비밀번호 업데이트 중 오류:', error);
    return false;
  }
}

// 사용자 ID로 조회
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('사용자 ID로 검색 오류:', error);
    return null;
  }
}