-- HR-Toolkit 방문자 통계 테이블
CREATE TABLE IF NOT EXISTS page_visits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  referrer text,
  referrer_domain text,
  device_type text,           -- 'mobile' | 'tablet' | 'desktop'
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- 조회 성능 인덱스
CREATE INDEX IF NOT EXISTS idx_page_visits_created_at ON page_visits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_path ON page_visits(path);
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON page_visits(session_id);

-- RLS 비활성화 (서버사이드 API만 접근)
ALTER TABLE page_visits DISABLE ROW LEVEL SECURITY;
