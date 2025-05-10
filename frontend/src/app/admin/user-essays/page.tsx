"use client";
import { useState } from "react";
import AdminUserEssaysPage from "./AdminUserEssaysPage";
import UserEssayListCard from "./UserEssayListCard";
import UserEssayDetailCard from "./UserEssayDetailCard";
import { User, Essay } from "@/lib/api";

export default function AdminUserEssaysFlowPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);

  // 1단계: 회원 카드 목록
  if (!selectedUser) {
    return <AdminUserEssaysPage onSelectUser={setSelectedUser} />;
  }

  // 2단계: 회원별 에세이 카드 목록
  if (!selectedEssay) {
    return (
      <UserEssayListCard
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
        onSelectEssay={setSelectedEssay}
      />
    );
  }

  // 3단계: 에세이 상세/첨삭 카드
  return (
    <UserEssayDetailCard
      essay={selectedEssay}
      onBack={() => setSelectedEssay(null)}
    />
  );
} 