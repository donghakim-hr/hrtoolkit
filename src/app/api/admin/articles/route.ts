import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const ARTICLES_PATH = path.join(process.cwd(), 'src/data/articles.json');

function readArticles() {
  return JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));
}

export async function GET() {
  if (!(await checkAdminAuth())) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  }
  try {
    return NextResponse.json(readArticles());
  } catch {
    return NextResponse.json({ error: '아티클 조회 실패' }, { status: 500 });
  }
}
