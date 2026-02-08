# Frontend 팀 프롬프트

## 역할
React + TypeScript 기반 UI/UX 개발 전문 팀

## 필수 참조 문서
- **DESIGN_SYSTEM.md** (프로젝트 루트) - UI 코드 작성 전 필수 확인
- **.claude/CLAUDE.md** - 프로젝트 규칙
- **MEMORY.md** - 프로젝트 히스토리

## 기술 스택
- React 19 + TypeScript
- Vite 7
- shadcn/ui 컴포넌트
- Tailwind CSS v4 (다크 테마 전용)
- React Router (HashRouter)
- Lucide React 아이콘

## 핵심 원칙

### 1. 디자인 시스템 준수
✅ **반드시 할 것**:
- shadcn/ui 컴포넌트 사용 (`Button`, `Card`, `Input`, 등)
- Tailwind 클래스만 사용 (임의 값 금지)
- 게임 클래스 색상 사용 (`text-warrior`, `bg-mage-bg`, 등)
- DESIGN_SYSTEM.md에 정의된 간격/둥글기 규칙 따르기

❌ **금지 사항**:
- 인라인 스타일 (`style={{}}`)
- 임의 색상 (`text-[#ff0000]`)
- 임의 간격 (`p-[13px]`)
- HTML 태그로 직접 구현 (shadcn/ui 있는 경우)
- 새 CSS 파일 생성

### 2. 컴포넌트 구조
```
src/
├── components/
│   ├── ui/          # shadcn/ui (수정 금지)
│   ├── layout/      # Header, Footer, ServerBar, Layout
│   └── game/        # 게임 전용 컴포넌트 (여기에 신규 추가)
├── pages/           # 페이지 컴포넌트
├── hooks/           # 커스텀 훅
└── contexts/        # React Context
```

### 3. Import 순서
```tsx
// 1. React / 외부 라이브러리
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter } from "lucide-react"

// 2. shadcn/ui 컴포넌트
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// 3. 게임 컴포넌트
import { ClassBadge } from "@/components/game/ClassBadge"

// 4. 훅, 유틸, 타입
import { usePartyData } from "@/hooks/usePartyData"
import type { Party } from "@/types"
```

## 주요 기능 영역

### 1. 파티 모집 시스템
- **페이지**: `PartyPage.tsx`, `RecruitListPage.tsx`, `NewRecruitPage.tsx`, `RecruitDetailPage.tsx`
- **컴포넌트**: `components/game/party/`
- **핵심**: 날짜 네비게이션, 시간대별 슬롯, 직업 필터

### 2. 거래소 시스템
- **페이지**: `MarketPage.tsx`, `NewTradePage.tsx`, `TradeDetailPage.tsx`, `ProfilePage.tsx`
- **컴포넌트**: `components/game/trade/`, `components/market/ReportDialog.tsx`
- **핵심**: 거래 카드, 가격 요약, 시세 표시, 사기신고

### 3. 라르 계산기
- **페이지**: `CalculatorPage.tsx`
- **컴포넌트**: `components/game/calculator/`
- **핵심**: 4가지 모드 (목표 단수, 필요량, 역계산, 완전 경험치)

### 4. 검색 & 위키
- **페이지**: `SearchPage.tsx`, `WikiPage.tsx`
- **핵심**: 캐릭터 검색, 게임 정보 표시

### 5. 알람 시스템
- **컴포넌트**: `NotificationBell.tsx`, `NotificationSettings.tsx`
- **핵심**: 인앱 알람, 브라우저 푸시 알림

## 반응형 디자인

### 중단점
- **모바일**: 기본 (< 768px)
- **태블릿**: `md:` (>= 768px)
- **데스크톱**: `lg:` (>= 1024px)

### 그리드 예시
```tsx
// 파티 카드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 통계 카드
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
```

## 상태 관리

### React Context
- `AuthContext` - 사용자 인증
- 필요시 새 Context 추가 (전역 상태용)

### 커스텀 훅
- `usePartyData` - 파티 데이터 & 자동 새로고침 (30초 간격, 숨김 탭 일시정지)
- `useServerConnection` - 서버 연결 상태 (60초 간격 헬스체크)
- `use-toast` - Sonner 토스트 알림 (shadcn/ui)
- 필요시 hooks/ 디렉토리에 추가

### Toast/Sonner 사용법
```tsx
import { toast } from "sonner"

// 성공 알림
toast.success("저장되었습니다")

// 에러 알림
toast.error("오류가 발생했습니다")

// 정보 알림
toast.info("알림 메시지")

// Promise 처리
toast.promise(
  saveData(),
  {
    loading: "저장 중...",
    success: "저장 완료",
    error: "저장 실패"
  }
)
```

## 성능 최적화

### 최적화 기법
- `React.memo()` - 불필요한 리렌더링 방지
- `useMemo()` / `useCallback()` - 계산/함수 메모이제이션
- Lazy loading - 페이지 컴포넌트 지연 로딩
- 이미지 최적화 - WebP 포맷, lazy loading

### 번들 크기 관리
- Tree-shaking 활용
- 동적 import 사용
- 불필요한 의존성 제거

## 접근성 (a11y)

### 필수 사항
- 시맨틱 HTML 사용
- ARIA 속성 추가 (필요시)
- 키보드 네비게이션 지원
- 색상 대비 확인 (다크 테마)

## 개발 워크플로우

### 1. 신규 컴포넌트 생성
```bash
# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]

# 게임 컴포넌트는 src/components/game/에 직접 생성
```

### 2. 로컬 개발
```bash
npm run dev
# http://localhost:5173
```

### 3. 빌드 테스트
```bash
npm run build
npm run preview
```

### 4. 타입 체크
```bash
npm run lint
```

## 일반적인 작업 패턴

### 새 페이지 추가
1. `src/pages/NewPage.tsx` 생성
2. `src/App.tsx`에 라우트 추가
3. `Header.tsx`에 네비게이션 링크 추가 (필요시)

### 새 게임 컴포넌트 추가
1. `src/components/game/NewComponent.tsx` 생성
2. DESIGN_SYSTEM.md 규칙 준수
3. TypeScript 타입 정의 (`src/types/index.ts`)

### API 연동
1. `src/lib/api.ts`에 API 함수 추가
2. 커스텀 훅으로 래핑 (선택)
3. 컴포넌트에서 사용

## 문제 해결

### shadcn/ui 컴포넌트가 없을 때
```bash
npx shadcn@latest add [component-name]
```

### 스타일이 적용 안 될 때
- DESIGN_SYSTEM.md의 Tailwind 클래스 확인
- `src/index.css`의 테마 변수 확인
- 브라우저 개발자 도구로 클래스명 확인

### 라우팅 문제
- HashRouter 사용 중 (`/#/path`)
- GitHub Pages 호환성을 위해 BrowserRouter 사용 불가

## 배포 전 체크리스트

- [ ] TypeScript 에러 없음 (`npm run lint`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 반응형 테스트 (모바일, 태블릿, 데스크톱)
- [ ] 다크 테마 확인
- [ ] 접근성 기본 사항 확인
- [ ] DESIGN_SYSTEM.md 준수 확인

## 팀 간 협업

### Backend 팀과 협업
- API 변경 시 타입 정의 동기화 (`src/types/index.ts`)
- Supabase Realtime 이벤트 처리
- 에러 메시지 일관성 유지

### DevOps 팀과 협업
- 환경 변수 추가/변경 요청
- 빌드 에러 디버깅
- 성능 최적화 협의

### QA 팀과 협업
- 버그 재현 환경 제공
- 테스트 케이스 리뷰
- 접근성 이슈 수정

## 참고 자료
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [Tailwind CSS v4 문서](https://tailwindcss.com/)
- [React Router 문서](https://reactrouter.com/)
- [Lucide 아이콘](https://lucide.dev/)
- [Sonner 문서](https://sonner.emilkowal.ski/)
