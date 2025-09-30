import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { SavedCalculation } from '@/types';
import { checkUserAuth } from '@/lib/auth';

const calculationsFilePath = path.join(process.cwd(), 'src/data/calculations.json');

// 특정 계산 결과 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkUserAuth();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { id } = params;

    // 계산 결과 로드
    let calculations: SavedCalculation[] = [];
    try {
      const fileContent = fs.readFileSync(calculationsFilePath, 'utf-8');
      calculations = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json({ error: '계산 결과를 찾을 수 없습니다' }, { status: 404 });
    }

    // 해당 ID의 계산 결과 찾기
    const calculation = calculations.find(calc => calc.id === id && calc.userId === user.userId);

    if (!calculation) {
      return NextResponse.json({ error: '계산 결과를 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json(calculation);

  } catch (error) {
    console.error('계산 결과 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// 계산 결과 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await checkUserAuth();
    if (!user) {
      return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { id } = params;

    // 계산 결과 로드
    let calculations: SavedCalculation[] = [];
    try {
      const fileContent = fs.readFileSync(calculationsFilePath, 'utf-8');
      calculations = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json({ error: '계산 결과를 찾을 수 없습니다' }, { status: 404 });
    }

    // 해당 ID의 계산 결과 찾기
    const calculationIndex = calculations.findIndex(calc => calc.id === id && calc.userId === user.userId);

    if (calculationIndex === -1) {
      return NextResponse.json({ error: '계산 결과를 찾을 수 없습니다' }, { status: 404 });
    }

    // 계산 결과 삭제
    calculations.splice(calculationIndex, 1);

    // 파일에 저장
    fs.writeFileSync(calculationsFilePath, JSON.stringify(calculations, null, 2));

    return NextResponse.json({ message: '계산 결과가 삭제되었습니다' });

  } catch (error) {
    console.error('계산 결과 삭제 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}