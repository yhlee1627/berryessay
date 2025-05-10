"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getEssays, Essay, User, getUsers } from '@/lib/api';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import UserSettingsModal from './components/UserSettingsModal';
import Image from 'next/image';

export default function UserHomePage() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchEssaysAndUser() {
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
          router.push('/login');
          return;
        }
        const data = await getEssays(userId);
        setEssays(data);
        // 서버에서 내 user 정보 받아오기
        const users = await getUsers();
        const me = users.find(u => u.id === userId);
        setUser(me || null);
      } catch (err) {
        console.error('에세이 목록을 불러오는데 실패했습니다:', err);
      }
    }
    fetchEssaysAndUser();
  }, [router]);

  const handleWriteNew = () => {
    router.push('/user/select-topic');
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    router.push('/login');
  };

  const handleSettingsUpdate = async (newName?: string) => {
    // 이름 변경 후 서버에서 최신 user 정보 받아와 상태에 반영
    const userId = localStorage.getItem('user_id');
    if (userId) {
      const users = await getUsers();
      const me = users.find(u => u.id === userId);
      if (me) {
        setUser(me);
        localStorage.setItem('name', me.name || '베리베리');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f8fa] to-[#e9edfb]">
      {/* 상단 우측 아이콘 헤더 */}
      <header className="w-full flex justify-end items-center py-6 px-6 gap-4">
        <button 
          className="text-gray-400 hover:text-[#7c3aed] transition" 
          title="설정"
          onClick={() => setShowSettings(true)}
        >
          <Cog6ToothIcon className="w-6 h-6" />
        </button>
        <button className="text-gray-400 hover:text-[#7c3aed] transition" title="로그아웃" onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
        </button>
      </header>
      {/* 설정 모달 */}
      {showSettings && user && (
        <UserSettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdate={handleSettingsUpdate}
        />
      )}
      {/* 플로팅 새 에세이 버튼 */}
      <button
        onClick={handleWriteNew}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-[#a78bfa] text-white shadow-lg hover:bg-[#7c3aed] transition flex items-center justify-center"
        title="새 에세이 작성"
      >
        <PlusIcon className="w-8 h-8" />
      </button>
      {/* 인사말 영역 */}
      <div className="flex items-center justify-center mt-4 mb-8">
        <Image src="/blueberry.png" alt="블루베리" className="w-16 h-16 mr-4 drop-shadow" width={64} height={64} />
        <div className="bg-white rounded-xl px-6 py-4 shadow text-lg font-semibold text-[#7c3aed] border border-[#a78bfa]">
          {(user?.name || '베리베리') + '님, 환영합니다!'}
        </div>
      </div>
      {/* 에세이 카드 리스트 */}
      <main className="flex flex-col items-center gap-8 px-2 pb-16">
        {essays.length > 0 ? (
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {essays.map((essay) => (
              <div
                key={essay.id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 hover:shadow-lg transition cursor-pointer w-full"
                onClick={() => router.push(`/user/essays/${essay.id}`)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-lg text-gray-900 truncate max-w-[70%]">{essay.title}</span>
                  <span className="text-xs text-gray-400">{new Date(essay.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-gray-700 text-sm line-clamp-2 mb-2">
                  {essay.content}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">글자수: {essay.content.length}자</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-md bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 text-center mt-8">
            아직 작성한 에세이가 없습니다.
          </div>
        )}
      </main>
    </div>
  );
} 