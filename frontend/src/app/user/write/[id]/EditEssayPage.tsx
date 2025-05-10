'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEssay, updateEssay, Essay, getAdminEssayTopic, EssayTopic } from '@/lib/api';
import React from 'react';

export default function EditEssayPage({ params }: { params: { id: string } }) {
  // Next.js의 최신 버전에서는 params가 Promise가 될 수 있으므로 직접 접근을 권장하지 않습니다
  // 현재 버전에서는 아직 직접 접근이 지원되므로 타입 단언을 사용합니다
  const id = params.id;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [essay, setEssay] = useState<Essay | null>(null);
  const [topic, setTopic] = useState<EssayTopic | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchEssay() {
      try {
        setLoading(true);
        // 임시로 하드코딩된 사용자 ID 사용
        const userId = '123e4567-e89b-12d3-a456-426614174000';
        const data = await getEssay(id, userId);
        setEssay(data);
        setTitle(data.title);
        setContent(data.content);
        // 에세이의 topic_id로 주제 정보도 불러오기
        if (data.topic_id) {
          const topicData = await getAdminEssayTopic(data.topic_id);
          setTopic(topicData);
          // 읽을거리 값 로그 출력
          if (topicData && topicData.reading_material) {
            console.log('읽을거리 raw:', topicData.reading_material);
          }
        }
      } catch (err) {
        console.error('에세이를 불러오는 중 오류 발생:', err);
        setError('에세이를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchEssay();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !essay) {
      setError('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateEssay(id, {
        title,
        content,
        user_id: essay.user_id
      });
      
      // 수정 성공 시 상세 페이지로 이동
      router.push(`/user/essays/${id}`);
    } catch (err) {
      console.error('에세이 수정 중 오류 발생:', err);
      setError('에세이 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded mb-8"></div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="h-10 bg-gray-200 rounded mb-6"></div>
              <div className="h-40 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !essay) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
            {error}
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/user')}
              className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">에세이 수정</h1>
          <button
            onClick={() => router.push(`/user/essays/${id}`)}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            돌아가기
          </button>
        </div>
        {/* 읽을거리(주제 정보) 표시 */}
        {topic && (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow border border-gray-100">
            <div className="text-xs text-gray-500 mb-2">현재 수정 중인 주제</div>
            <h2 className="text-xl font-bold mb-2">{topic.topic}</h2>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: topic.reading_material }} />
            <div className="text-xs text-gray-400 mt-4">
              (최종수정: {new Date(topic.updated_at).toLocaleString('ko-KR')})
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="에세이 제목을 입력하세요"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={15}
              placeholder="에세이 내용을 입력하세요"
              required
            />
          </div>
          
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 