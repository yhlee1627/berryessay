'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@toast-ui/editor';
type EditorInstance = InstanceType<typeof Editor>;
import { getAdminEssayTopic, setAdminEssayTopic, EssayTopic, logout } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import '@toast-ui/editor/dist/toastui-editor.css';
import { supabase } from '@/lib/supabase';

const TuiEditor = dynamic(() => import('@/components/TuiEditor'), { ssr: false });

export default function AdminEssayTopicsPage() {
  const [topic, setTopic] = useState('');
  const [readingMaterial, setReadingMaterial] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<EssayTopic | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'new'; // 'new' 또는 'edit'
  const topicId = searchParams.get('id');
const editorRef = useRef<EditorInstance | null>(null);

  const fetchCurrentTopic = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminEssayTopic(topicId || undefined);
      setCurrent(data);
      if (data) {
        setTopic(data.topic || '');
        setReadingMaterial(data.reading_material || '');
      } else {
        setError('주제를 찾을 수 없습니다.');
      }
    } catch {
      setError('주제를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    if (mode === 'edit') {
      fetchCurrentTopic();
    } else {
      resetForm();
    }
  }, [mode, topicId, fetchCurrentTopic]);

  // 읽을거리(readingMaterial)가 바뀔 때마다 에디터에 반영
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.getInstance().setHTML(readingMaterial || '');
    }
  }, [readingMaterial]);

  const resetForm = () => {
    setTopic('');
    setReadingMaterial('');
    setCurrent(null);
  };

  const handleSave = async () => {
    if (!topic.trim() || !readingMaterial.trim()) {
      setError('주제와 읽을거리를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const ok = await setAdminEssayTopic(topic, readingMaterial, mode === 'edit' ? topicId || undefined : undefined);
      if (!ok) throw new Error();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
      if (mode === 'edit') {
        await fetchCurrentTopic();
      }
    } catch {
      setError('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Toast UI Editor 이미지 업로드 핸들러
  const handleImageUpload = async (
    blob: Blob,
    callback: (url: string, alt: string, attr?: Record<string, unknown>) => void
  ) => {
    const fileName = `${Date.now()}_${(blob as File).name}`;
    const { error } = await supabase.storage
      .from('image')
      .upload(fileName, blob);

    if (error) {
      alert('이미지 업로드 실패: ' + error.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('image')
      .getPublicUrl(fileName);

    callback(publicUrlData.publicUrl, '이미지', { width: 400 });
  };

  return (
    <div className="w-full max-w-3xl mx-auto min-h-screen py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex flex-col gap-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            {mode === 'new' ? '새 에세이 주제 작성' : '에세이 주제 수정'}
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => router.push('/admin?tab=essays')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              목록으로 돌아가기
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              로그아웃
            </button>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">에세이 주제</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="에세이 주제를 입력하세요"
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">읽을거리</label>
            <TuiEditor
              ref={editorRef}
              value={readingMaterial}
              previewStyle="vertical"
              height="400px"
              onChange={setReadingMaterial}
              addImageBlobHook={handleImageUpload}
            />
            <div className="text-xs text-gray-400 mt-1">이미지, 표, 코드 등 다양한 편집이 가능합니다.</div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-7 py-3 rounded-full bg-black text-white font-semibold shadow hover:bg-gray-800 transition text-lg disabled:opacity-50"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
        </div>
        {success && <div className="text-green-600 text-sm mt-2">저장되었습니다!</div>}
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        {mode === 'edit' && current && (
          <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-2">현재 수정 중인 주제</div>
            <div className="font-semibold text-gray-900 mb-1">{current.topic}</div>
            <div className="text-gray-700 whitespace-pre-line" dangerouslySetInnerHTML={{ __html: current.reading_material }} />
            <div className="text-xs text-gray-400 mt-2">(최종수정: {new Date(current.updated_at).toLocaleString('ko-KR')})</div>
          </div>
        )}
      </div>
    </div>
  );
} 