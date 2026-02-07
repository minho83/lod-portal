# LOD 포털 디자인 시스템

이 문서는 AI가 코드를 생성할 때 반드시 따라야 하는 디자인 규칙입니다.
모든 UI 코드 작성 시 이 파일을 참조하세요.

## 기술 스택
- React + TypeScript + Vite
- Tailwind CSS v4
- shadcn/ui 컴포넌트
- React Router (HashRouter)
- Lucide React 아이콘

## 색상 규칙

### 기본 색상 (Tailwind 클래스로만 사용)
| 용도 | Tailwind 클래스 | 설명 |
|------|----------------|------|
| 배경 | `bg-background` | 페이지 배경 (어두운 보라빛 검정) |
| 카드 배경 | `bg-card` | 카드/패널 배경 |
| 텍스트 | `text-foreground` | 기본 텍스트 |
| 보조 텍스트 | `text-muted-foreground` | 회색 보조 텍스트 |
| 테두리 | `border-border` | 기본 테두리 |
| 입력 배경 | `bg-input` | 입력 필드 배경 |
| 주요 액션 | `bg-primary text-primary-foreground` | 버튼, 강조 |

### 게임 클래스 색상 (커스텀 변수)
| 직업 | 텍스트 | 배경 | 색상 |
|------|--------|------|------|
| 전사 | `text-warrior` | `bg-warrior-bg` | 빨강 #e74c3c |
| 도적 | `text-rogue` | `bg-rogue-bg` | 보라 #9b59b6 |
| 법사 | `text-mage` | `bg-mage-bg` | 파랑 #3498db |
| 직자 | `text-cleric` | `bg-cleric-bg` | 노랑 #f1c40f |
| 도가 | `text-taoist` | `bg-taoist-bg` | 청록 #1abc9c |

### 상태 색상
| 상태 | 클래스 | 색상 |
|------|--------|------|
| 성공/완비 | `text-success` | 초록 #27ae60 |
| 경고/빈자리 | `text-warning` | 주황 #e67e22 |
| 에러 | `text-destructive` | 빨강 |

## 컴포넌트 규칙

### 반드시 shadcn/ui 사용
- 버튼: `<Button>` from `@/components/ui/button`
- 카드: `<Card>` from `@/components/ui/card`
- 입력: `<Input>` from `@/components/ui/input`
- 탭: `<Tabs>` from `@/components/ui/tabs`
- 뱃지: `<Badge>` from `@/components/ui/badge`
- 체크박스: `<Checkbox>` from `@/components/ui/checkbox`
- 셀렉트: `<Select>` from `@/components/ui/select`
- 구분선: `<Separator>` from `@/components/ui/separator`
- 스켈레톤: `<Skeleton>` from `@/components/ui/skeleton`
- 툴팁: `<Tooltip>` from `@/components/ui/tooltip`

### 게임 전용 컴포넌트 (src/components/game/)
- `ClassBadge` - 직업 뱃지 (색상 자동 적용)
- `ClassChip` - 직업 필터 칩 (선택 상태 관리)
- `PartyCard` - 파티 카드
- `StatCard` - 통계 카드
- `SearchResultCard` - 검색 결과 카드

### 아이콘
- Lucide React만 사용: `import { IconName } from "lucide-react"`
- 이모지 사용 금지 (아이콘 컴포넌트로 대체)

## 레이아웃 규칙

### 페이지 구조
```
max-w-7xl mx-auto (최대 너비 1280px, 중앙 정렬)
```

### 간격 (Tailwind 스케일만 사용)
| 용도 | 클래스 | 값 |
|------|--------|-----|
| 요소 내부 여백 | `p-4` 또는 `p-6` | 16px 또는 24px |
| 섹션 간 간격 | `gap-6` 또는 `space-y-6` | 24px |
| 카드 내부 | `p-4` 또는 `p-5` | 16px 또는 20px |
| 작은 간격 | `gap-2` 또는 `gap-3` | 8px 또는 12px |
| 인라인 간격 | `gap-2` | 8px |

### 둥글기
| 용도 | 클래스 |
|------|--------|
| 카드 | `rounded-lg` |
| 버튼 | `rounded-md` (shadcn 기본값) |
| 뱃지/칩 | `rounded-full` |
| 입력 | `rounded-md` |

### 그리드
```tsx
// 파티 카드 그리드
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 통계 카드 그리드
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">

// 검색 결과 그리드
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
```

### 반응형 중단점
- 모바일: 기본 (< 768px)
- 태블릿: `md:` (>= 768px)
- 데스크톱: `lg:` (>= 1024px)

## 타이포그래피

### 폰트 크기 (Tailwind 클래스만)
| 용도 | 클래스 |
|------|--------|
| 페이지 제목 | `text-xl font-bold` |
| 섹션 제목 | `text-lg font-semibold` |
| 카드 제목 | `text-base font-semibold` |
| 본문 | `text-sm` |
| 보조 텍스트 | `text-xs text-muted-foreground` |
| 뱃지/라벨 | `text-xs font-medium` |

## 파일 구조 규칙

```
src/
├── components/
│   ├── ui/          # shadcn/ui (수정 금지)
│   ├── layout/      # Header, Footer, Layout
│   └── game/        # 게임 전용 컴포넌트
├── pages/           # 페이지 컴포넌트
├── hooks/           # 커스텀 훅
├── lib/             # 유틸리티, API, 계산 로직
└── types/           # TypeScript 타입
```

### import 규칙
```tsx
// 1. React / 외부 라이브러리
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Filter } from "lucide-react"

// 2. shadcn/ui 컴포넌트
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// 3. 게임 컴포넌트
import { PartyCard } from "@/components/game/PartyCard"

// 4. 훅, 유틸, 타입
import { usePartyData } from "@/hooks/usePartyData"
import type { Party } from "@/types"
```

## 금지 사항
- 인라인 스타일 (`style={{}}`) 사용 금지
- 임의 색상 값 사용 금지 (예: `text-[#ff0000]`)
- 임의 간격 값 사용 금지 (예: `p-[13px]`)
- shadcn/ui 컴포넌트가 있는데 HTML 태그로 직접 구현 금지
- `!important` 사용 금지
- 새로운 CSS 파일 생성 금지 (index.css만 사용)
