import { useState } from 'react';
import { updateUser, User } from '@/lib/api';

interface Props {
  user: User;
  onClose: () => void;
  onUpdate: (username: string) => void;
}

export default function UserSettingsModal({ user, onClose, onUpdate }: Props) {
  const [tab, setTab] = useState<'name' | 'password'>('name');
  // 이름 수정 상태
  const [name, setName] = useState(user.name || '');
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameLoading, setNameLoading] = useState(false);
  // 비밀번호 수정 상태
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // 이름 변경 핸들러
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);
    try {
      setNameLoading(true);
      await updateUser(user.id, { name });
      onUpdate(name);
      onClose();
    } catch {
      setNameError('이름 변경에 실패했습니다.');
    } finally {
      setNameLoading(false);
    }
  };

  // 비밀번호 변경 핸들러
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (password !== confirmPassword) {
      setPwError('비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      setPwLoading(true);
      await updateUser(user.id, { password });
      onUpdate(user.username);
      onClose();
    } catch {
      setPwError('비밀번호 변경에 실패했습니다.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">사용자 설정</h2>
        {/* 탭 버튼 */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === 'name' ? 'border-[#a78bfa] text-[#7c3aed]' : 'border-transparent text-gray-400'}`}
            onClick={() => setTab('name')}
          >
            이름 수정
          </button>
          <button
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === 'password' ? 'border-[#a78bfa] text-[#7c3aed]' : 'border-transparent text-gray-400'}`}
            onClick={() => setTab('password')}
          >
            비밀번호 수정
          </button>
        </div>
        {/* 이름 수정 폼 */}
        {tab === 'name' && (
          <form onSubmit={handleNameSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                이름
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                required
                placeholder="베리베리"
              />
            </div>
            {nameError && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {nameError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={nameLoading}
                className="px-4 py-2 text-sm text-white bg-[#a78bfa] rounded-md hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a78bfa] disabled:opacity-50"
              >
                {nameLoading ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </form>
        )}
        {/* 비밀번호 수정 폼 */}
        {tab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa]"
                required
              />
            </div>
            {pwError && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {pwError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={pwLoading}
                className="px-4 py-2 text-sm text-white bg-[#a78bfa] rounded-md hover:bg-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a78bfa] disabled:opacity-50"
              >
                {pwLoading ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 