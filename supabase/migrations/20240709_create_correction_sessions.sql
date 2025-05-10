-- correction_sessions 테이블 생성
CREATE TABLE correction_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    essay_id UUID NOT NULL,
    session_number INTEGER NOT NULL,
    corrections JSONB NOT NULL,
    overall_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    FOREIGN KEY (essay_id) REFERENCES essays(id) ON DELETE CASCADE,
    UNIQUE (essay_id, session_number)
);

-- 인덱스 생성
CREATE INDEX idx_correction_sessions_essay_id ON correction_sessions(essay_id); 