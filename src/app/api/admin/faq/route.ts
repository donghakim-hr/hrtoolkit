import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { readFaq, createFaqCategory } from '@/lib/faq';

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const faqData = readFaq();

    return NextResponse.json({
      faq: faqData,
      total: faqData.length
    });
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    return NextResponse.json(
      { error: 'FAQ 데이터를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, icon, color, bgColor } = body;

    if (!category || !icon || !color || !bgColor) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const newCategory = createFaqCategory({
      category,
      icon,
      color,
      bgColor
    });

    return NextResponse.json({
      success: true,
      message: 'FAQ 카테고리가 생성되었습니다.',
      category: newCategory
    });
  } catch (error) {
    console.error('Error creating FAQ category:', error);
    return NextResponse.json(
      { error: 'FAQ 카테고리 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}