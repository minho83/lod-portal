-- ============================================
-- trade_price_history 테이블 + get_market_prices RPC + 더미 데이터
-- ============================================

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS trade_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  item_category TEXT NOT NULL,
  date DATE NOT NULL,
  avg_price BIGINT NOT NULL,
  min_price BIGINT NOT NULL,
  max_price BIGINT NOT NULL,
  trade_count INT NOT NULL,
  UNIQUE(item_name, date)
);

CREATE INDEX IF NOT EXISTS idx_price_history_item ON trade_price_history(item_name, date DESC);

-- RLS: 누구나 조회 가능
ALTER TABLE trade_price_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Price history viewable" ON trade_price_history;
CREATE POLICY "Price history viewable" ON trade_price_history FOR SELECT USING (true);

-- anon/authenticated 역할에 SELECT 권한
GRANT SELECT ON trade_price_history TO anon, authenticated;

-- 2. get_market_prices RPC 함수
CREATE OR REPLACE FUNCTION get_market_prices(
  p_item_names TEXT[] DEFAULT NULL,
  p_window_days INT DEFAULT 7,
  p_min_samples INT DEFAULT 3
)
RETURNS TABLE (
  item_name TEXT,
  item_category TEXT,
  median_price BIGINT,
  avg_price BIGINT,
  min_price BIGINT,
  max_price BIGINT,
  trade_count BIGINT,
  window_days INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH windowed AS (
    SELECT
      h.item_name,
      h.item_category,
      h.avg_price,
      h.min_price AS day_min,
      h.max_price AS day_max,
      h.trade_count AS day_count
    FROM trade_price_history h
    WHERE h.date >= CURRENT_DATE - p_window_days
      AND (p_item_names IS NULL OR h.item_name = ANY(p_item_names))
  ),
  aggregated AS (
    SELECT
      w.item_name,
      w.item_category,
      -- median 근사: 가중 평균 사용
      (SUM(w.avg_price * w.day_count) / NULLIF(SUM(w.day_count), 0))::BIGINT AS median_price,
      (SUM(w.avg_price * w.day_count) / NULLIF(SUM(w.day_count), 0))::BIGINT AS avg_price,
      MIN(w.day_min) AS min_price,
      MAX(w.day_max) AS max_price,
      SUM(w.day_count)::BIGINT AS trade_count
    FROM windowed w
    GROUP BY w.item_name, w.item_category
    HAVING SUM(w.day_count) >= p_min_samples
  )
  SELECT
    a.item_name,
    a.item_category,
    a.median_price,
    a.avg_price,
    a.min_price,
    a.max_price,
    a.trade_count,
    p_window_days AS window_days
  FROM aggregated a
  ORDER BY a.trade_count DESC;
END;
$$;

-- anon/authenticated에 EXECUTE 권한
GRANT EXECUTE ON FUNCTION get_market_prices(TEXT[], INT, INT) TO anon, authenticated;

-- 3. 더미 시세 데이터 (최근 7일)
INSERT INTO trade_price_history (item_name, item_category, date, avg_price, min_price, max_price, trade_count)
VALUES
  -- 집행검
  ('집행검', '무기', CURRENT_DATE - 6, 2400000, 2200000, 2600000, 3),
  ('집행검', '무기', CURRENT_DATE - 5, 2450000, 2300000, 2700000, 2),
  ('집행검', '무기', CURRENT_DATE - 4, 2500000, 2350000, 2650000, 4),
  ('집행검', '무기', CURRENT_DATE - 3, 2480000, 2300000, 2700000, 3),
  ('집행검', '무기', CURRENT_DATE - 2, 2520000, 2400000, 2600000, 2),
  ('집행검', '무기', CURRENT_DATE - 1, 2550000, 2400000, 2700000, 3),
  ('집행검', '무기', CURRENT_DATE, 2500000, 2350000, 2650000, 1),

  -- 다크엘프 장궁
  ('다크엘프 장궁', '무기', CURRENT_DATE - 6, 1700000, 1500000, 1900000, 2),
  ('다크엘프 장궁', '무기', CURRENT_DATE - 5, 1750000, 1600000, 1900000, 3),
  ('다크엘프 장궁', '무기', CURRENT_DATE - 4, 1800000, 1650000, 2000000, 2),
  ('다크엘프 장궁', '무기', CURRENT_DATE - 3, 1780000, 1600000, 1950000, 4),
  ('다크엘프 장궁', '무기', CURRENT_DATE - 2, 1820000, 1700000, 1950000, 2),
  ('다크엘프 장궁', '무기', CURRENT_DATE - 1, 1800000, 1650000, 1900000, 3),

  -- 마법사의 지팡이
  ('마법사의 지팡이', '무기', CURRENT_DATE - 6, 3100000, 2800000, 3400000, 2),
  ('마법사의 지팡이', '무기', CURRENT_DATE - 5, 3150000, 2900000, 3500000, 3),
  ('마법사의 지팡이', '무기', CURRENT_DATE - 4, 3200000, 3000000, 3400000, 2),
  ('마법사의 지팡이', '무기', CURRENT_DATE - 3, 3180000, 2950000, 3450000, 3),
  ('마법사의 지팡이', '무기', CURRENT_DATE - 2, 3250000, 3100000, 3500000, 2),
  ('마법사의 지팡이', '무기', CURRENT_DATE - 1, 3200000, 3000000, 3400000, 4),

  -- 암살자의 단검
  ('암살자의 단검', '무기', CURRENT_DATE - 6, 1450000, 1300000, 1600000, 3),
  ('암살자의 단검', '무기', CURRENT_DATE - 5, 1480000, 1350000, 1650000, 2),
  ('암살자의 단검', '무기', CURRENT_DATE - 4, 1500000, 1400000, 1600000, 3),
  ('암살자의 단검', '무기', CURRENT_DATE - 3, 1520000, 1400000, 1650000, 4),
  ('암살자의 단검', '무기', CURRENT_DATE - 2, 1500000, 1350000, 1600000, 2),
  ('암살자의 단검', '무기', CURRENT_DATE - 1, 1480000, 1300000, 1600000, 3),

  -- 빼지팡이
  ('빼지팡이', '무기', CURRENT_DATE - 5, 480000, 400000, 550000, 2),
  ('빼지팡이', '무기', CURRENT_DATE - 4, 500000, 420000, 580000, 3),
  ('빼지팡이', '무기', CURRENT_DATE - 3, 490000, 400000, 560000, 2),
  ('빼지팡이', '무기', CURRENT_DATE - 2, 510000, 450000, 600000, 3),
  ('빼지팡이', '무기', CURRENT_DATE - 1, 500000, 430000, 570000, 2),

  -- 미스릴 대검
  ('미스릴 대검', '무기', CURRENT_DATE - 6, 1950000, 1800000, 2100000, 2),
  ('미스릴 대검', '무기', CURRENT_DATE - 5, 2000000, 1850000, 2200000, 3),
  ('미스릴 대검', '무기', CURRENT_DATE - 4, 2050000, 1900000, 2200000, 2),
  ('미스릴 대검', '무기', CURRENT_DATE - 3, 2000000, 1850000, 2150000, 4),
  ('미스릴 대검', '무기', CURRENT_DATE - 2, 2020000, 1900000, 2100000, 3),
  ('미스릴 대검', '무기', CURRENT_DATE - 1, 2050000, 1900000, 2200000, 2),

  -- 화염의 활
  ('화염의 활', '무기', CURRENT_DATE - 5, 1200000, 1050000, 1400000, 3),
  ('화염의 활', '무기', CURRENT_DATE - 4, 1250000, 1100000, 1400000, 2),
  ('화염의 활', '무기', CURRENT_DATE - 3, 1230000, 1050000, 1350000, 3),
  ('화염의 활', '무기', CURRENT_DATE - 2, 1280000, 1150000, 1400000, 2),
  ('화염의 활', '무기', CURRENT_DATE - 1, 1250000, 1100000, 1400000, 4),

  -- 축복받은 너클
  ('축복받은 너클', '무기', CURRENT_DATE - 6, 850000, 700000, 1000000, 2),
  ('축복받은 너클', '무기', CURRENT_DATE - 5, 880000, 750000, 1050000, 3),
  ('축복받은 너클', '무기', CURRENT_DATE - 4, 900000, 800000, 1000000, 2),
  ('축복받은 너클', '무기', CURRENT_DATE - 3, 870000, 750000, 1000000, 3),
  ('축복받은 너클', '무기', CURRENT_DATE - 2, 890000, 780000, 1050000, 2),
  ('축복받은 너클', '무기', CURRENT_DATE - 1, 900000, 800000, 1000000, 3),

  -- 엘프의 장검
  ('엘프의 장검', '무기', CURRENT_DATE - 5, 1600000, 1400000, 1800000, 2),
  ('엘프의 장검', '무기', CURRENT_DATE - 4, 1650000, 1500000, 1850000, 3),
  ('엘프의 장검', '무기', CURRENT_DATE - 3, 1620000, 1450000, 1800000, 4),
  ('엘프의 장검', '무기', CURRENT_DATE - 2, 1680000, 1500000, 1850000, 2),
  ('엘프의 장검', '무기', CURRENT_DATE - 1, 1650000, 1500000, 1800000, 3),

  -- 추가 아이템: 방어구류
  ('흑기사의 갑옷', '방어구', CURRENT_DATE - 6, 5500000, 5000000, 6000000, 2),
  ('흑기사의 갑옷', '방어구', CURRENT_DATE - 5, 5600000, 5100000, 6200000, 3),
  ('흑기사의 갑옷', '방어구', CURRENT_DATE - 4, 5700000, 5200000, 6100000, 2),
  ('흑기사의 갑옷', '방어구', CURRENT_DATE - 3, 5650000, 5100000, 6200000, 4),
  ('흑기사의 갑옷', '방어구', CURRENT_DATE - 2, 5750000, 5300000, 6100000, 2),
  ('흑기사의 갑옷', '방어구', CURRENT_DATE - 1, 5700000, 5200000, 6200000, 3),

  ('드래곤 스케일 실드', '방어구', CURRENT_DATE - 5, 3800000, 3500000, 4200000, 3),
  ('드래곤 스케일 실드', '방어구', CURRENT_DATE - 4, 3850000, 3600000, 4100000, 2),
  ('드래곤 스케일 실드', '방어구', CURRENT_DATE - 3, 3900000, 3600000, 4300000, 3),
  ('드래곤 스케일 실드', '방어구', CURRENT_DATE - 2, 3850000, 3500000, 4200000, 4),
  ('드래곤 스케일 실드', '방어구', CURRENT_DATE - 1, 3900000, 3600000, 4200000, 2),

  -- 추가 아이템: 장신구류
  ('지혜의 반지', '장신구', CURRENT_DATE - 6, 750000, 600000, 900000, 3),
  ('지혜의 반지', '장신구', CURRENT_DATE - 5, 780000, 650000, 950000, 2),
  ('지혜의 반지', '장신구', CURRENT_DATE - 4, 800000, 700000, 900000, 4),
  ('지혜의 반지', '장신구', CURRENT_DATE - 3, 770000, 650000, 900000, 3),
  ('지혜의 반지', '장신구', CURRENT_DATE - 2, 790000, 680000, 950000, 2),
  ('지혜의 반지', '장신구', CURRENT_DATE - 1, 800000, 700000, 900000, 3),

  ('속도의 목걸이', '장신구', CURRENT_DATE - 5, 1100000, 950000, 1300000, 2),
  ('속도의 목걸이', '장신구', CURRENT_DATE - 4, 1150000, 1000000, 1350000, 3),
  ('속도의 목걸이', '장신구', CURRENT_DATE - 3, 1120000, 950000, 1300000, 2),
  ('속도의 목걸이', '장신구', CURRENT_DATE - 2, 1180000, 1050000, 1350000, 3),
  ('속도의 목걸이', '장신구', CURRENT_DATE - 1, 1150000, 1000000, 1300000, 4)

ON CONFLICT (item_name, date) DO UPDATE SET
  avg_price = EXCLUDED.avg_price,
  min_price = EXCLUDED.min_price,
  max_price = EXCLUDED.max_price,
  trade_count = EXCLUDED.trade_count;
