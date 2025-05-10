"use client";
import { useEffect, useState } from "react";
import { Essay, getCorrectionSessions } from "@/lib/api";

interface Correction {
  category: string;
  original_text: string;
  suggested_text: string;
  explanation: string;
}

interface CorrectionSession {
  session_number: number;
  corrections: Correction[];
  overall_feedback: string;
}

interface Props {
  essay: Essay;
  onBack: () => void;
}

export default function UserEssayDetailCard({ essay, onBack }: Props) {
  const [sessions, setSessions] = useState<CorrectionSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<number>(0);

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line
  }, [essay.id]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCorrectionSessions(essay.id);
      setSessions(data);
    } catch {
      setError("An error occurred while fetching sessions.");
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
      >← 에세이 목록으로</button>
      <div style={{ background: '#fff', border: '1.5px solid #ede9fe', borderRadius: 16, boxShadow: '0 2px 12px rgba(167,139,250,0.10)', padding: 32, marginBottom: 32 }}>
        <div style={{ fontWeight: 700, fontSize: 22, color: '#222', marginBottom: 8 }}>{essay.title}</div>
        <div style={{ fontSize: 15, color: '#222', marginBottom: 16 }}>{essay.daily_essay_date}</div>
        <div style={{ fontSize: 16, color: '#222', marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: essay.content }} />
      </div>
      <h3 style={{ fontWeight: 600, fontSize: 18, color: '#222', marginBottom: 16 }}>첨삭</h3>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {loading ? (
        <div>로딩 중...</div>
      ) : sessions.length === 0 ? (
        <div style={{ color: '#888', fontSize: 16 }}>첨삭 세션이 없습니다.</div>
      ) : (
        <div>
          {/* 탭 UI */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {sessions.map((session, idx) => (
              <button
                key={session.session_number}
                onClick={() => setSelectedSession(idx)}
                style={{
                  padding: '8px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: selectedSession === idx ? '#a78bfa' : '#f5f3ff',
                  color: selectedSession === idx ? '#fff' : '#7c3aed',
                  fontWeight: 600,
                  fontSize: 16,
                  boxShadow: selectedSession === idx ? '0 2px 8px rgba(167,139,250,0.10)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {session.session_number}차 첨삭
              </button>
            ))}
          </div>
          {/* 선택된 세션 내용 */}
          {(() => {
            const session = sessions[selectedSession];
            if (!session) return null;
            return (
              <div>
                {/* 전체 피드백 */}
                <div style={{ background: '#ede9fe', color: '#222', borderRadius: 10, padding: 20, marginBottom: 24, fontSize: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>전체 피드백</div>
                  <div>{session.overall_feedback}</div>
                </div>
                {/* 첨삭 리스트 */}
                {session.corrections && session.corrections.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {session.corrections.map((correction, idx) => (
                      <div key={idx} style={{ background: '#fff', border: '1px solid #ede9fe', borderRadius: 8, padding: 18 }}>
                        <div style={{ display: 'inline-block', background: '#ede9fe', color: '#222', borderRadius: 8, padding: '2px 12px', fontWeight: 600, fontSize: 14, marginBottom: 8, marginRight: 8 }}>{correction.category}</div>
                        <div style={{ fontSize: 15, color: '#222', marginBottom: 4 }}><b>원문:</b> {correction.original_text}</div>
                        <div style={{ fontSize: 15, color: '#222', marginBottom: 4 }}><b>수정:</b> {correction.suggested_text}</div>
                        <div style={{ fontSize: 15, color: '#222' }}><b>설명:</b> {correction.explanation}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#888', fontSize: 15 }}>첨삭 내역이 없습니다.</div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
} 