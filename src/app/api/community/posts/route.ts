import { NextRequest, NextResponse } from 'next/server';
import { createPost, getPostsByBoard, generateAnonymousName } from '@/lib/community';
import { checkUserAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const boardType = searchParams.get('board') as 'free-board' | 'hr-chat';

    if (!boardType || !['free-board', 'hr-chat'].includes(boardType)) {
      return NextResponse.json(
        { error: '올바른 게시판 타입이 필요합니다.' },
        { status: 400 }
      );
    }

    const posts = getPostsByBoard(boardType);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: '게시글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, boardType, isAnonymous } = body;

    // Validation
    if (!title?.trim() || !content?.trim() || !boardType) {
      return NextResponse.json(
        { error: '제목, 내용, 게시판 타입을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!['free-board', 'hr-chat'].includes(boardType)) {
      return NextResponse.json(
        { error: '올바른 게시판 타입이 아닙니다.' },
        { status: 400 }
      );
    }

    // Check if user is logged in
    const userSession = await checkUserAuth();

    let author: string;
    let authorId: string | undefined;

    if (userSession) {
      // Logged in user
      if (isAnonymous) {
        author = generateAnonymousName();
        authorId = undefined;
      } else {
        author = userSession.name;
        authorId = userSession.userId;
      }
    } else {
      // Non-member post
      author = generateAnonymousName();
      authorId = undefined;
    }

    const post = createPost({
      title: title.trim(),
      content: content.trim(),
      author,
      authorId,
      boardType,
      isAnonymous: isAnonymous || !userSession
    });

    return NextResponse.json({
      success: true,
      post,
      message: '게시글이 성공적으로 작성되었습니다.'
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: '게시글 작성에 실패했습니다.' },
      { status: 500 }
    );
  }
}