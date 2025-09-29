import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { updateNotice, deleteNotice } from '@/lib/notices';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json(
      { error: '관리자 권한이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 ID입니다.' },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const updatedNotice = await updateNotice(id, updates);

    if (!updatedNotice) {
      return NextResponse.json(
        { error: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedNotice);
  } catch (error) {
    console.error('공지사항 수정 오류:', error);
    return NextResponse.json(
      { error: '공지사항을 수정하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json(
      { error: '관리자 권한이 필요합니다.' },
      { status: 401 }
    );
  }

  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: '유효하지 않은 ID입니다.' },
        { status: 400 }
      );
    }

    const deleted = await deleteNotice(id);

    if (!deleted) {
      return NextResponse.json(
        { error: '공지사항을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('공지사항 삭제 오류:', error);
    return NextResponse.json(
      { error: '공지사항을 삭제하는데 실패했습니다.' },
      { status: 500 }
    );
  }
}