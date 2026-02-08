# Backend 팀 프롬프트

## 역할
Supabase 기반 백엔드 개발 및 비즈니스 로직 구현 전문 팀

## 필수 참조 문서
- **SYSTEM_DESIGN.md** (`.taskmaster/docs/`) - 시스템 설계서
- **.claude/CLAUDE.md** - 프로젝트 규칙
- **MEMORY.md** - Supabase 연동 정보

## 기술 스택
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- TypeScript
- RPC 함수 (PostgreSQL Functions)
- Supabase Realtime

## Supabase 연동 정보
- **Project Ref**: `wjismpfswlqpkrjatlqe`
- **MCP 서버**: `.mcp.json` 설정 필요
- **클라이언트**: `src/lib/supabase.ts`

## 핵심 원칙

### 1. DB 작업은 반드시 MCP 서버 사용
✅ **올바른 방법**:
```bash
# Supabase MCP 서버를 통한 SQL 실행
# (Claude Code에서 자동 처리)
```

❌ **금지 사항**:
- Supabase 대시보드에서 직접 SQL 실행
- MCP 없이 수동으로 마이그레이션

### 2. 스키마 변경 후 리로드 필수
```sql
-- 스키마 변경 후 반드시 실행
NOTIFY pgrst, 'reload schema';
```

### 3. 권한 관리
```sql
-- anon, authenticated 역할에 권한 부여 필수
GRANT SELECT ON table_name TO anon, authenticated;
GRANT EXECUTE ON FUNCTION function_name TO anon, authenticated;
```

## 프로젝트 구조

### API 레이어
```
src/lib/
├── supabase.ts              # Supabase 클라이언트
├── api.ts                   # 레거시 API (점진적 제거)
├── trades.ts                # 거래소 API
├── recruits.ts              # 파티모집 API
├── notifications.ts         # 알람 API
├── browser-notifications.ts # 브라우저 푸시 알림
├── discord-webhook.ts       # Discord 웹훅 발송
├── scam-reports.ts          # 사기신고 API
├── blacklist.ts             # 블랙리스트 API
├── calculator.ts            # 라르 계산기 (순수 함수)
├── party-utils.ts           # 파티 유틸
├── wiki-parser.ts           # 위키 파서
└── constants.ts             # 상수
```

## 주요 DB 테이블

### 1. 거래소 시스템
```sql
-- 거래 완료 로그
trade_completed_log (
  id, user_id, character_name, item_type, item_name,
  quantity, price_per_unit, total_price, trade_type,
  completed_at, expires_at, status, 등
)

-- 시세 히스토리
trade_price_history (
  id, item_type, item_name, date,
  avg_buy_price, avg_sell_price, total_volume,
  max_price, min_price, trade_count
)
```

### 2. 파티모집 시스템
```sql
-- 파티모집 글
party_recruits (
  id, user_id, author_name, title,
  content, region, slots, filled_slots,
  required_classes, scheduled_at, expires_at, status, 등
)

-- 파티원
party_members (
  id, recruit_id, user_id, character_name,
  character_class, role, joined_at, status
)
```

### 3. 알람 시스템
```sql
-- 알람
notifications (
  id, user_id, type, title, message,
  link, read, created_at
)

-- 사용자 프로필
user_profiles (
  id, discord_id, discord_username, discord_avatar,
  game_nickname, game_class, created_at, updated_at
)

-- 알림 설정
notification_settings (
  user_id, browser_enabled, discord_enabled,
  discord_webhook_url, party_notifications,
  trade_notifications, created_at, updated_at
)
```

### 4. 사기신고 시스템
```sql
-- 신고
scam_reports (
  id, reporter_id, reported_character, report_type,
  description, evidence_url, status, created_at, 등
)

-- 블랙리스트
blacklist (
  id, character_name, reason, report_count,
  evidence, added_by, added_at, expires_at
)
```

## RPC 함수 (PostgreSQL Functions)

### 시세 관련
```sql
-- 시장 가격 조회
get_market_prices(
  p_item_type text,
  p_item_name text DEFAULT NULL,
  p_days integer DEFAULT 7
)

-- 일일 시세 집계
aggregate_daily_prices()
```

### 만료 처리
```sql
-- 거래 만료
expire_old_trades()

-- 모집글 마감
close_expired_recruits()
```

### Edge Functions
```typescript
// Supabase Edge Functions (Deno)
// supabase/functions/recruit-reminder/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 5분 후 시작 예정인 파티 찾기
  const { data: recruits } = await supabase
    .from('party_recruits')
    .select('*')
    .eq('status', 'open')
    .gte('scheduled_at', new Date(Date.now() + 5 * 60 * 1000).toISOString())
    .lte('scheduled_at', new Date(Date.now() + 6 * 60 * 1000).toISOString())

  // 알림 생성 로직
  for (const recruit of recruits || []) {
    await supabase.from('notifications').insert({
      user_id: recruit.author_id,
      type: 'party_reminder',
      title: '파티 모집 알림',
      message: `${recruit.title} 모집이 5분 후 시작됩니다.`,
      link: `/recruit/${recruit.id}`
    })
  }

  return new Response(JSON.stringify({ success: true }))
})
```

**배포**:
```bash
# Supabase CLI로 배포
supabase functions deploy recruit-reminder
```

## API 설계 패턴

### 1. CRUD 기본 패턴
```typescript
// src/lib/trades.ts 예시
import { supabase } from './supabase'
import type { Trade } from '@/types'

export async function getTrades(filters?: TradeFilters): Promise<Trade[]> {
  let query = supabase
    .from('trade_completed_log')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (filters?.item_type) {
    query = query.eq('item_type', filters.item_type)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Trade[]
}

export async function createTrade(trade: CreateTradeInput): Promise<Trade> {
  const { data, error } = await supabase
    .from('trade_completed_log')
    .insert(trade)
    .select()
    .single()

  if (error) throw error
  return data as Trade
}
```

### 2. RPC 호출 패턴
```typescript
export async function getMarketPrices(
  itemType: string,
  itemName?: string,
  days: number = 7
) {
  const { data, error } = await supabase
    .rpc('get_market_prices', {
      p_item_type: itemType,
      p_item_name: itemName,
      p_days: days
    })

  if (error) throw error
  return data
}
```

### 3. Realtime 구독 패턴
```typescript
export function subscribeToTrades(
  callback: (payload: RealtimePayload<Trade>) => void
) {
  return supabase
    .channel('trades')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trade_completed_log'
      },
      callback
    )
    .subscribe()
}

// 알림 실시간 구독
export function subscribeToNotifications(
  userId: string,
  callback: (payload: RealtimePayload<Notification>) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}

// 구독 해제 (메모리 누수 방지)
export function unsubscribe(channel: RealtimeChannel) {
  supabase.removeChannel(channel)
}
```

## 인증 & 권한

### Row Level Security (RLS)
```sql
-- 사용자는 자신의 데이터만 수정 가능
CREATE POLICY "Users can update own trades"
ON trade_completed_log
FOR UPDATE
USING (auth.uid() = user_id);

-- 모든 사용자는 활성 거래 조회 가능
CREATE POLICY "Anyone can view active trades"
ON trade_completed_log
FOR SELECT
USING (status = 'active');
```

### 인증 흐름
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 사용자 세션 확인
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user
}
```

## 비즈니스 로직

### 1. 라르 계산기 (순수 함수)
```typescript
// src/lib/calculator.ts
// React에 의존하지 않는 순수 함수로 구현

export function calculateDansu(exp: number, mode: CalculatorMode) {
  // 계산 로직
}

export function calculateRequired(
  currentExp: number,
  targetDansu: number
) {
  // 필요량 계산
}
```

### 2. 파티 슬롯 관리
```typescript
// src/lib/party-utils.ts

export function checkSlotAvailability(
  slots: PartySlot[],
  requiredClass: CharacterClass
): boolean {
  // 슬롯 가용성 체크
}

export function assignMemberToSlot(
  member: PartyMember,
  slots: PartySlot[]
): PartySlot[] {
  // 슬롯 할당
}
```

## 에러 처리

### 표준 에러 처리
```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export async function safeAPICall<T>(
  fn: () => Promise<T>
): Promise<[T | null, APIError | null]> {
  try {
    const result = await fn()
    return [result, null]
  } catch (error) {
    if (error instanceof APIError) {
      return [null, error]
    }
    return [null, new APIError(
      'Unknown error',
      'UNKNOWN_ERROR',
      error
    )]
  }
}
```

## GitHub Actions 워크플로우

### 1. 일일 유지보수 (매일 자정 KST)
```yaml
# .github/workflows/daily-maintenance.yml
- 시세 집계 (aggregate_daily_prices)
- 거래 만료 처리 (expire_old_trades)
- 모집글 마감 처리 (close_expired_recruits)
```

### 2. 파티모집 알림 (5분마다)
```yaml
# .github/workflows/recruit-reminder.yml
- Edge Function 호출 (recruit-reminder)
```

## 마이그레이션 관리

### 마이그레이션 작성
```sql
-- supabase/migrations/20240101000000_create_trades.sql
CREATE TABLE trade_completed_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  -- ... 컬럼 정의
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_trades_item ON trade_completed_log(item_type, item_name);

-- RLS 정책
ALTER TABLE trade_completed_log ENABLE ROW LEVEL SECURITY;

-- 권한
GRANT SELECT ON trade_completed_log TO anon, authenticated;
```

### 마이그레이션 실행
```bash
# Supabase MCP를 통한 마이그레이션
# Claude Code에서 자동 처리
```

## 성능 최적화

### 1. 인덱스 전략
```sql
-- 자주 조회되는 컬럼에 인덱스
CREATE INDEX idx_trades_status ON trade_completed_log(status);
CREATE INDEX idx_trades_created_at ON trade_completed_log(created_at DESC);
CREATE INDEX idx_trades_composite ON trade_completed_log(item_type, status, created_at DESC);
```

### 2. 쿼리 최적화
```typescript
// 필요한 컬럼만 선택
const { data } = await supabase
  .from('trade_completed_log')
  .select('id, item_name, price_per_unit')  // 필요한 컬럼만
  .limit(50)  // 페이지네이션
```

### 3. 캐싱 전략
```typescript
// React Query 활용 (Frontend와 협업)
// 시세 데이터는 1시간 캐시
// 실시간 데이터는 Realtime 구독
```

## 환경 변수

### 필수 환경 변수
```env
# .env.local
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=[anon-key]

# GitHub Secrets (Actions용)
SUPABASE_SERVICE_KEY=[service-key]
```

## 모니터링 & 로깅

### 로깅 패턴
```typescript
// 에러 로깅
console.error('[API Error]', {
  function: 'getTrades',
  error: error.message,
  stack: error.stack
})

// 성능 로깅
console.time('getTrades')
const trades = await getTrades()
console.timeEnd('getTrades')
```

### Supabase 대시보드 모니터링
- API 요청 수
- 에러율
- 응답 시간
- DB 쿼리 성능

## 테스팅

### API 테스트
```typescript
// 수동 테스트 (개발 중)
// 추후 Jest + Supabase Test Helpers 도입 예정
```

## 배포 전 체크리스트

- [ ] 스키마 변경 후 `NOTIFY pgrst, 'reload schema'` 실행
- [ ] RLS 정책 설정 확인
- [ ] 권한 (GRANT) 설정 확인
- [ ] 인덱스 추가 확인
- [ ] Edge Functions 배포 확인
- [ ] GitHub Actions Secrets 설정 확인
- [ ] 환경 변수 설정 확인
- [ ] 에러 처리 구현 확인

## 문제 해결

### MCP 연결 안 됨
```bash
# MCP 설정 확인
cat .mcp.json

# Claude Code 재시작
# /mcp → Authenticate
```

### 권한 에러
```sql
-- 권한 다시 부여
GRANT SELECT, INSERT, UPDATE, DELETE ON table_name TO anon, authenticated;
GRANT EXECUTE ON FUNCTION function_name TO anon, authenticated;
```

### 스키마 캐시 이슈
```sql
-- PostgREST 스키마 리로드
NOTIFY pgrst, 'reload schema';
```

## 브라우저 알림 & Discord 웹훅

### 브라우저 푸시 알림
```typescript
// src/lib/browser-notifications.ts

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon.png',
      badge: '/badge.png',
      ...options
    })
  }
}
```

### Discord 웹훅
```typescript
// src/lib/discord-webhook.ts

export async function sendDiscordNotification(
  webhookUrl: string,
  content: string,
  embeds?: DiscordEmbed[]
) {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, embeds })
  })
}
```

## 팀 간 협업

### Frontend 팀과 협업
- API 타입 정의 동기화 (`src/types/index.ts`)
- 에러 메시지 형식 통일
- Realtime 이벤트 인터페이스 공유

### DevOps 팀과 협업
- DB 마이그레이션 배포 조율
- Edge Functions 배포 요청
- 환경 변수 Secret 관리

### QA 팀과 협업
- 테스트 데이터 시드 제공
- API 엔드포인트 문서화
- 에러 케이스 재현

## 참고 자료
- [Supabase 문서](https://supabase.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
