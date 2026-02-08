-- 알람 타입 enum
CREATE TYPE notification_type AS ENUM (
  'party_application',    -- 파티 신청
  'party_accepted',       -- 파티 승인
  'party_rejected',       -- 파티 거절
  'party_kicked',         -- 파티 추방
  'trade_reservation',    -- 거래소 예약
  'trade_comment',        -- 거래소 댓글
  'scam_report_result'    -- 사기 신고 결과
);

-- 알람 테이블
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,  -- 클릭 시 이동할 URL
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read ON notifications(read) WHERE read = FALSE;

-- RLS 활성화
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인 알람만 조회
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS 정책: 본인 알람만 업데이트 (읽음 처리)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 본인 알람만 삭제
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS 정책: 시스템이 알람 생성 (authenticated 사용자가 다른 사람에게 알람 전송)
CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 자동으로 오래된 알람 삭제 (30일 이상)
CREATE OR REPLACE FUNCTION delete_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 매일 자정에 오래된 알람 삭제 (선택사항 - cron extension 필요)
-- SELECT cron.schedule('delete-old-notifications', '0 0 * * *', 'SELECT delete_old_notifications()');
