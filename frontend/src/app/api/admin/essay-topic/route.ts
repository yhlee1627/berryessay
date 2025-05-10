import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    const url = `${API_BASE_URL}/essay-topic/`;
    
    if (id) {
      // 특정 ID 주제를 가져옴 - 백엔드에 해당 기능이 없으므로 전체 목록에서 필터링
      const res = await fetch(url);
      
      if (!res.ok) {
        const error = await res.json();
        return NextResponse.json(
          { error: error.detail || '주제를 불러오는데 실패했습니다.' },
          { status: res.status }
        );
      }
      
      const allTopics = await res.json();
      return NextResponse.json(allTopics, { status: 200 });
    } else {
      // 모든 주제 가져오기
      const res = await fetch(url);
      
      if (!res.ok) {
        const error = await res.json();
        return NextResponse.json(
          { error: error.detail || '주제 목록을 불러오는데 실패했습니다.' },
          { status: res.status }
        );
      }
      
      const data = await res.json();
      return NextResponse.json(data, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching essay topics:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/essay-topic/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.detail || '주제 생성에 실패했습니다.' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating essay topic:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    const res = await fetch(`${API_BASE_URL}/essay-topic/${id}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.detail || '삭제 실패' },
        { status: res.status }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting essay topic:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (!id || typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'id와 is_active가 필요합니다.' },
        { status: 400 }
      );
    }

    const res = await fetch(`${API_BASE_URL}/essay-topic/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active }),
    });

    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json(
        { error: error.detail || '업데이트 실패' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error updating essay topic:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 