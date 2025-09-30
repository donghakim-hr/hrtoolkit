import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/lib/users';

// 이메일 형식 검증 함수
function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 이메일 도메인 검증 함수 (간단한 검증)
function isValidEmailDomain(email: string): boolean {
  const domain = email.split('@')[1];
  if (!domain) return false;

  // 일반적인 유효하지 않은 도메인들 체크
  const invalidDomains = [
    'example.com',
    'test.com',
    'localhost',
    'invalid.com',
    'fake.com'
  ];

  return !invalidDomains.includes(domain.toLowerCase());
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { valid: false, available: false, message: '이메일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    if (!isValidEmailFormat(email)) {
      return NextResponse.json({
        valid: false,
        available: false,
        message: '올바른 이메일 형식이 아닙니다.'
      });
    }

    // 이메일 도메인 검증
    if (!isValidEmailDomain(email)) {
      return NextResponse.json({
        valid: false,
        available: false,
        message: '유효하지 않은 이메일 도메인입니다.'
      });
    }

    // 기존 사용자와 중복 체크
    const users = await getUsers();
    const emailExists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      return NextResponse.json({
        valid: true,
        available: false,
        message: '이미 사용중인 이메일입니다.'
      });
    }

    // 모든 검증 통과
    return NextResponse.json({
      valid: true,
      available: true,
      message: '사용 가능한 이메일입니다.'
    });

  } catch (error) {
    console.error('Email validation error:', error);
    return NextResponse.json(
      { valid: false, available: false, message: '이메일 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}