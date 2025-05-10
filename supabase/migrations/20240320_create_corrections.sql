-- corrections 테이블 생성
DROP TABLE IF EXISTS corrections;

CREATE TYPE correction_category AS ENUM ('grammar', 'structure', 'vocabulary', 'flow');

CREATE TABLE corrections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    essay_id UUID NOT NULL,
    category correction_category NOT NULL,
    original_text TEXT NOT NULL,
    suggested_text TEXT NOT NULL,
    explanation TEXT NOT NULL,
    position JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    FOREIGN KEY (essay_id) REFERENCES essays(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX idx_corrections_essay_id ON corrections(essay_id);

-- 카테고리 제약조건 추가
ALTER TABLE corrections
ADD CONSTRAINT check_correction_category
CHECK (category IN ('grammar', 'structure', 'vocabulary', 'flow')); 