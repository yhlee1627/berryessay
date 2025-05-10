"use client";
import { useEffect, useState } from "react";
import { getUsers, User } from "@/lib/api";

interface Props {
  onSelectUser?: (user: User) => void;
}

export default function AdminUserEssaysPage({ onSelectUser }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError("An error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: "#222", marginBottom: 32 }}>회원별 에세이 관리</h2>
      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => onSelectUser && onSelectUser(user)}
              style={{
                flex: "1 1 260px",
                minWidth: 260,
                maxWidth: 340,
                background: "#fff",
                border: "1.5px solid #ede9fe",
                borderRadius: 16,
                boxShadow: "0 2px 12px rgba(167,139,250,0.10)",
                padding: 28,
                marginBottom: 8,
                display: "flex",
                flexDirection: "column",
                gap: 12,
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
              <div style={{ fontWeight: 600, fontSize: 20, color: "#7c3aed", marginBottom: 4 }}>{user.username}</div>
              <div style={{ fontSize: 15, color: "#6d28d9" }}>{user.role === "admin" ? "관리자" : "일반 회원"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 