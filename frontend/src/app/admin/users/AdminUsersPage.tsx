'use client';

import { useEffect, useState } from 'react';
import { getUsers, updateUser, deleteUser, createUser, User } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Partial<User> & { password?: string }>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addUser, setAddUser] = useState({ username: '', password: '', role: 'user' });
  const [addError, setAddError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const role = localStorage.getItem('role');
    if (!userId || role !== 'admin') {
      router.replace('/login');
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setEditUser({ ...user });
  };

  const handleSave = async (userId: string) => {
    setLoading(true);
    try {
      await updateUser(userId, editUser);
      setEditId(null);
      fetchUsers();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('정말로 삭제하시겠습니까?')) return;
    setLoading(true);
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    setAddError(null);
    if (!addUser.username || !addUser.password) {
      setAddError('아이디와 비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);
    try {
      await createUser(addUser);
      setShowAdd(false);
      setAddUser({ username: '', password: '', role: 'user' });
      fetchUsers();
    } catch (e: any) {
      setAddError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>회원 전체 목록</h2>
        <button
          onClick={() => setShowAdd((v) => !v)}
          style={{
            padding: '8px 20px',
            background: '#a78bfa',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 500,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(167,139,250,0.10)',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#7c3aed')}
          onMouseOut={e => (e.currentTarget.style.background = '#a78bfa')}
        >
          {showAdd ? '닫기' : '회원 추가'}
        </button>
      </div>
      {showAdd && (
        <div style={{ marginBottom: 24, background: '#f5f3ff', border: '1px solid #ede9fe', padding: 20, borderRadius: 12, boxShadow: '0 1px 4px rgba(167,139,250,0.08)' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              placeholder="아이디"
              value={addUser.username}
              onChange={e => setAddUser({ ...addUser, username: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #c4b5fd', minWidth: 120, background: '#fff' }}
            />
            <input
              placeholder="비밀번호"
              type="password"
              value={addUser.password}
              onChange={e => setAddUser({ ...addUser, password: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #c4b5fd', minWidth: 120, background: '#fff' }}
            />
            <select
              value={addUser.role}
              onChange={e => setAddUser({ ...addUser, role: e.target.value })}
              style={{ padding: 10, borderRadius: 8, border: '1px solid #c4b5fd', background: '#fff' }}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
            <button
              onClick={handleAddUser}
              style={{ padding: '10px 22px', background: '#a78bfa', color: 'white', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = '#7c3aed')}
              onMouseOut={e => (e.currentTarget.style.background = '#a78bfa')}
            >
              추가
            </button>
          </div>
          {addError && <div style={{ color: 'red', marginTop: 10 }}>{addError}</div>}
        </div>
      )}
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {loading ? (
        <div>로딩 중...</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                flex: '1 1 260px',
                minWidth: 260,
                maxWidth: 340,
                background: '#fff',
                border: '1.5px solid #ede9fe',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(167,139,250,0.10)',
                padding: 24,
                marginBottom: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                alignItems: 'flex-start',
              }}
            >
              {editId === user.id ? (
                <>
                  <div style={{ marginBottom: 8, width: '100%' }}>
                    <input
                      value={editUser.username || ''}
                      onChange={e => setEditUser({ ...editUser, username: e.target.value })}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #c4b5fd', width: '100%', background: '#f5f3ff', marginBottom: 8 }}
                    />
                    <select
                      value={editUser.role || 'user'}
                      onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #c4b5fd', width: '100%', background: '#f5f3ff', marginBottom: 8 }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <input
                      type="password"
                      placeholder="새 비밀번호(선택)"
                      value={editUser.password || ''}
                      onChange={e => setEditUser({ ...editUser, password: e.target.value })}
                      style={{ padding: 10, borderRadius: 8, border: '1px solid #c4b5fd', width: '100%', background: '#f5f3ff' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <button
                      onClick={() => handleSave(user.id)}
                      style={{ flex: 1, padding: '10px 0', background: '#a78bfa', color: 'white', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#7c3aed')}
                      onMouseOut={e => (e.currentTarget.style.background = '#a78bfa')}
                    >저장</button>
                    <button
                      onClick={() => setEditId(null)}
                      style={{ flex: 1, padding: '10px 0', background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#e0e7ff')}
                      onMouseOut={e => (e.currentTarget.style.background = '#ede9fe')}
                    >취소</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 8, width: '100%' }}>
                    <div style={{ fontWeight: 600, fontSize: 18, color: '#7c3aed', marginBottom: 4 }}>{user.username}</div>
                    <div style={{ fontSize: 15, color: '#6d28d9', marginBottom: 4 }}>{user.role === 'admin' ? '관리자' : '일반 회원'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    <button
                      onClick={() => handleEdit(user)}
                      style={{ flex: 1, padding: '10px 0', background: '#ede9fe', color: '#7c3aed', border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#e0e7ff')}
                      onMouseOut={e => (e.currentTarget.style.background = '#ede9fe')}
                    >수정</button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{ flex: 1, padding: '10px 0', background: '#f5f3ff', color: '#a78bfa', border: '1.5px solid #c4b5fd', borderRadius: 8, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={e => (e.currentTarget.style.background = '#ede9fe')}
                      onMouseOut={e => (e.currentTarget.style.background = '#f5f3ff')}
                    >삭제</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 