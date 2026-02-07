-- 사기 신고 시스템 마이그레이션

-- 1. 신고 타입 ENUM 생성
CREATE TYPE report_type_enum AS ENUM (
  'no_payment',   -- 돈을 안줬다
  'no_item'       -- 아이템을 안줬다
);

-- 2. 신고 상태 ENUM 생성
CREATE TYPE report_status_enum AS ENUM (
  'pending',      -- 접수됨
  'reviewing',    -- 검토 중
  'confirmed',    -- 사기 확인
  'dismissed',    -- 기각
  'resolved'      -- 처리 완료
);

-- 3. profiles 테이블에 신고 관련 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS report_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- 4. scam_reports 테이블 생성
CREATE TABLE IF NOT EXISTS scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- 신고 대상
  reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  suspect_name TEXT NOT NULL,               -- 피의자 게임닉/디스코드명
  suspect_discord_id TEXT,                  -- 피의자 Discord ID

  -- 신고 내용
  report_type report_type_enum NOT NULL,   -- 신고 유형
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],                     -- 증거 스크린샷 URL 배열
  related_trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,

  -- 처리 상태
  status report_status_enum DEFAULT 'pending',
  admin_note TEXT,                          -- 운영진 처리 메모
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_scam_reports_reporter ON scam_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_scam_reports_reported_user ON scam_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_scam_reports_status ON scam_reports(status);
CREATE INDEX IF NOT EXISTS idx_scam_reports_created ON scam_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);

-- 6. RLS 정책 설정
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자는 자신의 신고만 조회
CREATE POLICY "Users can view own reports" ON scam_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- 인증된 사용자는 신고 작성 가능
CREATE POLICY "Authenticated users can create reports" ON scam_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id AND auth.uid() IS NOT NULL);

-- 본인 신고만 수정 가능 (pending 상태일 때만)
CREATE POLICY "Users can update own pending reports" ON scam_reports
  FOR UPDATE
  USING (auth.uid() = reporter_id AND status = 'pending');

-- 7. 신고 누적 자동 차단 트리거 함수
CREATE OR REPLACE FUNCTION check_ban_threshold()
RETURNS TRIGGER AS $$
BEGIN
  -- 신고가 confirmed 상태로 변경되면 피신고자의 report_count 증가
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' AND NEW.reported_user_id IS NOT NULL THEN
    UPDATE profiles
    SET report_count = report_count + 1
    WHERE id = NEW.reported_user_id;

    -- 신고 3회 이상이면 자동 차단
    UPDATE profiles
    SET
      is_banned = TRUE,
      banned_at = NOW(),
      ban_reason = '사기 신고 누적 (3회 이상)'
    WHERE id = NEW.reported_user_id
      AND report_count >= 3
      AND is_banned = FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 트리거 생성
DROP TRIGGER IF EXISTS trigger_check_ban ON scam_reports;
CREATE TRIGGER trigger_check_ban
  AFTER UPDATE ON scam_reports
  FOR EACH ROW
  EXECUTE FUNCTION check_ban_threshold();

-- 9. 차단된 사용자의 거래소 글 작성 제한
-- 기존 trades 테이블 INSERT 정책 삭제 후 재생성
DROP POLICY IF EXISTS "Create own trades" ON trades;
CREATE POLICY "Create own trades" ON trades
  FOR INSERT
  WITH CHECK (
    auth.uid() = seller_id
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_banned = TRUE
    )
  );

-- 10. 차단된 사용자의 파티모집 글 작성 제한
DROP POLICY IF EXISTS "Create own recruits" ON party_recruits;
CREATE POLICY "Create own recruits" ON party_recruits
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_banned = TRUE
    )
  );

-- 11. 신고 통계 뷰 생성 (운영자용)
CREATE OR REPLACE VIEW scam_report_stats AS
SELECT
  reported_user_id,
  suspect_name,
  COUNT(*) as total_reports,
  SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_reports,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reports,
  MAX(created_at) as last_report_at
FROM scam_reports
WHERE reported_user_id IS NOT NULL
GROUP BY reported_user_id, suspect_name
ORDER BY confirmed_reports DESC, total_reports DESC;

-- 12. 권한 부여
GRANT SELECT ON scam_reports TO authenticated;
GRANT INSERT ON scam_reports TO authenticated;
GRANT UPDATE ON scam_reports TO authenticated;
GRANT SELECT ON scam_report_stats TO authenticated;
