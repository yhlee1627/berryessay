"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAdminEssayTopic, createEssay, EssayTopic } from '@/lib/api';
import dynamic from 'next/dynamic';

const TuiEditor = dynamic(() => import('@/components/TuiEditor'), { ssr: false });

export default function WriteEssayPage() {
  const [topic, setTopic] = useState<EssayTopic | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const topicId = searchParams.get('topic_id');

  useEffect(() => {
    async function fetchTopic() {
      try {
        setLoading(true);
        if (!topicId) {
          setError('주제 ID가 없습니다.');
          return;
        }
        const data = await getAdminEssayTopic(topicId);
        if (!data) {
          setError('주제를 찾을 수 없습니다.');
          return;
        }
        setTopic(data);
      } catch (err) {
        console.error('에세이 주제를 불러오는데 실패했습니다:', err);
        setError('에세이 주제를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchTopic();
  }, [topicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic) return;

    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        router.push('/login');
        return;
      }

      await createEssay(userId, {
        title,
        content,
        daily_essay_date: new Date().toISOString().split('T')[0],
        topic_id: topic.id
      });

      router.push('/user');
    } catch (err) {
      console.error('에세이 저장에 실패했습니다:', err);
      setError('에세이 저장에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f8fa] to-[#e9edfb]">
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <div className="flex justify-between items-center mb-8 mt-0">
          <h1 className="text-2xl font-bold text-gray-900">에세이 작성</h1>
          <button
            onClick={() => router.push('/user')}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            돌아가기
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {topic && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {topic.topic}
            </h2>
            <div className="prose max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-2">읽을거리</h3>
              <div
                className="whitespace-pre-wrap text-gray-600"
                dangerouslySetInnerHTML={{ __html: topic.reading_material }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
              placeholder="에세이 제목을 입력하세요"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <TuiEditor
              initialValue={content}
              onChange={setContent}
              height="400px"
              previewStyle="vertical"
            />
            <div className="mt-2 text-sm text-gray-500 text-right">
              {content.length}자
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-[#a78bfa] rounded-md hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a78bfa]"
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 