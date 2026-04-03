import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const ARTICLES_PATH = path.join(process.cwd(), 'src/data/articles.json');

function readArticles() {
  return JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));
}

function writeArticles(articles: unknown[]) {
  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), 'utf-8');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const articles = readArticles();
  const idx = articles.findIndex((a: { id: number }) => a.id === Number(id));

  if (idx === -1) {
    return NextResponse.json({ error: '아티클을 찾을 수 없습니다.' }, { status: 404 });
  }

  articles[idx] = {
    ...articles[idx],
    ...body,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  writeArticles(articles);
  return NextResponse.json(articles[idx]);
}
