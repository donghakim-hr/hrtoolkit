import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import { readPosts, writePosts } from '@/lib/community';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 권한 확인
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json(
        { error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const posts = readPosts();
    const postIndex = posts.findIndex(post => post.id === id);

    if (postIndex === -1) {
      return NextResponse.json(
        { error: '게시글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const deletedPost = posts[postIndex];
    posts.splice(postIndex, 1);
    writePosts(posts);

    return NextResponse.json({
      success: true,
      message: '게시글이 성공적으로 삭제되었습니다.',
      deletedPost: {
        id: deletedPost.id,
        title: deletedPost.title,
        boardType: deletedPost.boardType
      }
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: '게시글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}