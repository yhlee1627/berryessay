import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:8000'; // FastAPI 서버 주소

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  let url = `${API_BASE_URL}/essay-topic/`;
  
  if (id) {
    // 특정 ID 주제를 가져옴 - 백엔드에 해당 기능이 없으므로 전체 목록에서 필터링
    const res = await fetch(url);
    const allTopics = await res.json();
    
    return NextResponse.json(allTopics, { status: res.status });
  } else {
    // 모든 주제 가져오기
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/essay-topic/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID가 필요합니다' }, { status: 400 });
  }
  
  try {
    const res = await fetch(`${API_BASE_URL}/essay-topic/${id}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: error.detail || '삭제 실패' }, { status: res.status });
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting essay topic:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
} 

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, is_active } = body;

  if (!id || typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'id와 is_active가 필요합니다.' }, { status: 400 });
  }

  // FastAPI 서버에 PATCH 요청
  const res = await fetch(`${API_BASE_URL}/essay-topic/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active }),
  });

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json({ error: error.detail || '업데이트 실패' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 200 });
} 