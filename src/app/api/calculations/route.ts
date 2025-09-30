import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SavedCalculation } from '@/types';
import { checkUserAuth } from '@/lib/auth';

const calculationsFilePath = path.join(process.cwd(), 'src/data/calculations.json');

// 계산 결과 저장
export async function POST(request: NextRequest) {
  try {
    const user = await checkUserAuth();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const { type, title, data } = body;

    if (!type || !title || !data) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다' }, { status: 400 });
    }

    // 기존 계산 결과 로드
    let calculations: SavedCalculation[] = [];
    try {
      const fileContent = fs.readFileSync(calculationsFilePath, 'utf-8');
      calculations = JSON.parse(fileContent);
    } catch (error) {
      // 파일이 없으면 빈 배열로 시작
      calculations = [];
    }

    // 새로운 계산 결과 생성
    const newCalculation: SavedCalculation = {
      id: Date.now().toString(),
      userId: user.userId,
      type,
      title,
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    calculations.push(newCalculation);

    // 파일에 저장
    fs.writeFileSync(calculationsFilePath, JSON.stringify(calculations, null, 2));

    return NextResponse.json({
      message: '계산 결과가 저장되었습니다',
      id: newCalculation.id
    });

  } catch (error) {
    console.error('계산 결과 저장 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 사용자의 계산 결과 목록 조회
export async function GET(request: NextRequest) {
  try {
    const user = await checkUserAuth();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // 계산 결과 로드
    let calculations: SavedCalculation[] = [];
    try {
      const fileContent = fs.readFileSync(calculationsFilePath, 'utf-8');
      calculations = JSON.parse(fileContent);
    } catch (error) {
      calculations = [];
    }

    // 사용자의 계산 결과만 필터링
    let userCalculations = calculations.filter(calc => calc.userId === user.userId);

    // 타입별 필터링 (선택사항)
    if (type) {
      userCalculations = userCalculations.filter(calc => calc.type === type);
    }

    // 최신순으로 정렬
    userCalculations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(userCalculations);

  } catch (error) {
    console.error('계산 결과 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}