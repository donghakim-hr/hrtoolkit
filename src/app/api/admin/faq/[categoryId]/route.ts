import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { updateFaqCategory, deleteFaqCategory } from '@/lib/faq';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
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
    const categoryId = resolvedParams.categoryId;
    const body = await request.json();

    const updatedCategory = updateFaqCategory(categoryId, body);

    return NextResponse.json({
      success: true,
      message: 'FAQ 카테고리가 수정되었습니다.',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating FAQ category:', error);
    return NextResponse.json(
      { error: 'FAQ 카테고리 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
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
    const categoryId = resolvedParams.categoryId;

    deleteFaqCategory(categoryId);

    return NextResponse.json({
      success: true,
      message: 'FAQ 카테고리가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Error deleting FAQ category:', error);
    return NextResponse.json(
      { error: 'FAQ 카테고리 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}