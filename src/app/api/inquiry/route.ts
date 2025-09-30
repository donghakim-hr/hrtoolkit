import { NextRequest, NextResponse } from 'next/server';
import { createInquiry, readInquiries } from '@/lib/inquiry';
import { CreateInquiryRequest, Inquiry } from '@/types/inquiry';
import { getUsers } from '@/lib/users';

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateInquiryRequest = await request.json();
    const { name, email, subject, content } = body;

    // 입력값 검증
    if (!name || !email || !subject || !content) {
      return NextResponse.json(
        {
          success: false,
          message: '모든 필수 입력 항목을 작성해주세요.'
        },
        { status: 400 }
      );
    }

    // 입력값 정리
    const sanitizedName = sanitizeString(name);
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedSubject = sanitizeString(subject);
    const sanitizedContent = content.trim();

    // 이메일 형식 검증
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: '올바른 이메일 형식을 입력해주세요.'
        },
        { status: 400 }
      );
    }

    // 길이 제한 검증
    if (sanitizedName.length > 50) {
      return NextResponse.json(
        {
          success: false,
          message: '이름은 50자 이내로 입력해주세요.'
        },
        { status: 400 }
      );
    }

    if (sanitizedSubject.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: '제목은 100자 이내로 입력해주세요.'
        },
        { status: 400 }
      );
    }

    if (sanitizedContent.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message: '문의 내용은 2000자 이내로 입력해주세요.'
        },
        { status: 400 }
      );
    }

    // 사용자 등록 여부 확인
    const users = await getUsers();
    const registeredUser = users.find(user => user.email.toLowerCase() === sanitizedEmail);

    const inquiryData: Omit<Inquiry, 'id' | 'createdAt' | 'updatedAt'> = {
      name: sanitizedName,
      email: sanitizedEmail,
      subject: sanitizedSubject,
      content: sanitizedContent,
      isRegistered: !!registeredUser,
      userId: registeredUser?.id,
      status: 'pending'
    };

    const newInquiry = createInquiry(inquiryData);

    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 답변드리겠습니다.',
      inquiryId: newInquiry.id
    });

  } catch (error) {
    console.error('Inquiry creation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as Inquiry['status'] | null;

    let inquiries = readInquiries();

    // 사용자별 필터링
    if (userId) {
      inquiries = inquiries.filter(inquiry => inquiry.userId === userId);
    }

    // 상태별 필터링
    if (status) {
      inquiries = inquiries.filter(inquiry => inquiry.status === status);
    }

    // 최신순 정렬
    inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      inquiries
    });

  } catch (error) {
    console.error('Inquiry fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '문의 목록을 불러오는 중 오류가 발생했습니다.'
      },
      { status: 500 }
    );
  }
}