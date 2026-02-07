# LOD 포털 프로젝트 규칙

## 필수 참조 문서
- **DESIGN_SYSTEM.md** (프로젝트 루트): UI 코드 작성 전 반드시 읽을 것
- **SYSTEM_DESIGN.md** (`.taskmaster/docs/`): 거래소·파티모집·시세·사기신고 시스템 설계서

## 프로젝트 개요
- 어둠의전설(LOD) 게임 종합 도우미 포털
- React + TypeScript + Vite + shadcn/ui + Tailwind CSS v4
- 다크 테마 전용 (라이트 테마 없음)
- GitHub Pages 배포 (HashRouter 사용)

## 핵심 규칙
1. UI 컴포넌트는 반드시 shadcn/ui 사용
2. 색상은 DESIGN_SYSTEM.md에 정의된 Tailwind 클래스만 사용
3. 임의 값 (arbitrary values like `text-[#xxx]`, `p-[13px]`) 사용 금지
4. 새 컴포넌트는 `src/components/game/`에 배치
5. API 호출은 `src/lib/api.ts`에 집중
6. 타입은 `src/types/index.ts`에 정의

## 게임 클래스 색상
- 전사: `text-warrior` / `bg-warrior-bg`
- 도적: `text-rogue` / `bg-rogue-bg`
- 법사: `text-mage` / `bg-mage-bg`
- 직자: `text-cleric` / `bg-cleric-bg`
- 도가: `text-taoist` / `bg-taoist-bg`
