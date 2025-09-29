import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { getNotices, addNotice } from '@/lib/notices';

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json(
      { error: '관리자 권한이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const notices = await getNotices();
    return NextResponse.json(notices);
  } catch (error) {
    console.error('공지사항 조회 오류:', error);
    return NextResponse.json(
      { error: '공지사항을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json(
      { error: '관리자 권한이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const noticeData = await request.json();

    // 필수 필드 검증
    if (!noticeData.title || !noticeData.content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수입니다.' },
        { status: 400 }
      );
    }

    // 기본값 설정
    const notice = {
      date: new Date().toISOString().split('T')[0],
      type: 'notice' as const,
      important: false,
      ...noticeData
    };

    const newNotice = await addNotice(notice);
    return NextResponse.json(newNotice, { status: 201 });
  } catch (error) {
    console.error('공지사항 생성 오류:', error);
    return NextResponse.json(
      { error: '공지사항을 생성하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}