# LOD 포털 프로젝트 규칙

## 필수 참조 문서
- **DESIGN_SYSTEM.md** (프로젝트 루트): UI 코드 작성 전 반드시 읽을 것
- **SYSTEM_DESIGN.md** (`.taskmaster/docs/`): 거래소·파티모집·시세·사기신고 시스템 설계서

## 프로젝트 개요
- 어둠의전설(LOD) 게임 종합 도우미 포털
- React + TypeScript + Vite + shadcn/ui + Tailwind CSS v4
- 다크 테마 전용 (라이트 테마 없음)
- GitHub Pages 배포 (BrowserRouter + SSG pre-rendering)

## 핵심 규칙
1. UI 컴포넌트는 반드시 shadcn/ui 사용
2. 색상은 DESIGN_SYSTEM.md에 정의된 Tailwind 클래스만 사용
3. 임의 값 (arbitrary values like `text-[#xxx]`, `p-[13px]`) 사용 금지
4. 새 컴포넌트는 `src/components/game/`에 배치
5. API 호출은 `src/lib/api.ts`에 집중
6. 타입은 `src/types/index.ts`에 정의

## Supabase 연동
- DB 작업(테이블 생성, 마이그레이션, SQL 실행)은 반드시 **Supabase MCP 서버**를 통해 실행
- MCP 설정: `.mcp.json` (프로젝트 루트)
- Project ref: `wjismpfswlqpkrjatlqe`
- MCP 서버 연결 안 되어 있으면 사용자에게 연결 확인 요청할 것
- 스키마 변경 후 `NOTIFY pgrst, 'reload schema';` 실행 필수

## SSG Pre-rendering (AdSense 대응)
- **라우터**: BrowserRouter (HashRouter에서 전환됨)
- **빌드**: 3단계 (`build:client` → `build:server` → `prerender`)
- **SSR 진입점**: `src/entry-server.tsx` (StaticRouter + renderToString)
- **프리렌더 스크립트**: `scripts/prerender.mjs` (11개 정적 라우트)
- **404.html**: `dist/404.html` → SPA fallback (동적 라우트용)
- **SSR-safe 코드**: `src/lib/ssr-utils.ts` → `isServer`, `safeLocalStorageGet`
- **주의사항**:
  - useState 초기값에서 `localStorage` 직접 접근 금지 → `safeLocalStorageGet()` 사용
  - useEffect 내부는 SSR에서 실행 안 됨 → 안전
  - 새 페이지 추가 시 `scripts/prerender.mjs`의 ROUTES 배열에 추가 필요
  - sitemap.xml URL에 `/#/` 사용 금지 (BrowserRouter 사용 중)

## 게임 클래스 색상
- 전사: `text-warrior` / `bg-warrior-bg`
- 도적: `text-rogue` / `bg-rogue-bg`
- 법사: `text-mage` / `bg-mage-bg`
- 직자: `text-cleric` / `bg-cleric-bg`
- 도가: `text-taoist` / `bg-taoist-bg`
