"use client";
import { useEffect, useState } from "react";
import { Essay, getEssays, User } from "@/lib/api";

interface Props {
  user: User;
  onBack: () => void;
  onSelectEssay: (essay: Essay) => void;
}

export default function UserEssayListCard({ user, onBack, onSelectEssay }: Props) {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEssays();
    // eslint-disable-next-line
  }, [user.id]);

  const fetchEssays = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEssays(user.id);
      setEssays(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <button
        onClick={onBack}
        style={{ marginBottom: 28, padding: '8px 20px', background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', boxShadow: '0 1px 4px rgba(167,139,250,0.10)', transition: 'background 0.2s' }}
        onMouseOver={e => (e.currentTarget.style.background = '#e0e7ff')}
        onMouseOut={e => (e.currentTarget.style.background = '#ede9fe')}
      >← 회원 목록으로</button>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#222", marginBottom: 24 }}>{user.username}님의 에세이 목록</h2>
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      {loading ? (
        <div>로딩 중...</div>
      ) : essays.length === 0 ? (
        <div style={{ color: '#888', fontSize: 16, marginTop: 32 }}>에세이가 없습니다.</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          {essays.map((essay) => (
            <div
              key={essay.id}
              onClick={() => onSelectEssay(essay)}
              style={{
                flex: "1 1 260px",
                minWidth: 260,
                maxWidth: 340,
                background: "#fff",
                border: "1.5px solid #ede9fe",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(167,139,250,0.10)",
                padding: 24,
                marginBottom: 8,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "flex-start",
                cursor: "pointer",
                transition: "box-shadow 0.2s, border 0.2s",
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(124,58,237,0.13)";
                (e.currentTarget as HTMLDivElement).style.border = "1.5px solid #a78bfa";
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(167,139,250,0.10)";
                (e.currentTarget as HTMLDivElement).style.border = "1.5px solid #ede9fe";
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 18, color: "#7c3aed", marginBottom: 4 }}>{essay.title}</div>
              <div style={{ fontSize: 14, color: "#6d28d9", marginBottom: 4 }}>{essay.daily_essay_date}</div>
              <div style={{ fontSize: 15, color: "#444", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{essay.content.replace(/<[^>]+>/g, '').slice(0, 40)}...</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 