'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveEssayTopics, EssayTopic } from '@/lib/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SelectTopicPage() {
  const [topics, setTopics] = useState<EssayTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchTopics() {
      try {
        setLoading(true);
        const data = await getActiveEssayTopics();
        setTopics(data);
      } catch (err) {
        console.error('에세이 주제를 불러오는데 실패했습니다:', err);
        setError('에세이 주제를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchTopics();
  }, []);

  const handleSelectTopic = (topicId: string) => {
    router.push(`/user/write?topic_id=${topicId}`);
  };

  function getPreviewText(html: string, maxLength = 30) {
    if (!html) return '';
    const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f8fa] to-[#e9edfb]">
      <button
        className="absolute top-6 left-6 z-10 flex items-center gap-1 text-gray-400 hover:text-[#7c3aed] text-lg font-semibold px-3 py-2 rounded transition"
        onClick={() => router.push('/user')}
        type="button"
      >
        <ArrowLeftIcon className="w-6 h-6" />
        <span className="hidden sm:inline">뒤로가기</span>
      </button>
      <main className="flex flex-col items-center gap-8 px-2 pb-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-8">에세이 주제 선택</h1>
        {error && (
          <div className="w-full max-w-md p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
            {error}
          </div>
        )}
        {loading ? (
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 animate-pulse max-w-sm mx-auto h-40" />
            ))}
          </div>
        ) : topics.length > 0 ? (
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="w-full bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-[#a78bfa] min-h-[220px]"
                onClick={() => handleSelectTopic(topic.id)}
              >
                <h2 className="font-bold text-lg text-gray-900 mb-2">{topic.topic}</h2>
                <div className="text-gray-700 text-sm whitespace-pre-wrap mb-2">
                  {getPreviewText(topic.reading_material, 30)}
                </div>
                <button
                  className="mt-2 px-4 py-2 rounded-full bg-[#a78bfa] text-white text-sm font-semibold hover:bg-[#7c3aed] transition self-end"
                  onClick={e => { e.stopPropagation(); handleSelectTopic(topic.id); }}
                >
                  이 주제로 선택
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 text-center mt-8">
            현재 활성화된 에세이 주제가 없습니다.
          </div>
        )}
      </main>
    </div>
  );
} 