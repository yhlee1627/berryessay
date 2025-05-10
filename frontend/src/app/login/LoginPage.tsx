'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }

      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('role', data.role);
      router.push(data.role === 'admin' ? '/admin' : '/user');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f4f3fb]">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center bg-white rounded-2xl p-10 shadow">
        <img src="/blueberry.png" alt="BerryEssay" className="w-20 h-20 mb-2" />
        <h1 className="text-2xl font-bold text-[#7c3aed] mb-1">BerryEssay</h1>
        <p className="text-gray-500 text-sm mb-6">글쓰기로 성장하는 우리</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border border-[#c7bfff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa] bg-[#f8f7fc] placeholder:text-gray-400"
            placeholder="아이디를 입력하세요"
            required
          />
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-[#c7bfff] rounded-md focus:outline-none focus:ring-2 focus:ring-[#a78bfa] bg-[#f8f7fc] placeholder:text-gray-400"
            placeholder="비밀번호를 입력하세요"
            required
          />
          {error && (
            <div className="text-red-600 text-sm text-center mt-2">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-md bg-[#a78bfa] text-white font-semibold text-lg hover:bg-[#7c3aed] transition-colors disabled:opacity-50 shadow-none"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <div className="mt-8 text-xs text-gray-400 text-center">
          © Youngho Lee, yhlee@dnue.ac.kr
        </div>
      </div>
    </div>
  );
} 