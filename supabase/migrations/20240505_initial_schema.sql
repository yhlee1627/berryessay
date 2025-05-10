-- Create custom types
CREATE TYPE correction_category AS ENUM ('grammar', 'spelling', 'punctuation', 'clarity', 'style');

-- Create essays table
CREATE TABLE essays (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_submitted BOOLEAN DEFAULT false,
    daily_essay_date DATE NOT NULL,
    CONSTRAINT unique_daily_essay UNIQUE (user_id, daily_essay_date)
);

-- Create corrections table
CREATE TABLE corrections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    essay_id UUID REFERENCES essays(id) ON DELETE CASCADE,
    category correction_category NOT NULL,
    line_number INTEGER NOT NULL,
    start_char INTEGER NOT NULL,
    end_char INTEGER NOT NULL,
    original_text TEXT NOT NULL,
    suggested_text TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create daily_prompts table
CREATE TABLE daily_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reading_material TEXT,
    date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_prompts ENABLE ROW LEVEL SECURITY;

-- Essays policies
CREATE POLICY "Users can view their own essays"
    ON essays FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own essays"
    ON essays FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own essays"
    ON essays FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Corrections policies
CREATE POLICY "Users can view corrections for their essays"
    ON corrections FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM essays
        WHERE essays.id = corrections.essay_id
        AND essays.user_id = auth.uid()
    ));

-- Daily prompts policies
CREATE POLICY "Anyone can view daily prompts"
    ON daily_prompts FOR SELECT
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for essays table
CREATE TRIGGER update_essays_updated_at
    BEFORE UPDATE ON essays
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 