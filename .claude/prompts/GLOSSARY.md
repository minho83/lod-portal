# 프로젝트 용어 사전

LOD(어둠의전설) 포털 프로젝트의 전문 용어 및 약어 정의입니다.

## 🎮 게임 용어

### 기본 용어

| 용어 | 영문 | 설명 |
|------|------|------|
| **어둠의전설** | Legend of Darkness (LOD) | 프로젝트 대상 게임 |
| **라르** | Rahr | 게임 내 경험치 아이템 |
| **단수** | Level/Tier | 캐릭터 레벨 |
| **완전 경험치** | Full Experience | 레벨업에 필요한 총 경험치 |
| **클래스** / **직업** | Character Class | 캐릭터 직업 (전사, 도적, 법사, 직자, 도가) |
| **파티** | Party | 게임 내 그룹 |
| **모집** / **모집글** | Recruit | 파티 모집 게시글 |
| **슬롯** | Slot | 파티원 자리 |

### 직업 (Character Class)

| 한글 | 영문 | 코드 | 색상 |
|------|------|------|------|
| **전사** | Warrior | `warrior` | 빨강 (#e74c3c) |
| **도적** | Rogue | `rogue` | 보라 (#9b59b6) |
| **법사** | Mage | `mage` | 파랑 (#3498db) |
| **직자** | Cleric | `cleric` | 노랑 (#f1c40f) |
| **도가** | Taoist | `taoist` | 청록 (#1abc9c) |

### 게임 시스템

| 용어 | 설명 |
|------|------|
| **길드전** | Guild War, 길드 간 전투 |
| **카오스 타워** | Chaos Tower, 던전 콘텐츠 |
| **시세** | Market Price, 아이템 거래 가격 |
| **거래소** | Trading Post, 아이템 거래 시스템 |

## 💻 기술 용어

### Frontend

| 용어 | 설명 |
|------|------|
| **shadcn/ui** | React UI 컴포넌트 라이브러리 |
| **Tailwind CSS** | 유틸리티 기반 CSS 프레임워크 |
| **Vite** | 빌드 도구 및 개발 서버 |
| **HashRouter** | React Router의 해시 기반 라우팅 |
| **Sonner** | Toast 알림 라이브러리 |
| **Lucide** | 아이콘 라이브러리 |
| **Toast** | 화면 하단 알림 메시지 |
| **Skeleton** | 로딩 중 placeholder UI |

### Backend

| 용어 | 설명 |
|------|------|
| **Supabase** | PostgreSQL 기반 BaaS (Backend as a Service) |
| **RPC** | Remote Procedure Call, PostgreSQL 함수 호출 |
| **RLS** | Row Level Security, 행 단위 권한 제어 |
| **Edge Functions** | Supabase의 서버리스 함수 (Deno) |
| **Realtime** | Supabase 실시간 구독 기능 |
| **PITR** | Point-in-Time Recovery, 시점 복구 |
| **MCP** | Model Context Protocol, Supabase 연동 프로토콜 |

### DevOps

| 용어 | 설명 |
|------|------|
| **CI/CD** | Continuous Integration/Continuous Deployment |
| **GitHub Actions** | GitHub의 자동화 워크플로우 |
| **GitHub Pages** | GitHub의 정적 사이트 호스팅 |
| **Secret** | GitHub Actions 환경 변수 (암호화) |
| **Workflow** | GitHub Actions 작업 정의 |
| **Artifact** | 빌드 결과물 |
| **Rollback** | 이전 버전으로 되돌리기 |

### QA

| 용어 | 설명 |
|------|------|
| **E2E** | End-to-End, 전체 시스템 테스트 |
| **Smoke Test** | 주요 기능 간단 테스트 |
| **Regression Test** | 기존 기능 재테스트 |
| **Unit Test** | 단위 테스트 |
| **Integration Test** | 통합 테스트 |
| **a11y** | Accessibility, 접근성 |
| **WCAG** | Web Content Accessibility Guidelines |
| **Lighthouse** | Google 웹 성능 측정 도구 |

## 🗂️ 프로젝트 구조 용어

### 디렉토리

| 경로 | 용도 |
|------|------|
| `src/` | 소스 코드 |
| `src/components/ui/` | shadcn/ui 컴포넌트 (수정 금지) |
| `src/components/layout/` | 레이아웃 컴포넌트 |
| `src/components/game/` | 게임 전용 컴포넌트 |
| `src/pages/` | 페이지 컴포넌트 |
| `src/lib/` | 유틸리티, API, 비즈니스 로직 |
| `src/hooks/` | 커스텀 React 훅 |
| `src/types/` | TypeScript 타입 정의 |
| `src/contexts/` | React Context |
| `.claude/prompts/` | 팀별 AI 프롬프트 |
| `.github/workflows/` | GitHub Actions 워크플로우 |
| `supabase/functions/` | Edge Functions |
| `supabase/migrations/` | DB 마이그레이션 |

### 파일

| 파일 | 용도 |
|------|------|
| `DESIGN_SYSTEM.md` | UI 디자인 규칙 |
| `CLAUDE.md` | 프로젝트 AI 규칙 |
| `MEMORY.md` | 프로젝트 히스토리 |
| `vite.config.ts` | Vite 빌드 설정 |
| `tailwind.config.ts` | Tailwind CSS 설정 |
| `tsconfig.json` | TypeScript 설정 |
| `.env.local` | 로컬 환경 변수 |

## 🔤 약어

### 일반

| 약어 | 전체 | 설명 |
|------|------|------|
| **LOD** | Legend of Darkness | 어둠의전설 |
| **UI** | User Interface | 사용자 인터페이스 |
| **UX** | User Experience | 사용자 경험 |
| **API** | Application Programming Interface | 애플리케이션 인터페이스 |
| **DB** | Database | 데이터베이스 |
| **PR** | Pull Request | 코드 변경 요청 |
| **CR** | Code Review | 코드 리뷰 |

### 기술

| 약어 | 전체 | 설명 |
|------|------|------|
| **TS** | TypeScript | 타입 기반 JavaScript |
| **JS** | JavaScript | 프로그래밍 언어 |
| **CSS** | Cascading Style Sheets | 스타일시트 |
| **HTML** | HyperText Markup Language | 마크업 언어 |
| **JSON** | JavaScript Object Notation | 데이터 형식 |
| **URL** | Uniform Resource Locator | 웹 주소 |
| **HTTP** | HyperText Transfer Protocol | 웹 프로토콜 |
| **HTTPS** | HTTP Secure | 보안 HTTP |
| **REST** | Representational State Transfer | API 설계 방식 |
| **JWT** | JSON Web Token | 인증 토큰 |
| **OAuth** | Open Authorization | 인증 프로토콜 |
| **CORS** | Cross-Origin Resource Sharing | 교차 출처 리소스 공유 |

### 프로젝트

| 약어 | 전체 | 설명 |
|------|------|------|
| **ENV** | Environment | 환경 (dev/prod) |
| **PROD** | Production | 프로덕션 환경 |
| **DEV** | Development | 개발 환경 |
| **QA** | Quality Assurance | 품질 보증 |

## 📊 상태 & 타입

### 거래소 상태

| 코드 | 한글 | 설명 |
|------|------|------|
| `active` | 활성 | 거래 가능 |
| `reserved` | 예약됨 | 거래 예약 |
| `sold` | 판매완료 | 거래 완료 |
| `expired` | 만료됨 | 기간 만료 |
| `cancelled` | 취소됨 | 거래 취소 |

### 파티 모집 상태

| 코드 | 한글 | 설명 |
|------|------|------|
| `open` | 모집중 | 참가 가능 |
| `full` | 완비 | 슬롯 가득 참 |
| `closed` | 마감 | 모집 종료 |
| `cancelled` | 취소됨 | 모집 취소 |

### 알림 타입

| 코드 | 한글 | 설명 |
|------|------|------|
| `party_application` | 파티 신청 | 파티 참가 신청 |
| `party_accepted` | 파티 승인 | 참가 승인 |
| `party_rejected` | 파티 거절 | 참가 거절 |
| `party_kicked` | 파티 추방 | 강제 퇴장 |
| `trade_reservation` | 거래 예약 | 거래 예약 알림 |
| `trade_comment` | 거래 댓글 | 댓글 알림 |
| `scam_report_result` | 신고 결과 | 사기 신고 결과 |

## 🎨 디자인 시스템 용어

### 색상

| 용어 | 설명 |
|------|------|
| **Primary** | 주요 액션 색상 |
| **Secondary** | 보조 색상 |
| **Accent** | 강조 색상 |
| **Muted** | 흐린 색상 |
| **Foreground** | 전경 (텍스트) |
| **Background** | 배경 |
| **Border** | 테두리 |
| **Destructive** | 삭제/위험 색상 |

### 컴포넌트

| 용어 | 설명 |
|------|------|
| **Badge** | 뱃지 (작은 라벨) |
| **Card** | 카드 (컨테이너) |
| **Dialog** | 모달 대화상자 |
| **Dropdown** | 드롭다운 메뉴 |
| **Input** | 입력 필드 |
| **Select** | 선택 드롭다운 |
| **Separator** | 구분선 |
| **Skeleton** | 로딩 placeholder |
| **Tabs** | 탭 |
| **Toast** | 알림 메시지 |
| **Tooltip** | 툴팁 (말풍선) |

### 레이아웃

| 용어 | 설명 |
|------|------|
| **Container** | 컨테이너 (max-width) |
| **Grid** | 그리드 레이아웃 |
| **Flex** | 플렉스박스 레이아웃 |
| **Gap** | 간격 |
| **Padding** | 내부 여백 |
| **Margin** | 외부 여백 |

## 🔐 보안 용어

| 용어 | 설명 |
|------|------|
| **XSS** | Cross-Site Scripting, 스크립트 삽입 공격 |
| **CSRF** | Cross-Site Request Forgery, 요청 위조 공격 |
| **SQL Injection** | SQL 삽입 공격 |
| **HTTPS** | 암호화된 HTTP |
| **OAuth** | 인증 프로토콜 |
| **JWT** | JSON 웹 토큰 |
| **RLS** | Row Level Security, 행 단위 보안 |

## 📈 성능 용어

| 용어 | 설명 |
|------|------|
| **LCP** | Largest Contentful Paint, 최대 콘텐츠 렌더링 |
| **FID** | First Input Delay, 최초 입력 지연 |
| **CLS** | Cumulative Layout Shift, 누적 레이아웃 이동 |
| **TTI** | Time to Interactive, 인터랙티브 시간 |
| **FCP** | First Contentful Paint, 최초 콘텐츠 렌더링 |
| **Bundle Size** | 번들 크기 |
| **Code Splitting** | 코드 분할 |
| **Lazy Loading** | 지연 로딩 |
| **Tree Shaking** | 미사용 코드 제거 |

## 🌐 웹 표준

| 용어 | 설명 |
|------|------|
| **WCAG** | Web Content Accessibility Guidelines |
| **ARIA** | Accessible Rich Internet Applications |
| **SEO** | Search Engine Optimization |
| **PWA** | Progressive Web App |
| **SPA** | Single Page Application |
| **SSR** | Server-Side Rendering |
| **CSR** | Client-Side Rendering |

## 📚 참고 자료

- [React 용어집](https://react.dev/learn/glossary)
- [MDN 웹 용어집](https://developer.mozilla.org/ko/docs/Glossary)
- [Supabase 용어](https://supabase.com/docs/guides/getting-started)

---

**"용어를 이해하면 소통이 원활해집니다"** 📖
