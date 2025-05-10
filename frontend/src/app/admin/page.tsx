"use client";
import { useState, Suspense } from 'react';
import AdminUsersPage from './users/AdminUsersPage';
import AdminEssayListPage from './list/AdminEssayListPage';
import AdminUserEssaysFlowPage from './user-essays/page';
import { useSearchParams } from 'next/navigation';

const TABS = [
  { label: '에세이 주제 관리', value: 'essays' },
  { label: '회원관리', value: 'users' },
  { label: '회원별 에세이 관리', value: 'user-essays' },
];

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'essays';
  const [tab, setTab] = useState(initialTab);
  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f8fa] to-[#e9edfb]">
      {/* 상단 로그아웃 버튼 */}
      <div className="flex justify-end max-w-4xl mx-auto pt-8 px-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
      {/* 중앙 흰색 박스와 탭 */}
      <div className="bg-white p-6 rounded-xl shadow-sm min-h-[500px] max-w-4xl mx-auto mt-12">
        <div className="flex space-x-4 mb-8 justify-center">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-6 py-2 rounded-full font-semibold text-base transition-all shadow-sm ${tab === t.value ? 'bg-[#a78bfa] text-white' : 'bg-white text-[#7c3aed] border border-[#a78bfa]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div>
          {tab === 'users' && (
            <AdminUsersPage />
          )}
          {tab === 'essays' && (
            <AdminEssayListPage />
          )}
          {tab === 'user-essays' && (
            <AdminUserEssaysFlowPage />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f8fa] to-[#e9edfb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a78bfa]"></div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
} 