# LOD 포털 확장 시스템 설계서

> 작성일: 2026-02-07
> 프로젝트: 어둠의전설(LOD) 게임 종합 도우미 포털

## 목차

1. [기능 요약](#1-기능-요약)
2. [추천 기술 스택](#2-추천-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [DB 스키마](#4-db-스키마)
5. [API 설계](#5-api-설계)
6. [Discord 연동 설계](#6-discord-연동-설계)
7. [정기 작업 및 데이터 집계](#7-정기-작업-및-데이터-집계)
8. [프론트엔드 페이지 설계](#8-프론트엔드-페이지-설계)
9. [비용 분석](#9-비용-분석)
10. [사전 준비 체크리스트](#10-사전-준비-체크리스트)
11. [구현 우선순위](#11-구현-우선순위)
12. [부록: 기술 비교](#12-부록-기술-비교)

---

## 1. 기능 요약

| 기능 | 설명 | 웹 | Discord |
|------|------|-----|---------|
| **거래소** | 아이템 매물 등록/검색/거래 | 등록 폼, 목록, 검색 | 신규 매물 Embed 알림 |
| **파티모집** | 파티/구인 글 작성 | 모집 폼, 목록, 상태관리 | 모집글 Embed 알림 |
| **시세 현황** | 아이템 가격 추이 차트 | 시세 차트, 검색, TOP N | - |
| **사기 신고** | 사기 피해 신고 | 신고 폼, 이력 조회 | @운영진 멘션 긴급 알림 |
| **관심 알림** | 관심 아이템 가격 알림 | 알림 설정 UI | @유저 멘션 알림 |

---

## 2. 추천 기술 스택

### 왜 Supabase인가?

| 요구사항 | Supabase 제공 기능 | 선택 이유 |
|----------|-------------------|-----------|
| DB | PostgreSQL (무료 500MB) | 강력한 SQL, JSON, 전문검색 지원 |
| 인증 | Discord OAuth 내장 | 설정만으로 Discord 로그인 완성 |
| API | PostgREST 자동 생성 | 테이블 만들면 REST API 자동, 코드 불필요 |
| 실시간 | Realtime Subscriptions | DB 변경 시 프론트에 자동 Push |
| Webhook | Database Webhooks + Edge Functions | INSERT 이벤트 → Discord 알림 자동 발송 |
| 보안 | Row Level Security (RLS) | SQL 정책으로 "본인 글만 수정/삭제" 선언적 구현 |
| 파일 | Storage (1GB 무료) | 사기 신고 증거 스크린샷 업로드 |
| 비용 | 무료 티어 충분 | 5만 MAU, 500MB DB, 별도 서버 불필요 |

### 전체 기술 스택

```
┌──────────────────────────────────────────────────────┐
│  프론트엔드 (기존 유지 + 확장)                          │
│  React 19 + TypeScript + Vite 7 + shadcn/ui          │
│  + Recharts (시세 차트)                                │
│  + @supabase/supabase-js (DB/Auth/Realtime 클라이언트) │
├──────────────────────────────────────────────────────┤
│  백엔드 (Supabase BaaS - 서버 운영 불필요)             │
│  PostgreSQL ─→ 자동 REST API (PostgREST)              │
│  Auth ────────→ Discord OAuth2                        │
│  Edge Functions → Discord Webhook 발송 + 데이터 집계   │
│  DB Webhooks ──→ Edge Function 자동 트리거             │
│  Realtime ────→ 실시간 구독 (목록 자동 갱신)            │
│  Storage ────→ 이미지 업로드 (증거 스크린샷)            │
├──────────────────────────────────────────────────────┤
│  정기 작업 (GitHub Actions Cron - 무료)               │
│  시세 집계 ──→ 매일 자정 Edge Function 호출            │
│  만료 처리 ──→ 매시간 Edge Function 호출               │
├──────────────────────────────────────────────────────┤
│  외부 연동                                            │
│  Discord Webhook API → 채널별 Embed 알림              │
│  Discord OAuth2 ─────→ 사용자 인증 + 멘션용 ID 확보    │
└──────────────────────────────────────────────────────┘
```

### 핵심 라이브러리

| 라이브러리 | 용도 | 설치 위치 |
|-----------|------|----------|
| `@supabase/supabase-js` | DB 쿼리, Auth, Realtime | 프론트엔드 |
| `recharts` | 시세 LineChart (반응형) | 프론트엔드 |
| fetch API | Discord Webhook 전송 | Edge Function (Deno) |

---

## 3. 시스템 아키텍처

### 전체 데이터 흐름

```
[사용자] ──── Discord OAuth ────→ [Supabase Auth]
    │                                    │
    │                                JWT 발급
    │                                    │
    ▼                                    ▼
[웹 포털] ────── REST API ─────→ [Supabase PostgreSQL]
    │                                    │
    │   supabase-js 클라이언트            │
    │   (RLS 자동 적용)                   │
    │                                    ├── DB Webhook (INSERT 트리거)
    │                                    │       │
    │                                    │       ▼
    │                                    │   [Edge Function: discord-notify]
    │                                    │       │
    │                                    │       ├── Discord Webhook POST
    │                                    │       │       ├── #거래소 채널
    │                                    │       │       ├── #파티모집 채널
    │                                    │       │       └── #사기신고 채널 (@운영진)
    │                                    │       │
    │                                    │       └── 관심 아이템 @유저 멘션
    │                                    │
    │                                    └── 정기 처리 (GitHub Actions 트리거)
    │                                            │
    │                                            ├── [Edge Function: daily-aggregate]
    │                                            │     └── 시세 집계 → trade_price_history
    │                                            │
    │                                            └── [Edge Function: cleanup]
    │                                                  ├── 만료 매물 → expired
    │                                                  └── 만료 모집글 → closed
    │
    ├── Realtime Subscribe ──→ 거래소/모집 목록 실시간 갱신
    │
    └── Recharts ──→ 시세 차트 렌더링
```

### Discord 알림 흐름 (상세)

```
거래 등록 알림:
  1. 사용자가 웹에서 거래 매물 등록
  2. supabase-js → trades 테이블 INSERT
  3. Database Webhook 감지 → Edge Function 호출
  4. Edge Function:
     a. 거래 Embed 메시지 생성 (아이템명, 가격, 판매자)
     b. 관심 아이템 등록자 조회 → @유저 멘션 추가
     c. Discord #거래소 Webhook URL로 POST
  5. Discord #거래소 채널에 알림 표시

사기 신고 알림:
  1. 사용자가 웹에서 사기 신고 작성
  2. supabase-js → scam_reports 테이블 INSERT
  3. Database Webhook → Edge Function 호출
  4. Edge Function → Discord #사기신고 채널:
     - Embed: 신고 내용, 피의자, 증거
     - content: "<@&운영진역할ID> 사기 신고가 접수되었습니다"
     - allowed_mentions: { roles: ['운영진역할ID'] }
  5. 운영진이 Discord에서 즉시 확인
```

---

## 4. DB 스키마

### ERD 개요

```
auth.users (Supabase 내장)
    │
    ▼
profiles ──────┐
               ├── trades ────────→ trade_price_history (집계)
               ├── party_recruits
               ├── scam_reports
               └── user_alert_settings

discord_webhook_config (관리자 전용)
```

### 테이블 정의

#### `profiles` (사용자 프로필)
```sql
CREATE TYPE game_class_enum AS ENUM (
  'warrior', 'rogue', 'mage', 'cleric', 'taoist'
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_id TEXT UNIQUE NOT NULL,         -- Discord 사용자 ID (멘션용)
  discord_username TEXT NOT NULL,           -- Discord 닉네임
  discord_avatar TEXT,                      -- 아바타 URL
  game_nickname TEXT,                       -- 게임 내 닉네임
  game_class game_class_enum,              -- 직업
  reputation_score INT DEFAULT 0,           -- 신뢰도 점수
  is_banned BOOLEAN DEFAULT FALSE,          -- 차단 여부
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `trades` (거래 매물)
```sql
CREATE TYPE trade_status AS ENUM (
  'active',       -- 판매 중
  'reserved',     -- 예약 중
  'sold',         -- 판매 완료
  'expired',      -- 기간 만료
  'cancelled'     -- 취소
);

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES profiles(id),

  -- 아이템 정보
  item_name TEXT NOT NULL,                 -- 아이템명
  item_category TEXT NOT NULL,             -- 카테고리 (무기, 방어구, 소비, 기타)
  item_description TEXT,                   -- 상세 설명

  -- 거래 정보
  price BIGINT NOT NULL,                   -- 가격 (게임 화폐 단위)
  price_unit TEXT DEFAULT '어둠돈',         -- 화폐 단위
  quantity INT DEFAULT 1,                  -- 수량
  is_negotiable BOOLEAN DEFAULT FALSE,     -- 가격 협상 가능 여부

  -- 상태
  status trade_status DEFAULT 'active',
  buyer_id UUID REFERENCES profiles(id),   -- 구매자 (거래 완료 시)

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_trades_item_name ON trades(item_name);
CREATE INDEX idx_trades_status ON trades(status);
CREATE INDEX idx_trades_category ON trades(item_category);
CREATE INDEX idx_trades_created ON trades(created_at DESC);
```

#### `trade_price_history` (시세 히스토리 - 일별 집계)
```sql
CREATE TABLE trade_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  item_category TEXT NOT NULL,

  -- 일별 통계 (정기 집계로 생성)
  date DATE NOT NULL,
  avg_price BIGINT NOT NULL,               -- 평균가
  min_price BIGINT NOT NULL,               -- 최저가
  max_price BIGINT NOT NULL,               -- 최고가
  trade_count INT NOT NULL,                -- 거래 건수

  UNIQUE(item_name, date)
);

CREATE INDEX idx_price_history_item ON trade_price_history(item_name, date DESC);
```

#### `party_recruits` (파티 모집)
```sql
CREATE TYPE recruit_type_enum AS ENUM (
  'party',        -- 파티 모집
  'guild',        -- 문파 모집
  'raid',         -- 레이드 모집
  'quest',        -- 퀘스트 동행
  'other'         -- 기타
);

CREATE TYPE recruit_status AS ENUM (
  'open',         -- 모집 중
  'full',         -- 모집 완료
  'closed',       -- 마감
  'cancelled'     -- 취소
);

CREATE TABLE party_recruits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id),

  -- 모집 정보
  title TEXT NOT NULL,
  description TEXT,
  recruit_type recruit_type_enum NOT NULL,

  -- 파티 요구사항
  location TEXT,                            -- 장소/던전
  time_slot TEXT,                           -- 시간대
  schedule_at TIMESTAMPTZ,                  -- 예정 시각

  -- 직업별 모집 인원
  need_warrior INT DEFAULT 0,
  need_rogue INT DEFAULT 0,
  need_mage INT DEFAULT 0,
  need_cleric INT DEFAULT 0,
  need_taoist INT DEFAULT 0,
  min_level INT,
  requirements TEXT,                        -- 추가 조건

  -- 상태
  status recruit_status DEFAULT 'open',
  max_members INT DEFAULT 5,
  current_members INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX idx_recruits_status ON party_recruits(status);
CREATE INDEX idx_recruits_type ON party_recruits(recruit_type);
CREATE INDEX idx_recruits_created ON party_recruits(created_at DESC);
```

#### `scam_reports` (사기 신고)
```sql
CREATE TYPE report_status AS ENUM (
  'pending',      -- 접수됨
  'reviewing',    -- 검토 중
  'confirmed',    -- 사기 확인
  'dismissed',    -- 기각
  'resolved'      -- 처리 완료
);

CREATE TABLE scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),

  -- 신고 대상
  suspect_name TEXT NOT NULL,               -- 피의자 게임닉/디스코드명
  suspect_discord_id TEXT,                  -- 피의자 Discord ID

  -- 신고 내용
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],                     -- 증거 스크린샷 URL 배열
  related_trade_id UUID REFERENCES trades(id),

  -- 처리 상태
  status report_status DEFAULT 'pending',
  admin_note TEXT,                          -- 운영진 처리 메모
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `discord_webhook_config` (Webhook 설정 - 관리자 전용)
```sql
CREATE TABLE discord_webhook_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_name TEXT NOT NULL UNIQUE,        -- 'trades', 'recruits', 'scam_reports'
  webhook_url TEXT NOT NULL,                -- Discord Webhook URL (비공개!)
  admin_role_id TEXT,                       -- 운영진 역할 ID (멘션용)
  is_active BOOLEAN DEFAULT TRUE
);
```

#### `user_alert_settings` (사용자별 알림 설정)
```sql
CREATE TABLE user_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),

  -- 관심 아이템 알림
  watch_items TEXT[],                       -- 관심 아이템명 배열
  watch_price_below BIGINT,                -- 이 가격 이하일 때 알림

  -- 파티 모집 알림
  watch_recruit_types recruit_type_enum[],  -- 관심 모집 유형
  watch_classes game_class_enum[],          -- 관심 직업 모집

  notify_discord_dm BOOLEAN DEFAULT TRUE,

  UNIQUE(user_id)
);
```

### RLS 정책 (Row Level Security)
```sql
-- profiles: 모두 조회 가능, 본인만 수정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- trades: 모두 조회, 본인만 등록/수정
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trades viewable" ON trades FOR SELECT USING (true);
CREATE POLICY "Create own trades" ON trades FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Update own trades" ON trades FOR UPDATE USING (auth.uid() = seller_id);

-- party_recruits: 모두 조회, 본인만 등록/수정
ALTER TABLE party_recruits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruits viewable" ON party_recruits FOR SELECT USING (true);
CREATE POLICY "Create own recruits" ON party_recruits FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Update own recruits" ON party_recruits FOR UPDATE USING (auth.uid() = author_id);

-- scam_reports: 본인 신고만 조회, 인증 사용자만 등록
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own reports" ON scam_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Create reports" ON scam_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- user_alert_settings: 본인 설정만 접근
ALTER TABLE user_alert_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View own settings" ON user_alert_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Update own settings" ON user_alert_settings FOR ALL USING (auth.uid() = user_id);

-- discord_webhook_config: 관리자만 (service_role key로만 접근)
ALTER TABLE discord_webhook_config ENABLE ROW LEVEL SECURITY;
-- 일반 사용자 접근 불가, Edge Function에서 service_role key로 조회
```

---

## 5. API 설계

Supabase는 테이블 생성 시 REST API가 자동 생성됩니다. **별도 API 서버 코드 불필요.**

### 거래소 API

```typescript
import { supabase } from '@/lib/supabase';

// 매물 목록 조회 (필터링 + 페이지네이션)
const { data, count } = await supabase
  .from('trades')
  .select('*, seller:profiles(*)', { count: 'exact' })
  .eq('status', 'active')
  .ilike('item_name', `%${keyword}%`)
  .eq('item_category', category)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// 매물 등록
const { data, error } = await supabase
  .from('trades')
  .insert({
    seller_id: user.id,
    item_name: '천무도',
    item_category: '무기',
    price: 50000000,
    quantity: 1,
    is_negotiable: true,
  });

// 매물 상태 변경 (판매완료)
const { error } = await supabase
  .from('trades')
  .update({ status: 'sold', buyer_id: buyerId })
  .eq('id', tradeId);
```

### 시세 조회 API

```typescript
// 특정 아이템 시세 히스토리 (최근 30일)
const { data } = await supabase
  .from('trade_price_history')
  .select('*')
  .eq('item_name', '천무도')
  .gte('date', thirtyDaysAgo)
  .order('date', { ascending: true });

// 인기 아이템 시세 TOP N (거래량 순)
const { data } = await supabase
  .from('trade_price_history')
  .select('item_name, avg_price, trade_count')
  .eq('date', today)
  .order('trade_count', { ascending: false })
  .limit(20);
```

### 파티모집 API

```typescript
// 모집글 목록
const { data } = await supabase
  .from('party_recruits')
  .select('*, author:profiles(*)')
  .eq('status', 'open')
  .order('created_at', { ascending: false });

// 모집글 작성
const { data, error } = await supabase
  .from('party_recruits')
  .insert({
    author_id: user.id,
    title: '얼음던전 3파티 법사 구합니다',
    recruit_type: 'party',
    location: '얼음던전',
    need_mage: 2,
    min_level: 50,
    schedule_at: '2026-02-08T20:00:00+09:00',
  });
```

### 사기 신고 API

```typescript
// 증거 이미지 업로드 (Supabase Storage)
const { data: uploadData } = await supabase.storage
  .from('evidence')
  .upload(`reports/${Date.now()}.png`, file);

// 신고 접수
const { data, error } = await supabase
  .from('scam_reports')
  .insert({
    reporter_id: user.id,
    suspect_name: '사기꾼닉네임',
    suspect_discord_id: '123456789',
    title: '거래 사기',
    description: '천무도 거래 후 돈만 받고 잠수',
    evidence_urls: [uploadData.path],
    related_trade_id: 'trade-uuid',
  });
```

### 실시간 구독 (Realtime)

```typescript
// 거래소 신규 매물 실시간 감지
const channel = supabase
  .channel('trades-realtime')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'trades' },
    (payload) => {
      // 목록에 새 매물 자동 추가
      setTrades(prev => [payload.new, ...prev]);
    }
  )
  .subscribe();
```

---

## 6. Discord 연동 설계

### 6-1. Webhook 구조

Discord 서버에 채널 3개 + 각각 Webhook 생성:

| 채널 | 용도 | 트리거 |
|------|------|--------|
| `#거래소` | 신규 매물 알림 + 관심 아이템 멘션 | trades INSERT |
| `#파티모집` | 모집글 알림 | party_recruits INSERT |
| `#사기신고` | 신고 알림 + @운영진 멘션 | scam_reports INSERT |

### 6-2. Edge Function: Discord 알림 발송

```typescript
// supabase/functions/discord-notify/index.ts
// Database Webhook이 INSERT 시 자동 호출

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface WebhookPayload {
  type: 'INSERT';
  table: string;
  record: Record<string, unknown>;
  schema: 'public';
}

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  // Webhook URL 매핑
  const webhookUrls: Record<string, string> = {
    trades: Deno.env.get('DISCORD_WEBHOOK_TRADES')!,
    party_recruits: Deno.env.get('DISCORD_WEBHOOK_RECRUITS')!,
    scam_reports: Deno.env.get('DISCORD_WEBHOOK_SCAM')!,
  };

  const webhookUrl = webhookUrls[payload.table];
  if (!webhookUrl) return new Response('Unknown table', { status: 400 });

  let embed: object;
  let content = '';

  switch (payload.table) {
    case 'trades':
      embed = buildTradeEmbed(payload.record);
      // 관심 아이템 등록자 멘션
      content = await getWatcherMentions(payload.record);
      break;
    case 'party_recruits':
      embed = buildRecruitEmbed(payload.record);
      break;
    case 'scam_reports':
      embed = buildScamEmbed(payload.record);
      const adminRoleId = Deno.env.get('DISCORD_ADMIN_ROLE_ID');
      content = `<@&${adminRoleId}> 사기 신고가 접수되었습니다!`;
      break;
  }

  // Discord Webhook 전송 (fetch API, 별도 라이브러리 불필요)
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      embeds: [embed],
      allowed_mentions: { parse: ['roles', 'users'] },
    }),
  });

  return new Response('OK');
});

// ─── Embed 빌더 함수들 ───

function buildTradeEmbed(record: Record<string, unknown>) {
  return {
    title: `새 매물: ${record.item_name}`,
    color: 0x3498db,
    fields: [
      { name: '가격', value: `${Number(record.price).toLocaleString()} ${record.price_unit}`, inline: true },
      { name: '수량', value: `${record.quantity}개`, inline: true },
      { name: '카테고리', value: String(record.item_category), inline: true },
      { name: '협상', value: record.is_negotiable ? '가능' : '불가', inline: true },
    ],
    footer: { text: 'LOD 포털 거래소' },
    timestamp: new Date().toISOString(),
  };
}

function buildRecruitEmbed(record: Record<string, unknown>) {
  const needs = [];
  if (record.need_warrior) needs.push(`전사 ${record.need_warrior}명`);
  if (record.need_rogue)   needs.push(`도적 ${record.need_rogue}명`);
  if (record.need_mage)    needs.push(`법사 ${record.need_mage}명`);
  if (record.need_cleric)  needs.push(`직자 ${record.need_cleric}명`);
  if (record.need_taoist)  needs.push(`도가 ${record.need_taoist}명`);

  return {
    title: `${record.title}`,
    color: 0xe74c3c,
    fields: [
      { name: '장소', value: String(record.location || '미정'), inline: true },
      { name: '시간', value: String(record.time_slot || '미정'), inline: true },
      { name: '모집 직업', value: needs.join(', ') || '자유' },
      { name: '최소 레벨', value: record.min_level ? `Lv.${record.min_level}` : '제한 없음', inline: true },
    ],
    footer: { text: 'LOD 포털 파티모집' },
    timestamp: new Date().toISOString(),
  };
}

function buildScamEmbed(record: Record<string, unknown>) {
  return {
    title: `사기 신고: ${record.title}`,
    color: 0xff0000,
    fields: [
      { name: '피의자', value: String(record.suspect_name), inline: true },
      { name: '상태', value: '접수됨', inline: true },
      { name: '내용', value: String(record.description).slice(0, 200) },
    ],
    footer: { text: 'LOD 포털 사기신고' },
    timestamp: new Date().toISOString(),
  };
}

// ─── 관심 아이템 멘션 ───

async function getWatcherMentions(record: Record<string, unknown>): Promise<string> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: watchers } = await supabase
    .from('user_alert_settings')
    .select('user_id, watch_price_below, profiles(discord_id)')
    .contains('watch_items', [record.item_name]);

  if (!watchers?.length) return '';

  const mentions = watchers
    .filter(w => !w.watch_price_below || Number(record.price) <= w.watch_price_below)
    .map(w => `<@${w.profiles.discord_id}>`)
    .join(' ');

  return mentions ? `${mentions} 관심 아이템이 등록되었습니다!` : '';
}
```

### 6-3. Discord Embed 미리보기

```
┌──────────────────────────────────┐
│ 새 매물: 천무도                   │
│ ─────────────────────────────── │
│ 가격          수량     카테고리   │
│ 50,000,000    1개      무기      │
│ 어둠돈                           │
│ 협상: 가능                       │
│ ─────────────────────────────── │
│ LOD 포털 거래소  ·  2026-02-07   │
└──────────────────────────────────┘
@홍길동 @김철수 관심 아이템이 등록되었습니다!

┌──────────────────────────────────┐
│ 사기 신고: 거래 사기              │
│ ─────────────────────────────── │
│ 피의자        상태                │
│ XXX닉네임     접수됨              │
│                                  │
│ 내용                             │
│ 천무도 거래 후 돈만 받고 잠수...   │
│ ─────────────────────────────── │
│ LOD 포털 사기신고 · 2026-02-07   │
└──────────────────────────────────┘
@운영진 사기 신고가 접수되었습니다!
```

---

## 7. 정기 작업 및 데이터 집계

### 왜 필요한가?

| 작업 | 설명 | 주기 |
|------|------|------|
| **시세 집계** | 거래 데이터 → 일별 평균/최고/최저 계산 | 매일 자정 |
| **매물 만료** | 7일 지난 매물 → `expired` 처리 | 매시간 |
| **모집 마감** | 24시간 지난 모집글 → `closed` 처리 | 매시간 |
| **데이터 정리** | 90일 이상 만료 데이터 삭제 | 매주 |

### 단계별 전략

| 단계 | 방법 | 비용 | 복잡도 |
|------|------|------|--------|
| **시작 (추천)** | GitHub Actions Cron → Edge Function 호출 | $0 | 낮음 |
| **성장기** | Supabase pg_cron (Pro 플랜) | $25/월 | 낮음 |
| **대형** | 별도 서버 (Node.js cron) | $5+/월 | 높음 |

### 시작 단계: GitHub Actions Cron (무료)

이미 GitHub Pages 배포에 Actions를 사용하므로, 같은 방식으로 정기 작업 추가:

```yaml
# .github/workflows/daily-aggregate.yml
name: Daily Price Aggregation
on:
  schedule:
    - cron: '0 15 * * *'   # UTC 15:00 = KST 자정 00:00
  workflow_dispatch:         # 수동 실행 가능

jobs:
  aggregate:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger price aggregation
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_URL }}/functions/v1/daily-aggregate" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            -H "Content-Type: application/json"
```

```yaml
# .github/workflows/hourly-cleanup.yml
name: Hourly Cleanup
on:
  schedule:
    - cron: '0 * * * *'    # 매시간
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger cleanup
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_URL }}/functions/v1/cleanup" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}" \
            -H "Content-Type: application/json"
```

### Edge Function: 시세 집계

```typescript
// supabase/functions/daily-aggregate/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // 어제 날짜의 거래 데이터를 집계
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  const { data: trades } = await supabase
    .from('trades')
    .select('item_name, item_category, price')
    .gte('created_at', `${dateStr}T00:00:00`)
    .lt('created_at', `${dateStr}T23:59:59`)
    .in('status', ['active', 'sold']);

  if (!trades?.length) return new Response('No trades to aggregate');

  // 아이템별 집계
  const grouped: Record<string, { prices: number[]; category: string }> = {};
  for (const trade of trades) {
    const key = trade.item_name;
    if (!grouped[key]) grouped[key] = { prices: [], category: trade.item_category };
    grouped[key].prices.push(trade.price);
  }

  // trade_price_history에 UPSERT
  const records = Object.entries(grouped).map(([name, { prices, category }]) => ({
    item_name: name,
    item_category: category,
    date: dateStr,
    avg_price: Math.round(prices.reduce((a, b) => a + b) / prices.length),
    min_price: Math.min(...prices),
    max_price: Math.max(...prices),
    trade_count: prices.length,
  }));

  const { error } = await supabase
    .from('trade_price_history')
    .upsert(records, { onConflict: 'item_name,date' });

  return new Response(error ? `Error: ${error.message}` : `Aggregated ${records.length} items`);
});
```

### Edge Function: 만료 처리

```typescript
// supabase/functions/cleanup/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const now = new Date().toISOString();

  // 만료된 매물 처리
  const { count: expiredTrades } = await supabase
    .from('trades')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', now);

  // 만료된 모집글 처리
  const { count: closedRecruits } = await supabase
    .from('party_recruits')
    .update({ status: 'closed' })
    .eq('status', 'open')
    .lt('expires_at', now);

  return new Response(
    `Expired: ${expiredTrades ?? 0} trades, ${closedRecruits ?? 0} recruits`
  );
});
```

### 성장 단계: pg_cron (Pro 플랜)

Pro 플랜($25/월)으로 전환하면 GitHub Actions 대신 DB 내장 스케줄러 사용 가능:

```sql
-- pg_cron 확장 활성화 (Supabase 대시보드에서)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 시세 집계 함수
CREATE OR REPLACE FUNCTION aggregate_daily_prices()
RETURNS void AS $$
BEGIN
  INSERT INTO trade_price_history (item_name, item_category, date, avg_price, min_price, max_price, trade_count)
  SELECT
    item_name, item_category, CURRENT_DATE - 1,
    AVG(price)::bigint, MIN(price), MAX(price), COUNT(*)
  FROM trades
  WHERE created_at >= CURRENT_DATE - 1 AND created_at < CURRENT_DATE
    AND status IN ('active', 'sold')
  GROUP BY item_name, item_category
  ON CONFLICT (item_name, date) DO UPDATE SET
    avg_price = EXCLUDED.avg_price,
    min_price = EXCLUDED.min_price,
    max_price = EXCLUDED.max_price,
    trade_count = EXCLUDED.trade_count;
END;
$$ LANGUAGE plpgsql;

-- 스케줄 등록
SELECT cron.schedule('daily-aggregate', '0 0 * * *', 'SELECT aggregate_daily_prices()');
SELECT cron.schedule('expire-trades', '0 * * * *',
  $$UPDATE trades SET status = 'expired' WHERE expires_at < NOW() AND status = 'active'$$);
SELECT cron.schedule('close-recruits', '0 * * * *',
  $$UPDATE party_recruits SET status = 'closed' WHERE expires_at < NOW() AND status = 'open'$$);
```

---

## 8. 프론트엔드 페이지 설계

### 라우트 구조

```
기존 페이지:
  / ..................... 파티 현황
  /calculator ........... 라르 계산기
  /search ............... DB 검색
  /wiki ................. 위키

신규 페이지:
  /market ............... 거래소 목록          ← NEW
  /market/:id ........... 거래 상세            ← NEW
  /market/new ........... 매물 등록 (로그인 필요) ← NEW
  /price ................ 시세 현황            ← NEW
  /recruit .............. 파티 모집 목록        ← NEW
  /recruit/new .......... 모집글 작성           ← NEW
  /report ............... 사기 신고             ← NEW
  /profile .............. 내 프로필 + 알림 설정  ← NEW
  /login ................ Discord 로그인        ← NEW
```

### 8-1. 거래소 페이지 (`/market`)

```
┌─────────────────────────────────────────────────┐
│  [검색: 아이템명]  [카테고리 ▼]  [정렬 ▼]        │
│  [가격범위: 최소 ~ 최대]  [+ 매물등록]            │
├─────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │ 천무도     │  │ 수라갑주   │  │ 봉황의장   │   │
│  │ 무기       │  │ 방어구     │  │ 소비       │   │
│  │            │  │            │  │            │   │
│  │ 5,000만    │  │ 3,000만    │  │ 100만      │   │
│  │ 협상가능   │  │            │  │ x10        │   │
│  │ 판매자A    │  │ 판매자B    │  │ 판매자C    │   │
│  │ 2시간 전   │  │ 5시간 전   │  │ 1일 전     │   │
│  └───────────┘  └───────────┘  └───────────┘   │
│                                                 │
│  [1] [2] [3] ... [10]  페이지네이션              │
└─────────────────────────────────────────────────┘
```

### 8-2. 시세 현황 페이지 (`/price`)

```
┌─────────────────────────────────────────────────┐
│  [검색: 아이템명]  [기간: 7일 | 30일 | 90일]     │
├─────────────────────────────────────────────────┤
│  천무도 시세 추이                                 │
│  ┌──────────────────────────────────────┐       │
│  │      ╱╲                              │       │
│  │     ╱  ╲    ╱╲                       │       │  ← Recharts LineChart
│  │    ╱    ╲  ╱  ╲  ╱╲                 │       │     평균가 / 최고가 / 최저가
│  │   ╱      ╲╱    ╲╱  ╲                │       │     3개 Line, 반응형
│  │  2/1   2/3   2/5   2/7              │       │
│  └──────────────────────────────────────┘       │
│                                                 │
│  현재 평균가: 5,200만      거래량: 15건/일       │
│  최고가: 6,000만           최저가: 4,500만       │
├─────────────────────────────────────────────────┤
│  인기 시세 TOP 10                                │
│  ┌──────────────────────────────────────┐       │
│  │ 1. 천무도     5,200만  ▲ 200만 (+4%) │       │
│  │ 2. 수라갑주   3,100만  ▼  50만 (-2%) │       │
│  │ 3. 봉황의장     800만  ─              │       │
│  │ ...                                   │       │
│  └──────────────────────────────────────┘       │
└─────────────────────────────────────────────────┘
```

### 8-3. 파티 모집 페이지 (`/recruit`)

```
┌─────────────────────────────────────────────────┐
│  [유형 ▼: 전체|파티|문파|레이드]  [+ 모집글 작성] │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐   │
│  │ 얼음던전 3파티 법사 구합니다              │   │
│  │ 작성자: 홍길동  ·  30분 전               │   │
│  │ 장소: 얼음던전  ·  시간: 오후 8시         │   │
│  │ 모집: [법사 x2] [직자 x1]               │   │
│  │ Lv.50+  ·  상태: 모집중 (2/5)           │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │ 활성문파 신규 문도 모집                    │   │
│  │ ...                                      │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### 8-4. 사기 신고 페이지 (`/report`)

```
┌─────────────────────────────────────────────────┐
│  사기 신고                                       │
├─────────────────────────────────────────────────┤
│  피의자 닉네임:  [______________]                 │
│  피의자 Discord: [______________]  (선택)         │
│  관련 거래:      [거래 선택 ▼]     (선택)         │
│                                                 │
│  제목:    [____________________________]         │
│  상세 내용:                                      │
│  ┌──────────────────────────────────────┐       │
│  │                                      │       │
│  │                                      │       │
│  └──────────────────────────────────────┘       │
│                                                 │
│  증거 스크린샷: [파일 업로드] (최대 5장)           │
│                                                 │
│  [신고 접수]                                     │
│  * 허위 신고 시 제재를 받을 수 있습니다            │
└─────────────────────────────────────────────────┘
```

### 8-5. 프로필 + 알림 설정 페이지 (`/profile`)

```
┌─────────────────────────────────────────────────┐
│  내 프로필                                       │
├─────────────────────────────────────────────────┤
│  [아바타]  홍길동#1234                            │
│  게임 닉네임: [__________]                        │
│  직업: [전사 ▼]                                  │
│  신뢰도: 85점                                    │
├─────────────────────────────────────────────────┤
│  알림 설정                                       │
│  ┌──────────────────────────────────────┐       │
│  │ 관심 아이템: [천무도] [수라갑주] [+추가]│       │
│  │ 가격 알림: [____]만 이하일 때           │       │
│  │ 모집 알림: [v] 파티 [ ] 문파 [ ] 레이드 │       │
│  │ 직업 알림: [v] 법사 [v] 직자           │       │
│  └──────────────────────────────────────┘       │
├─────────────────────────────────────────────────┤
│  내 거래 내역  ·  내 모집글  ·  내 신고 내역      │
└─────────────────────────────────────────────────┘
```

---

## 9. 비용 분석

### Supabase 요금제 (2026년 기준)

| | Free ($0/월) | Pro ($25/월) |
|---|---|---|
| **DB 용량** | 500MB | 8GB |
| **Auth MAU** | 50,000명 | 100,000명 |
| **파일 저장** | 1GB | 100GB |
| **Edge Function** | 50만 호출/월 | 200만 호출/월 |
| **API 요청** | **무제한** | **무제한** |
| **대역폭** | 2GB | 250GB |
| **pg_cron** | X | O |
| **비활성 정지** | 1주일 후 정지 | 정지 안 됨 |

### Pro 플랜 초과 비용

| 항목 | 초과 단가 |
|------|----------|
| Auth MAU | $0.00325/명 |
| DB 용량 | $0.125/GB |
| 파일 저장 | $0.021/GB |
| 대역폭 | $0.09/GB |

**Spend Cap (과금 방지)**: Pro 플랜에 기본 ON. 한도 초과 시 **서비스 멈춤** (과금 아님). 예상 못한 요금 폭탄 없음.

### LOD 포털 현실적 비용 예측

| 커뮤니티 규모 | MAU 예상 | 월 비용 | 플랜 |
|-------------|---------|---------|------|
| 초기 (지인) | ~100명 | **$0** | Free |
| 성장기 | ~1,000명 | **$0** | Free |
| 활성 커뮤니티 | ~5,000명 | **$0** | Free |
| 대형 | ~50,000명 | **$25** | Pro |
| 초대형 | 10만+ | $25 + 초과분 | Pro |

### Free 플랜 주의사항

- **1주일 비활성 시 프로젝트 일시정지** → 다시 깨워야 함 (수동)
- 활성 프로젝트 **2개까지**
- LOD 커뮤니티 규모로는 Free로 충분하나, 정지 이슈가 불편할 수 있음
- 정기 작업(GitHub Actions)이 매시간 호출하면 정지 방지 효과도 있음

### 전체 비용 요약

| 서비스 | 시작 단계 | 성장 단계 |
|--------|----------|----------|
| Supabase | $0 (Free) | $25/월 (Pro) |
| GitHub Actions | $0 (무료 2,000분/월) | $0 |
| GitHub Pages | $0 | $0 |
| Discord Webhook | $0 | $0 |
| **합계** | **$0** | **$25/월** |

### Supabase 대안 비교

| 대안 | 장점 | 단점 |
|------|------|------|
| **Firebase** | Google 인프라, 넉넉한 무료 | 읽기/쓰기 과금, NoSQL (SQL 아님) |
| **VPS + PostgreSQL** | 완전한 통제, 고정 비용 $5/월 | 서버 관리 직접, 개발 시간 대폭 증가 |
| **PocketBase** | Go 바이너리 하나, 셀프호스팅 | 소규모 전용, 직접 운영 필요 |
| **Appwrite** | 오픈소스 BaaS, 셀프호스팅 | 생태계 Supabase보다 작음 |

---

## 10. 사전 준비 체크리스트

### Step 1: Supabase 프로젝트 생성
- [ ] https://supabase.com 가입 (GitHub 계정으로 가능)
- [ ] 새 프로젝트 생성
  - 리전: **Northeast Asia (ap-northeast-1)** 추천
  - 비밀번호: 강력한 DB 비밀번호 설정 (메모 필수)
- [ ] 아래 값 메모:
  - Dashboard → Settings → API
  - **Project URL**: `https://xxxx.supabase.co`
  - **anon (public) key**: `eyJhbGci...`
  - **service_role key**: `eyJhbGci...` (비공개! Edge Function용)

### Step 2: Discord 앱 생성
- [ ] https://discord.com/developers/applications 접속
- [ ] "New Application" → 앱 이름: "LOD 포털"
- [ ] **OAuth2 설정:**
  - Redirects에 추가: `https://<supabase-project-ref>.supabase.co/auth/v1/callback`
  - **Client ID** 메모
  - **Client Secret** 메모 (Reset Secret으로 생성)

### Step 3: Discord 서버 설정
- [ ] Discord 서버에 채널 3개 생성:
  - `#거래소`
  - `#파티모집`
  - `#사기신고`
- [ ] 각 채널마다 Webhook 생성:
  - 채널 설정 → 연동 → 웹후크 → 새 웹후크 → **URL 복사**
  - 3개의 Webhook URL 메모
- [ ] 운영진 역할(Role) ID 메모:
  - Discord 설정 → 앱 설정 → 고급 → **개발자 모드 ON**
  - 서버 설정 → 역할 → 운영진 역할 우클릭 → **"역할 ID 복사"**

### Step 4: Supabase에 Discord OAuth 연결
- [ ] Supabase Dashboard → Authentication → Providers → Discord
  - Client ID 입력
  - Client Secret 입력
  - **활성화 ON**

### Step 5: Supabase 환경변수 등록
- [ ] Supabase Dashboard → Edge Functions → Secrets에 추가:
  ```
  DISCORD_WEBHOOK_TRADES=https://discord.com/api/webhooks/xxxx/yyyy
  DISCORD_WEBHOOK_RECRUITS=https://discord.com/api/webhooks/xxxx/yyyy
  DISCORD_WEBHOOK_SCAM=https://discord.com/api/webhooks/xxxx/yyyy
  DISCORD_ADMIN_ROLE_ID=123456789012345678
  ```

### Step 6: 프로젝트 환경 파일
- [ ] 프로젝트 루트에 `.env.local` 생성 (**Git에 절대 올리지 말 것!**)
  ```
  VITE_SUPABASE_URL=https://xxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJhbGci...
  ```
- [ ] `.gitignore`에 `.env.local` 확인
- [ ] GitHub Repository → Settings → Secrets에 추가:
  ```
  SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_SERVICE_KEY=eyJhbGci...   (service_role key)
  ```

### 준비물 총정리

| 항목 | 어디서 얻나 | 메모할 값 | 보안 |
|------|-----------|----------|------|
| Supabase Project URL | supabase.com 대시보드 | `https://xxxx.supabase.co` | 공개 가능 |
| Supabase anon key | supabase.com 대시보드 | `eyJhbGci...` | 공개 가능 (RLS로 보호) |
| Supabase service_role key | supabase.com 대시보드 | `eyJhbGci...` | **비공개!** 서버 전용 |
| Discord Client ID | discord.com/developers | 숫자 | 공개 가능 |
| Discord Client Secret | discord.com/developers | 문자열 | **비공개!** |
| Discord Webhook URL x3 | Discord 채널 설정 | `https://discord.com/api/webhooks/...` | **비공개!** |
| Discord Admin Role ID | Discord 개발자 모드 | 숫자 | 공개 가능 |

---

## 11. 구현 우선순위

### Phase 1: 인프라 + 인증 (1~2일)
1. Supabase 프로젝트 생성 + DB 테이블/RLS 생성
2. `@supabase/supabase-js` 설치 + 클라이언트 초기화
3. Discord OAuth 로그인 구현
4. 프로필 페이지 (`/profile`)
5. Header에 로그인/로그아웃 버튼

### Phase 2: 거래소 (3~5일)
1. 거래소 목록 페이지 (`/market`) - 검색, 필터, 페이지네이션
2. 매물 등록 폼 (`/market/new`)
3. 거래 상세 페이지 (`/market/:id`)
4. Edge Function: Discord 거래 알림

### Phase 3: 시세 현황 (2~3일)
1. `recharts` 설치
2. 시세 페이지 (`/price`) - LineChart + TOP N
3. Edge Function: 시세 집계 (`daily-aggregate`)
4. GitHub Actions: 정기 실행 워크플로우

### Phase 4: 파티 모집 (2~3일)
1. 모집글 목록/작성 페이지 (`/recruit`)
2. 직업별 모집 현황 Badge 표시
3. Edge Function: Discord 모집 알림
4. Edge Function + GitHub Actions: 만료 처리 (`cleanup`)

### Phase 5: 사기 신고 + 고급 기능 (2~3일)
1. 신고 폼 + 이미지 업로드 (Supabase Storage)
2. Edge Function: Discord @운영진 멘션 알림
3. 관심 아이템 알림 설정 (`/profile` 내)
4. 사용자 신뢰도 표시

---

## 12. 부록: 기술 비교

### Supabase vs 직접 구현

| 항목 | Supabase | 직접 구현 (Express + PostgreSQL) |
|------|----------|-------------------------------|
| 초기 설정 | 10분 (대시보드) | 수 시간 (서버 + DB 세팅) |
| API 개발 | 자동 생성 (코드 0줄) | 엔드포인트 직접 작성 |
| 인증 | Discord OAuth 체크 한 번 | passport.js 등 직접 구현 |
| 보안 (RLS) | SQL 정책으로 선언적 | 미들웨어마다 직접 작성 |
| 실시간 | Realtime 내장 | Socket.io 직접 구현 |
| 파일 업로드 | Storage 내장 | multer + S3 등 직접 구현 |
| 정기 작업 | Edge Function + GitHub Actions | node-cron 직접 구현 |
| 서버 비용 | $0 (무료 티어) | $5+/월 (VPS) |
| 확장성 | 자동 스케일링 | 직접 관리 |
| **단점** | 복잡한 비즈니스 로직 제한 | 개발 시간 대폭 증가 |

### 최종 결론: **Supabase 추천**

- 프론트엔드(React + TS) 프로젝트에 가장 자연스러운 통합
- TypeScript 타입 자동 생성 (`supabase gen types typescript`)
- 별도 서버 운영/관리 완전 불필요
- Discord OAuth + Webhook + Storage 모두 기본 제공
- 무료 티어로 LOD 커뮤니티 규모 충분히 감당
- Spend Cap으로 예상 못한 과금 방지
- 성장 시 Pro 플랜($25/월)으로 자연스러운 전환
