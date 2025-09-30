import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { readPosts } from '@/lib/community';

export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 확인
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const boardType = searchParams.get('board') as 'free-board' | 'hr-chat' | null;

    let posts = readPosts();

    // 게시판 타입별 필터링
    if (boardType && ['free-board', 'hr-chat'].includes(boardType)) {
      posts = posts.filter(post => post.boardType === boardType);
    }

    // 최신순 정렬
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      posts,
      total: posts.length,
      boardType: boardType || 'all'
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    return NextResponse.json(
      { error: '게시글 목록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}