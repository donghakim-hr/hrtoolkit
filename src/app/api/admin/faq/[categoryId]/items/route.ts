import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { createFaqItem } from '@/lib/faq';

export async function POST(
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
    const { question, answer, legal } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: '질문과 답변은 필수 입력사항입니다.' },
        { status: 400 }
      );
    }

    const newItem = createFaqItem(categoryId, {
      question,
      answer,
      legal: legal || ''
    });

    return NextResponse.json({
      success: true,
      message: 'FAQ 항목이 생성되었습니다.',
      item: newItem
    });
  } catch (error) {
    console.error('Error creating FAQ item:', error);
    return NextResponse.json(
      { error: 'FAQ 항목 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}