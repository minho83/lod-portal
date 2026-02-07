-- ============================================
-- 파티 모집 시스템 스키마
-- ============================================

-- 1. party_recruits 테이블
CREATE TABLE IF NOT EXISTS party_recruits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  location text,
  scheduled_at timestamptz,
  join_mode text NOT NULL DEFAULT 'approval' CHECK (join_mode IN ('approval', 'first_come')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'closed', 'cancelled')),
  job_slots jsonb NOT NULL DEFAULT '{"warrior":0,"rogue":0,"mage":0,"cleric":0,"taoist":0}',
  max_members int NOT NULL DEFAULT 0,
  member_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- 2. party_members 테이블
CREATE TABLE IF NOT EXISTS party_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruit_id uuid NOT NULL REFERENCES party_recruits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  job_class text NOT NULL CHECK (job_class IN ('warrior', 'rogue', 'mage', 'cleric', 'taoist')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('accepted', 'pending', 'rejected', 'left', 'kicked')),
  character_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(recruit_id, user_id)
);

-- 3. 인덱스
CREATE INDEX IF NOT EXISTS idx_recruits_status ON party_recruits(status);
CREATE INDEX IF NOT EXISTS idx_recruits_author ON party_recruits(author_id);
CREATE INDEX IF NOT EXISTS idx_recruits_created ON party_recruits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_recruit ON party_members(recruit_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON party_members(user_id);

-- 4. member_count 자동 동기화 트리거
CREATE OR REPLACE FUNCTION update_recruit_member_count()
RETURNS trigger AS $$
DECLARE
  cnt int;
  max_m int;
  cur_status text;
BEGIN
  -- 변경된 recruit_id 결정
  DECLARE
    target_recruit_id uuid;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      target_recruit_id := OLD.recruit_id;
    ELSE
      target_recruit_id := NEW.recruit_id;
    END IF;

    -- accepted 멤버 수 카운트
    SELECT count(*) INTO cnt
    FROM party_members
    WHERE recruit_id = target_recruit_id AND status = 'accepted';

    -- 현재 상태와 max_members 조회
    SELECT p.max_members, p.status INTO max_m, cur_status
    FROM party_recruits p
    WHERE p.id = target_recruit_id;

    -- member_count 업데이트
    UPDATE party_recruits
    SET member_count = cnt, updated_at = now()
    WHERE id = target_recruit_id;

    -- 자동 상태 변경 (closed/cancelled 제외)
    IF cur_status NOT IN ('closed', 'cancelled') THEN
      IF cnt >= max_m AND max_m > 0 THEN
        UPDATE party_recruits SET status = 'full' WHERE id = target_recruit_id;
      ELSIF cnt < max_m THEN
        UPDATE party_recruits SET status = 'open' WHERE id = target_recruit_id;
      END IF;
    END IF;
  END;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_member_count ON party_members;
CREATE TRIGGER trg_update_member_count
  AFTER INSERT OR UPDATE OR DELETE ON party_members
  FOR EACH ROW EXECUTE FUNCTION update_recruit_member_count();

-- 5. updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recruits_updated_at ON party_recruits;
CREATE TRIGGER trg_recruits_updated_at
  BEFORE UPDATE ON party_recruits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_members_updated_at ON party_members;
CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON party_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. RLS 활성화
ALTER TABLE party_recruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_members ENABLE ROW LEVEL SECURITY;

-- 7. RLS 정책 - party_recruits
CREATE POLICY "recruits_select_all" ON party_recruits
  FOR SELECT USING (true);

CREATE POLICY "recruits_insert_own" ON party_recruits
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "recruits_update_own" ON party_recruits
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "recruits_delete_own" ON party_recruits
  FOR DELETE USING (auth.uid() = author_id);

-- 8. RLS 정책 - party_members
CREATE POLICY "members_select_all" ON party_members
  FOR SELECT USING (true);

CREATE POLICY "members_insert_own" ON party_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_update_own_or_leader" ON party_members
  FOR UPDATE USING (
    auth.uid() = user_id
    OR
    auth.uid() IN (
      SELECT author_id FROM party_recruits WHERE id = recruit_id
    )
  );

CREATE POLICY "members_delete_own_or_leader" ON party_members
  FOR DELETE USING (
    auth.uid() = user_id
    OR
    auth.uid() IN (
      SELECT author_id FROM party_recruits WHERE id = recruit_id
    )
  );

-- 9. GRANT 권한
GRANT SELECT ON party_recruits TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON party_recruits TO authenticated;
GRANT SELECT ON party_members TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON party_members TO authenticated;
