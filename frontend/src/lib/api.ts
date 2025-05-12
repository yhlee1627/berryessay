const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Essay {
  id: string;
  title: string;
  content: string;
  daily_essay_date: string;
  user_id: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  is_submitted: boolean;
  topic_id: string;
}

export interface Correction {
  id: string;
  essay_id: string;
  category: 'grammar' | 'structure' | 'vocabulary' | 'flow';
  original_text: string;
  suggested_text: string;
  explanation: string;
  created_at: string;
  updated_at: string;
}

export interface CorrectionSession {
  session_number: number;
  corrections: Correction[];
  overall_feedback: string;
}

export interface EssayTopic {
  id: string;
  topic: string;
  reading_material: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateEssayData {
  title: string;
  content: string;
  daily_essay_date: string;
  plain_text?: string;
  topic_id: string;
}

export async function createEssay(userId: string, data: CreateEssayData): Promise<Essay> {
  const response = await fetch(`${API_BASE_URL}/essays/?user_id=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create essay');
  }

  return response.json();
}

export async function getEssays(userId: string): Promise<Essay[]> {
  const response = await fetch(`${API_BASE_URL}/essays/?user_id=${userId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch essays');
  }

  return response.json();
}

export async function getEssay(essayId: string, userId: string): Promise<Essay> {
  try {
    const response = await fetch(`${API_BASE_URL}/essays/${essayId}?user_id=${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch essay');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching essay:', error);
    throw error;
  }
}

export async function getCorrections(essayId: string): Promise<Correction[]> {
  const response = await fetch(`${API_BASE_URL}/corrections/${essayId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch corrections');
  }

  return response.json();
}

export async function createCorrection(essayId: string): Promise<Correction[]> {
  const response = await fetch(`${API_BASE_URL}/corrections/?essay_id=${essayId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create correction');
  }

  return response.json();
}

export async function updateEssay(essayId: string, data: { content: string; user_id: string; title: string }): Promise<Essay> {
  const response = await fetch(`${API_BASE_URL}/essays/${essayId}?user_id=${data.user_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: data.content, title: data.title }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update essay');
  }

  return response.json();
}

export async function getCorrectionSessions(essayId: string): Promise<CorrectionSession[]> {
  const response = await fetch(`${API_BASE_URL}/corrections/sessions/${essayId}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch correction sessions');
  }
  return response.json();
}

export async function createCorrectionSession(essayId: string): Promise<CorrectionSession> {
  const response = await fetch(`${API_BASE_URL}/corrections/sessions?essay_id=${essayId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create correction session');
  }
  return response.json();
}

export async function getCurrentEssayTopic(): Promise<EssayTopic> {
  const response = await fetch(`${API_BASE_URL}/essay-topic/current`);
  if (!response.ok) {
    throw new Error('에세이 주제를 불러오는데 실패했습니다.');
  }
  return response.json();
}

// 어드민: 현재 활성화된 에세이 주제/읽을거리 조회
export async function getAdminEssayTopic(id?: string): Promise<EssayTopic | null> {
  const endpoint = id ? `${API_BASE_URL}/api/admin/essay-topic?id=${id}` : `${API_BASE_URL}/api/admin/essay-topic`;
  const response = await fetch(endpoint);
  if (!response.ok) return null;
  const data = await response.json();
  
  if (id) {
    // ID로 특정 주제 조회
    return Array.isArray(data) ? data.find((t) => t.id === id) || null : null;
  } else {
    // 활성화된 주제 조회
    return Array.isArray(data) ? data.find((t) => t.is_active) || null : null;
  }
}

// 어드민: 에세이 주제/읽을거리 저장
export async function setAdminEssayTopic(
  topic: string,
  readingMaterial: string,
  topicId?: string,
  isActive: boolean = true
): Promise<boolean> {
  const endpoint = `${API_BASE_URL}/api/admin/essay-topic`;
  const method = topicId ? 'PUT' : 'POST';
  const body = topicId
    ? { id: topicId, topic, reading_material: readingMaterial, is_active: isActive }
    : { topic, reading_material: readingMaterial, is_active: isActive };

  console.log('[setAdminEssayTopic] 요청 body:', body);

  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.ok;
}

// 어드민: 에세이 주제 전체 목록 조회
export async function getAdminEssayTopics(): Promise<EssayTopic[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/essay-topic`);
  if (!response.ok) return [];
  return response.json();
}

// 어드민: 에세이 주제 삭제
export async function deleteAdminEssayTopic(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/admin/essay-topic?id=${id}`, {
    method: 'DELETE',
  });
  return response.ok;
}

// 사용자: 활성화된 에세이 주제 목록 조회
export async function getActiveEssayTopics(): Promise<EssayTopic[]> {
  const response = await fetch(`${API_BASE_URL}/essay-topic/`);
  if (!response.ok) {
    throw new Error('에세이 주제 목록을 불러오는데 실패했습니다.');
  }
  const topics = await response.json();
  return topics.filter((topic: EssayTopic) => topic.is_active);
}

// 어드민: 에세이 주제 활성/비활성 토글
export async function setAdminEssayTopicActive(topicId: string, isActive: boolean): Promise<boolean> {
  const endpoint = `${API_BASE_URL}/api/admin/essay-topic`;
  const response = await fetch(endpoint, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id: topicId, is_active: isActive }),
  });
  return response.ok;
}

// 로그아웃
export function logout() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('role');
  window.location.href = '/login';
}

// 회원관리 API
export interface User {
  id: string;
  username: string;
  name?: string;
  role: string;
  password?: string;
}

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/api/auth/users`, { credentials: 'include' });
  if (!res.ok) throw new Error('회원 목록을 불러오지 못했습니다');
  const users = await res.json();
  return users.map((u: Record<string, unknown>) => ({ ...u, name: u.name || '베리베리' }));
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('회원 정보 수정 실패');
  const user = await res.json();
  return { ...user, name: user.name || '베리베리' };
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('회원 삭제 실패');
}

export async function createUser(data: { username: string; password: string; role: string }): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('회원 추가 실패');
  return res.json();
} 