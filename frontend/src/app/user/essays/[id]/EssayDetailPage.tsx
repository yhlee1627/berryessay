'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getEssay, createCorrectionSession, getCorrectionSessions, updateEssay, Essay, CorrectionSession, getAdminEssayTopic, EssayTopic } from '@/lib/api';

export default function EssayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [essay, setEssay] = useState<Essay | null>(null);
  const [sessions, setSessions] = useState<CorrectionSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [topic, setTopic] = useState<EssayTopic | null>(null);

  useEffect(() => {
    const fetchEssay = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          router.push('/login');
          return;
        }
        const data = await getEssay(params.id as string, userId);
        setEssay(data);
        setEditedTitle(data.title);
        setEditedContent(data.content);
        // 주제 정보 가져오기
        console.log('essay.topic_id:', data.topic_id);
        if (data.topic_id) {
          const topicData = await getAdminEssayTopic(data.topic_id);
          console.log('fetched topicData:', topicData);
          setTopic(topicData);
        } else {
          console.warn('No topic_id found in essay data');
        }
        // 첨삭 세션 가져오기
        const sessionsData = await getCorrectionSessions(params.id as string);
        setSessions(sessionsData);
        // 가장 최근 세션을 활성 탭으로 설정
        if (sessionsData.length > 0) {
          setActiveTab(sessionsData[sessionsData.length - 1].session_number);
        }
      } catch (error) {
        console.error('Error fetching essay:', error);
        setError('에세이를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchEssay();
  }, [params.id, router]);

  const handleCorrection = async () => {
    if (!essay) return;
    
    try {
      setIsCorrecting(true);
      const session = await createCorrectionSession(essay.id);
      setSessions(prev => [...prev, session]);
      setActiveTab(session.session_number);
    } catch (error) {
      console.error('Error creating correction:', error);
      setError('AI 첨삭을 생성하는데 실패했습니다.');
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleSave = async () => {
    if (!essay) return;

    try {
      setIsSaving(true);
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        router.push('/login');
        return;
      }

      const updatedEssay = await updateEssay(essay.id, {
        title: editedTitle,
        content: editedContent,
        user_id: userId
      });

      setEssay(updatedEssay);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving essay:', error);
      setError('에세이 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-600">
            {error}
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/user')}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!essay) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-amber-800">
            <p>에세이를 찾을 수 없습니다.</p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/user')}
              className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
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
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{essay.title}</h1>
          )}
          <div className="flex space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm text-white bg-[#a78bfa] rounded-md hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a78bfa] disabled:opacity-50"
                >
                  {isSaving ? '저장 중...' : '저장하기'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTitle(essay.title);
                    setEditedContent(essay.content);
                  }}
                  className="px-4 py-2 text-sm text-white bg-[#a78bfa] rounded-md hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a78bfa]"
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm text-white bg-[#a78bfa] rounded-md hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a78bfa]"
                >
                  수정하기
                </button>
                <button
                  onClick={handleCorrection}
                  disabled={isCorrecting || sessions.length >= 3}
                  className="px-4 py-2 text-sm text-white bg-[#a78bfa] rounded-md hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a78bfa] disabled:opacity-50"
                >
                  {isCorrecting ? 'AI 첨삭 중...' : `AI 첨삭하기 (${sessions.length}/3)`}
                </button>
                <button
                  onClick={() => router.push('/user')}
                  className="px-4 py-2 text-sm text-white bg-[#a78bfa] rounded-md hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a78bfa]"
                >
                  목록으로 돌아가기
                </button>
              </>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          {topic && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-purple-700 mb-2">{topic.topic}</h2>
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium text-gray-900 mb-2">읽을거리</h3>
                <div
                  className="whitespace-pre-wrap text-gray-600"
                  dangerouslySetInnerHTML={{ __html: topic.reading_material }}
                />
              </div>
            </div>
          )}
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full min-h-[400px] p-4 text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="prose max-w-none whitespace-pre-wrap">
              {essay.content}
            </div>
          )}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500">작성일</div>
                <div className="text-sm text-gray-900">
                  {new Date(essay.created_at).toLocaleString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500">최종수정일</div>
                <div className="text-sm text-gray-900">
                  {new Date(essay.updated_at).toLocaleString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500">글자수</div>
                <div className="text-sm text-gray-900">
                  {isEditing ? editedContent.length : essay.content.length}자
                </div>
              </div>
            </div>
          </div>
        </div>

        {sessions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {sessions.map((session) => (
                  <button
                    key={session.session_number}
                    onClick={() => setActiveTab(session.session_number)}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === session.session_number
                        ? 'border-b-2 border-[#7c3aed] text-[#7c3aed]'
                        : 'text-gray-500 hover:text-[#7c3aed] hover:border-[#ede9fe]'
                    }`}
                  >
                    {session.session_number}차 첨삭
                  </button>
                ))}
              </nav>
            </div>
            <div className="p-6">
              {sessions.map((session) => (
                <div
                  key={session.session_number}
                  className={activeTab === session.session_number ? 'block' : 'hidden'}
                >
                  <div className="space-y-6">
                    {session.overall_feedback && (
                      <div className="p-4 bg-[#f3f0ff] rounded-lg">
                        <h3 className="text-lg font-semibold text-[#7c3aed] mb-2">전체 피드백</h3>
                        <p className="text-black whitespace-pre-wrap">{session.overall_feedback}</p>
                      </div>
                    )}
                    {session.corrections.map((correction, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <div className="mb-2">
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-[#7c3aed] bg-[#ede9fe] rounded-full">
                                {correction.category}
                              </span>
                            </div>
                            <div className="mb-2">
                              <p className="text-sm text-gray-800">원문: {correction.original_text}</p>
                              <p className="text-sm text-[#7c3aed] font-semibold">수정: {correction.suggested_text}</p>
                            </div>
                            <p className="text-sm text-gray-700">{correction.explanation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 