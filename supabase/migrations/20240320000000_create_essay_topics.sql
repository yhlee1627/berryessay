-- 에세이 주제와 읽을거리 테이블
create table essay_topics (
  id uuid default gen_random_uuid() primary key,
  topic text not null, -- 에세이 주제
  reading_material text not null, -- 읽을거리
  is_active boolean default true, -- 현재 활성화된 주제인지 여부
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 정책 설정
alter table essay_topics enable row level security;

-- 관리자만 모든 작업 가능
create policy "관리자는 모든 작업 가능" on essay_topics
  for all
  to authenticated
  using (auth.uid() in (select user_id from admin_users))
  with check (auth.uid() in (select user_id from admin_users));

-- 일반 사용자는 활성화된 주제만 조회 가능
create policy "일반 사용자는 활성화된 주제만 조회 가능" on essay_topics
  for select
  to authenticated
  using (is_active = true);

-- updated_at 자동 업데이트 트리거
create trigger set_updated_at
  before update on essay_topics
  for each row
  execute function set_updated_at(); 