import { NextRequest, NextResponse } from 'next/server';
import { getPostById, incrementPostViews } from '@/lib/community';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const post = getPostById(id);

    if (!post) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // Increment view count
    incrementPostViews(id);

    return NextResponse.json({ post: { ...post, views: post.views + 1 } });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: '게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}