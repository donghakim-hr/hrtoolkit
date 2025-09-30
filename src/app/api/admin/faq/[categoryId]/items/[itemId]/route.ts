import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { updateFaqItem, deleteFaqItem } from '@/lib/faq';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string; itemId: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { categoryId, itemId } = resolvedParams;
    const body = await request.json();

    const updatedItem = updateFaqItem(categoryId, itemId, body);

    return NextResponse.json({
      success: true,
      message: 'FAQ 항목이 수정되었습니다.',
      item: updatedItem
    });
  } catch (error) {
    console.error('Error updating FAQ item:', error);
    return NextResponse.json(
      { error: 'FAQ 항목 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string; itemId: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { categoryId, itemId } = resolvedParams;

    deleteFaqItem(categoryId, itemId);

    return NextResponse.json({
      success: true,
      message: 'FAQ 항목이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting FAQ item:', error);
    return NextResponse.json(
      { error: 'FAQ 항목 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}