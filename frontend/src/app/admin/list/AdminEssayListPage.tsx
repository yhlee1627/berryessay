'use client';

import { useEffect, useState } from 'react';
import { getAdminEssayTopics, EssayTopic, deleteAdminEssayTopic, logout, setAdminEssayTopicActive } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminEssayListPage() {
  const [topics, setTopics] = useState<EssayTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');
    if (!userId || role !== 'admin') {
      router.replace('/login');
    }
    fetchTopics();
  }, [router]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await getAdminEssayTopics();
      setTopics(data);
    } catch (err) {
      setError('주제 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (topicId: string) => {
    router.push(`/admin/topics?mode=edit&id=${topicId}`);
  };

  const handleDelete = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!window.confirm('정말로 이 주제를 삭제하시겠습니까?')) return;
    setDeleteLoading(topicId);
    try {
      // 1. reading_material에서 이미지 URL 추출
      if (topic && topic.reading_material) {
        const urls = Array.from(topic.reading_material.matchAll(/src=["']([^"']+\/image\/[^"']+)["']/g)).map(m => m[1]);
        for (const url of urls) {
          const fileName = url.split('/').slice(-1)[0];
          await supabase.storage.from('image').remove([fileName]);
        }
      }
      // 2. DB row 삭제
      const success = await deleteAdminEssayTopic(topicId);
      if (success) {
        // 삭제 성공 시 목록 갱신
        await fetchTopics();
      } else {
        alert('주제 삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('주제 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleToggleActive = async (topicId: string, isActive: boolean) => {
    try {
      await setAdminEssayTopicActive(topicId, !isActive);
      await fetchTopics();
    } catch (err) {
      alert('활성화 상태 변경에 실패했습니다.');
    }
  };

  // HTML 태그 제거 및 30자 이내로 자르기 함수 추가
  function getPreviewText(html: string, maxLength = 30) {
    if (!html) return '';
    const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#222', margin: 0 }}>에세이 주제 전체 목록</h2>
        <button
          onClick={() => router.push('/admin/topics?mode=new')}
          style={{
            padding: '8px 20px',
            background: '#a78bfa',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(167,139,250,0.10)',
            transition: 'background 0.2s',
            fontSize: 16,
            height: 40,
            display: 'flex',
            alignItems: 'center'
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#7c3aed')}
          onMouseOut={e => (e.currentTarget.style.background = '#a78bfa')}
        >
          새 주제 만들기
        </button>
      </div>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32 }}>
          {topics.map((topic) => (
            <div
              key={topic.id}
              style={{
                flex: '1 1 260px',
                minWidth: 260,
                maxWidth: 340,
                background: '#fff',
                border: '1.5px solid #ede9fe',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(167,139,250,0.10)',
                padding: 28,
                marginBottom: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, border 0.2s',
              }}
              onClick={() => handleEdit(topic.id)}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(124,58,237,0.13)';
                (e.currentTarget as HTMLDivElement).style.border = '1.5px solid #a78bfa';
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(167,139,250,0.10)';
                (e.currentTarget as HTMLDivElement).style.border = '1.5px solid #ede9fe';
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 20, color: '#7c3aed', marginBottom: 4 }}>{topic.topic}</div>
              <div style={{ fontSize: 15, color: '#6d28d9', marginBottom: 4 }}>{new Date(topic.created_at).toLocaleDateString('ko-KR')}</div>
              <div style={{ fontSize: 15, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{getPreviewText(topic.reading_material, 30)}</div>
              <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 12 }}>
                <button
                  onClick={e => { e.stopPropagation(); handleEdit(topic.id); }}
                  style={{ flex: 1, padding: '10px 0', background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = '#e0e7ff'}
                  onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = '#ede9fe'}
                >수정</button>
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(topic.id); }}
                  disabled={deleteLoading === topic.id}
                  style={{ flex: 1, padding: '10px 0', background: '#f5f3ff', color: '#a78bfa', border: '1.5px solid #c4b5fd', borderRadius: 8, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', opacity: deleteLoading === topic.id ? 0.5 : 1 }}
                  onMouseOver={e => (e.currentTarget as HTMLButtonElement).style.background = '#ede9fe'}
                  onMouseOut={e => (e.currentTarget as HTMLButtonElement).style.background = '#f5f3ff'}
                >{deleteLoading === topic.id ? '삭제 중...' : '삭제'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 