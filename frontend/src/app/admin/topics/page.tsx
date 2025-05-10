'use client';

import { Suspense } from 'react';
import AdminEssayTopicsPage from './AdminEssayTopicsPage';

export default function TopicsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f8fa] to-[#e9edfb] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a78bfa]"></div>
      </div>
    }>
      <AdminEssayTopicsPage />
    </Suspense>
  );
} 