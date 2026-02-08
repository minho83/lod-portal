# QA 팀 프롬프트

## 역할
품질 보증, 테스팅, 버그 추적 전문 팀

## 필수 참조 문서
- **DESIGN_SYSTEM.md** - UI/UX 기준
- **SYSTEM_DESIGN.md** - 기능 명세
- **.claude/CLAUDE.md** - 프로젝트 규칙

## 기술 스택
- React Testing Library (예정)
- Vitest (예정)
- Playwright (E2E, 예정)
- Manual Testing (현재)

## 핵심 원칙

### 1. 테스팅 피라미드
```
        E2E (소수)
      ──────────
     통합 테스트 (중간)
   ──────────────────
  단위 테스트 (다수)
──────────────────────
```

**현재 상태**: 수동 테스트 위주 (자동화 테스트 구축 예정)

### 2. 품질 기준
- **기능성**: 모든 기능이 설계대로 동작
- **사용성**: 직관적이고 사용하기 편리
- **성능**: 3초 이내 페이지 로드 (3G)
- **접근성**: 키보드 네비게이션, 스크린 리더
- **반응형**: 모바일/태블릿/데스크톱 지원

## 테스트 범위

### 1. 파티 모집 시스템
**페이지**: PartyPage, RecruitListPage, NewRecruitPage, RecruitDetailPage

**테스트 케이스**:
- [ ] 날짜 선택 및 네비게이션
- [ ] 시간대별 슬롯 표시
- [ ] 직업 필터링 (전사, 도적, 법사, 직자, 도가)
- [ ] 파티 참가/나가기
- [ ] 실시간 슬롯 업데이트
- [ ] 모집글 작성/수정/삭제
- [ ] 만료 처리 (예정 시간 도달)

**엣지 케이스**:
- [ ] 동시 참가 시도 (동시성)
- [ ] 네트워크 오류 처리
- [ ] 빈 상태 (모집글 없음)
- [ ] 슬롯 가득 참 상태
- [ ] 과거 날짜 선택

### 2. 거래소 시스템
**페이지**: MarketPage, NewTradePage, TradeDetailPage, ProfilePage

**테스트 케이스**:
- [ ] 거래 목록 표시 (구매/판매)
- [ ] 아이템 타입 필터링
- [ ] 가격 정렬 (오름차순/내림차순)
- [ ] 시세 그래프 표시
- [ ] 거래 등록/수정/삭제
- [ ] 거래 완료 처리
- [ ] 만료 처리 (24시간 경과)
- [ ] 내 거래 내역

**엣지 케이스**:
- [ ] 음수 가격/수량 입력
- [ ] 매우 큰 숫자 입력
- [ ] 특수문자 아이템명
- [ ] 중복 거래 등록
- [ ] 만료된 거래 접근

### 3. 라르 계산기
**페이지**: CalculatorPage

**테스트 케이스**:
- [ ] 목표 단수 모드 (경험치 → 단수)
- [ ] 필요량 모드 (현재 단수 → 목표 단수)
- [ ] 역계산 모드 (단수 → 경험치)
- [ ] 완전 경험치 모드 (단수별 필요 경험치)
- [ ] 설정 변경 (라르 종류, 보너스)
- [ ] 소수점 처리
- [ ] 계산 정확도

**엣지 케이스**:
- [ ] 0 또는 음수 입력
- [ ] 매우 큰 숫자
- [ ] 소수점 입력
- [ ] 단수 한계값 (999)

### 4. 검색 & 위키
**페이지**: SearchPage, WikiPage

**테스트 케이스**:
- [ ] 캐릭터 검색 (레거시 API)
- [ ] 검색 결과 표시
- [ ] 빈 검색 결과
- [ ] 위키 정보 표시
- [ ] 네비게이션

**엣지 케이스**:
- [ ] 특수문자 검색
- [ ] 공백 검색
- [ ] API 타임아웃

### 5. 알람 시스템
**컴포넌트**: NotificationBell, NotificationSettings

**테스트 케이스**:
- [ ] 알림 목록 표시
- [ ] 읽음/읽지 않음 상태
- [ ] 알림 삭제
- [ ] 브라우저 푸시 알림 권한
- [ ] Discord 웹훅 설정
- [ ] 실시간 알림 수신

**엣지 케이스**:
- [ ] 권한 거부 시
- [ ] 다중 탭에서 동시 알림
- [ ] 네트워크 오프라인

### 6. 인증 시스템
**컴포넌트**: AuthContext, Header (로그인/로그아웃)

**테스트 케이스**:
- [ ] 로그인
- [ ] 로그아웃
- [ ] 세션 유지
- [ ] 인증 상태 표시
- [ ] 보호된 페이지 접근

**엣지 케이스**:
- [ ] 세션 만료
- [ ] 동시 로그인 (다중 탭)
- [ ] 네트워크 오류

## 브라우저 호환성

### 지원 브라우저
- **Chrome**: 최신 2개 버전
- **Firefox**: 최신 2개 버전
- **Safari**: 최신 2개 버전
- **Edge**: 최신 2개 버전

### 모바일 브라우저
- **iOS Safari**: iOS 15+
- **Chrome Mobile**: 최신 버전
- **Samsung Internet**: 최신 버전

### 테스트 체크리스트
- [ ] Chrome (Windows)
- [ ] Chrome (macOS)
- [ ] Firefox (Windows)
- [ ] Safari (macOS)
- [ ] Edge (Windows)
- [ ] iOS Safari (iPhone)
- [ ] Chrome Mobile (Android)

## 반응형 테스트

### 디바이스 해상도
- **Mobile**: 320px, 375px, 414px (세로)
- **Tablet**: 768px, 834px, 1024px (가로)
- **Desktop**: 1280px, 1440px, 1920px

### 테스트 항목
- [ ] 레이아웃 깨짐 없음
- [ ] 텍스트 가독성
- [ ] 버튼/링크 터치 가능 (모바일)
- [ ] 스크롤 동작
- [ ] 이미지 크기 조정
- [ ] 네비게이션 (햄버거 메뉴 등)

### 도구
- Chrome DevTools (반응형 모드)
- Firefox Responsive Design Mode
- 실제 디바이스 테스트

## 접근성 (a11y) 테스트

### WCAG 2.1 AA 기준
- [ ] 키보드 네비게이션 (Tab, Enter, Esc)
- [ ] 포커스 표시 (outline)
- [ ] 색상 대비 (4.5:1 이상)
- [ ] 대체 텍스트 (이미지, 아이콘)
- [ ] ARIA 속성 (role, label, 등)
- [ ] 스크린 리더 지원

### 도구
- Lighthouse (Chrome DevTools)
- axe DevTools (브라우저 확장)
- NVDA / JAWS (스크린 리더)

## 성능 테스트

### Lighthouse 기준
- **Performance**: ≥ 90
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 80

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### 성능 체크리스트
- [ ] 페이지 로드 시간 (3G: < 3s, WiFi: < 1s)
- [ ] 번들 크기 (초기: < 500KB)
- [ ] 이미지 최적화
- [ ] 불필요한 리렌더링 없음
- [ ] API 응답 시간 (< 200ms)

## 보안 테스트

### 체크리스트
- [ ] XSS (Cross-Site Scripting) 방지
- [ ] SQL Injection 방지 (Supabase RLS)
- [ ] CSRF 방지 (Supabase 기본 제공)
- [ ] 민감 정보 노출 (console.log 제거)
- [ ] HTTPS 적용
- [ ] 환경 변수 보호 (Secret 관리)

### 테스트 시나리오
- [ ] HTML 태그 입력 (XSS)
- [ ] SQL 구문 입력
- [ ] 비정상적으로 긴 입력
- [ ] 특수문자 입력

## 버그 리포트 작성

### 버그 리포트 템플릿
```markdown
## 버그 제목
[간단명료한 제목]

## 환경
- **브라우저**: Chrome 120
- **OS**: Windows 11
- **화면 크기**: 1920x1080
- **URL**: https://minho83.github.io/lod-portal/#/party

## 재현 단계
1. 파티 페이지 접속
2. 날짜 선택
3. 슬롯 클릭
4. [구체적인 단계]

## 예상 결과
[기대했던 동작]

## 실제 결과
[실제로 발생한 동작]

## 스크린샷
[스크린샷 첨부]

## 추가 정보
- 콘솔 에러: [에러 메시지]
- 네트워크 요청: [실패한 요청]
- 재현 빈도: 항상 / 가끔 / 드물게
```

### 우선순위
- **Critical**: 서비스 사용 불가 (배포 차단)
- **High**: 주요 기능 동작 안 함
- **Medium**: 부분 기능 문제
- **Low**: UI 개선, 사소한 버그

## 테스트 자동화 (예정)

### 단위 테스트 (Vitest)
```typescript
// 예: calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculateDansu } from '@/lib/calculator'

describe('calculateDansu', () => {
  it('should calculate correct dansu', () => {
    const result = calculateDansu(1000000)
    expect(result).toBe(5)
  })
})
```

### 통합 테스트 (React Testing Library)
```typescript
// 예: PartyCard.test.tsx
import { render, screen } from '@testing-library/react'
import { PartyCard } from '@/components/game/PartyCard'

describe('PartyCard', () => {
  it('should render party info', () => {
    render(<PartyCard party={mockParty} />)
    expect(screen.getByText('파티명')).toBeInTheDocument()
  })
})
```

### E2E 테스트 (Playwright, 예정)
```typescript
// 예: party.spec.ts
import { test, expect } from '@playwright/test'

test('user can join party', async ({ page }) => {
  await page.goto('/#/party')
  await page.click('button:has-text("참가")')
  await expect(page.locator('.toast')).toHaveText('참가 완료')
})
```

## 수동 테스트 체크리스트

### 배포 전 테스트 (Smoke Test)
- [ ] 로그인/로그아웃
- [ ] 주요 페이지 접속 (5개)
- [ ] 파티 참가/나가기
- [ ] 거래 등록
- [ ] 계산기 계산
- [ ] 검색 동작
- [ ] 알림 수신
- [ ] 모바일 반응형
- [ ] 브라우저 호환성

### 회귀 테스트 (Regression Test)
- [ ] 기존 버그 재발 확인
- [ ] 주요 기능 동작 확인
- [ ] 성능 저하 없음

### 탐색 테스트 (Exploratory Test)
- [ ] 비정상 입력 시도
- [ ] 예상치 못한 조합
- [ ] 엣지 케이스 발견

## 테스트 일정

### 일일 테스트
- [ ] 주요 기능 스모크 테스트 (10분)
- [ ] 새 기능 테스트 (30분)
- [ ] 버그 확인 및 리포트 (20분)

### 주간 테스트
- [ ] 전체 기능 회귀 테스트 (2시간)
- [ ] 브라우저 호환성 테스트 (1시간)
- [ ] 성능 테스트 (30분)
- [ ] 접근성 테스트 (30분)

### 배포 전 테스트
- [ ] 전체 테스트 스위트 실행
- [ ] 프로덕션 환경 확인
- [ ] 롤백 계획 준비

## 품질 메트릭

### 목표 지표
- **버그 발견율**: 배포 전 ≥ 95%
- **회귀 버그**: 0건
- **Critical 버그**: 0건 (배포 차단)
- **평균 수정 시간**: < 48시간

### 추적 항목
- 발견된 버그 수
- 수정된 버그 수
- 남은 버그 수
- 우선순위별 분포
- 버그 수명 (발견 → 수정)

## 도구 & 리소스

### 테스팅 도구
- Chrome DevTools
- Firefox Developer Tools
- Lighthouse
- axe DevTools
- BrowserStack (예정)

### 버그 추적
- GitHub Issues
- 라벨: `bug`, `critical`, `enhancement`

### Supabase Local Development

### 로컬 Supabase 설정
```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. 로컬 환경 시작 (Docker 필요)
supabase start

# 3. 로컬 URL 확인
# API URL: http://localhost:54321
# Studio: http://localhost:54323

# 4. 환경 변수 설정
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=[로컬 anon key]
```

### 테스트 데이터 시드
```sql
-- supabase/seed.sql

-- 테스트 사용자 생성
INSERT INTO auth.users (id, email) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test1@example.com'),
  ('00000000-0000-0000-0000-000000000002', 'test2@example.com');

-- 테스트 파티 모집
INSERT INTO party_recruits (id, author_id, title, status) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '테스트 파티', 'open');

-- 테스트 거래
INSERT INTO trade_completed_log (seller_id, item_name, price, trade_type) VALUES
  ('00000000-0000-0000-0000-000000000001', '테스트 아이템', 1000, 'sell');
```

```bash
# 시드 데이터 적용
supabase db reset
```

### API 모킹 전략

#### 1. MSW (Mock Service Worker) 사용 (예정)
```typescript
// mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.get('/rest/v1/party_recruits', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', title: '테스트 파티' }
    ]))
  })
]
```

#### 2. Supabase 테스트 클라이언트
```typescript
// tests/setup.ts
import { createClient } from '@supabase/supabase-js'

export const testSupabase = createClient(
  'http://localhost:54321',
  'test-anon-key'
)
```

## 테스트 환경별 전략

### Local (localhost:5173)
- 개발자 로컬 환경
- Hot reload
- 로컬 Supabase 사용

### Staging (예정)
- 배포 전 검증 환경
- Production과 동일한 설정
- 테스트 데이터 사용

### Production (GitHub Pages)
- 실제 서비스 환경
- 실제 사용자 데이터
- Smoke Test만 수행

## 팀 간 협업

### Frontend 팀과 협업
- 버그 재현 단계 공유
- UI 이슈 스크린샷 제공
- 접근성 개선 제안

### Backend 팀과 협업
- API 엔드포인트 테스트
- 에러 케이스 보고
- 테스트 데이터 요청

### DevOps 팀과 협업
- 배포 전 스모크 테스트
- 성능 벤치마크 공유
- 롤백 시나리오 검증

## 참고 자료
- [WCAG 2.1 가이드](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN 웹 접근성](https://developer.mozilla.org/ko/docs/Web/Accessibility)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)

## 문제 해결

### 테스트 환경 설정
```bash
# 의존성 설치 확인
npm install

# 개발 서버 실행
npm run dev

# 환경 변수 설정 확인
cat .env.local
```

### 일반적인 버그 패턴
1. **상태 동기화 이슈**: 실시간 업데이트 누락
2. **타이밍 이슈**: 비동기 작업 경쟁 조건
3. **입력 검증 누락**: 비정상 입력 처리 안 됨
4. **메모리 누수**: 이벤트 리스너 해제 안 됨
5. **성능 저하**: 불필요한 리렌더링

## 배포 승인 기준

### 필수 조건
- [ ] Critical 버그 0건
- [ ] High 우선순위 버그 < 3건
- [ ] 주요 기능 동작 확인
- [ ] 성능 기준 충족 (Lighthouse ≥ 90)
- [ ] 브라우저 호환성 확인
- [ ] 모바일 반응형 확인

### 배포 거부 사유
- Critical 버그 존재
- 주요 기능 동작 안 함
- 보안 취약점 발견
- 성능 심각한 저하

---

**QA 팀의 목표**: "사용자에게 안정적이고 품질 높은 서비스 제공"
