# 📚 LOD 포털 팀별 프롬프트 가이드

LOD(어둠의전설) 포털 프로젝트의 팀별 AI 어시스턴트 프롬프트 모음입니다.

## 🎯 개요

각 팀이 AI를 활용하여 효율적으로 작업할 수 있도록 팀별 전문 프롬프트를 제공합니다.

### 프로젝트 정보
- **Repository**: https://github.com/minho83/lod-portal
- **Production**: https://minho83.github.io/lod-portal/
- **기술 스택**: React 19 + TypeScript + Vite 7 + Supabase + shadcn/ui

## 📁 팀별 프롬프트

### 🎨 [Frontend 팀](./FRONTEND_TEAM.md)
**역할**: React + TypeScript 기반 UI/UX 개발

**주요 내용**:
- shadcn/ui 컴포넌트 사용법
- Tailwind CSS v4 디자인 시스템
- 반응형 디자인 & 접근성
- 성능 최적화 & 번들 관리
- Toast/Sonner 알림 시스템

**대상**:
- UI/UX 개발자
- 프론트엔드 엔지니어
- 컴포넌트 디자이너

---

### 🔧 [Backend 팀](./BACKEND_TEAM.md)
**역할**: Supabase 기반 백엔드 개발 및 비즈니스 로직

**주요 내용**:
- Supabase MCP 서버 사용법
- DB 스키마 & 마이그레이션
- RPC 함수 & Edge Functions
- Realtime 구독 & 알림 시스템
- 브라우저/Discord 알림 연동

**대상**:
- 백엔드 개발자
- DB 관리자
- API 설계자

---

### 🚀 [DevOps 팀](./DEVOPS_TEAM.md)
**역할**: CI/CD, 배포, 인프라 관리

**주요 내용**:
- GitHub Actions 워크플로우
- GitHub Pages 배포
- Supabase Edge Functions 배포
- 환경 변수 & Secret 관리
- 성능 모니터링 & 백업

**대상**:
- DevOps 엔지니어
- 인프라 관리자
- 배포 담당자

---

### ✅ [QA 팀](./QA_TEAM.md)
**역할**: 품질 보증, 테스팅, 버그 추적

**주요 내용**:
- 기능별 테스트 케이스
- 브라우저 호환성 & 반응형 테스트
- 접근성 & 성능 테스트
- Supabase Local Development
- 테스트 데이터 시드

**대상**:
- QA 엔지니어
- 테스터
- 품질 관리자

## 📖 필수 참조 문서

### 프로젝트 규칙
- **DESIGN_SYSTEM.md** (프로젝트 루트) - UI 디자인 규칙
- **.claude/CLAUDE.md** - 프로젝트별 AI 규칙
- **MEMORY.md** - 프로젝트 히스토리

### 협업 가이드
- **[COLLABORATION_GUIDE.md](./COLLABORATION_GUIDE.md)** - 팀 간 협업 프로세스
- **[GIT_WORKFLOW.md](./GIT_WORKFLOW.md)** - Git 브랜치 전략 & 커밋 규칙
- **[GLOSSARY.md](./GLOSSARY.md)** - 프로젝트 용어 사전
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - 통합 문제 해결 가이드

## 🚀 빠른 시작

### 1. 팀 선택
자신의 역할에 맞는 팀 프롬프트를 선택하세요.

```bash
# Frontend 개발자
cat .claude/prompts/FRONTEND_TEAM.md

# Backend 개발자
cat .claude/prompts/BACKEND_TEAM.md

# DevOps 담당자
cat .claude/prompts/DEVOPS_TEAM.md

# QA 담당자
cat .claude/prompts/QA_TEAM.md
```

### 2. AI에게 프롬프트 전달
Claude Code나 다른 AI 어시스턴트에게 해당 프롬프트를 제공하세요.

**예시**:
```
"Frontend 팀 프롬프트를 참고하여 파티 모집 카드 컴포넌트를 만들어줘"
```

### 3. 협업 가이드 확인
팀 간 협업이 필요한 경우 [COLLABORATION_GUIDE.md](./COLLABORATION_GUIDE.md)를 참고하세요.

## 💡 사용 팁

### ✅ 효과적인 프롬프트 활용
1. **구체적으로 요청**: "버튼 만들어줘" → "shadcn/ui Button 컴포넌트를 사용해서 primary variant로 로그인 버튼 만들어줘"
2. **프롬프트 참조**: "Frontend 프롬프트를 참고해서 ..."
3. **디자인 시스템 강조**: "DESIGN_SYSTEM.md 규칙을 따라서 ..."

### ✅ 팀별 작업 범위
- **Frontend**: UI 컴포넌트, 페이지, 스타일링
- **Backend**: DB 스키마, API, 비즈니스 로직
- **DevOps**: 배포, 워크플로우, 인프라
- **QA**: 테스트, 품질 검증, 버그 리포트

### ❌ 피해야 할 것
- 다른 팀 영역 침범 (예: Frontend가 DB 스키마 변경)
- 협업 가이드 무시
- 디자인 시스템 규칙 위반

## 🔄 워크플로우 예시

### 신규 기능 개발 (파티 모집 필터)
1. **Backend**: DB에 필터 컬럼 추가 → API 구현
2. **Frontend**: 필터 UI 컴포넌트 개발 → API 연동
3. **DevOps**: 마이그레이션 배포 → 모니터링
4. **QA**: 필터 기능 테스트 → 버그 리포트

### 버그 수정 (알림 누락)
1. **QA**: 버그 재현 → Issue 생성
2. **Backend**: 알림 로직 디버깅 → 수정
3. **Frontend**: UI 알림 표시 확인
4. **DevOps**: 핫픽스 배포
5. **QA**: 수정 확인 → Issue 닫기

## 📊 프로젝트 구조

```
lod-portal/
├── .claude/
│   ├── CLAUDE.md                 # 프로젝트 AI 규칙
│   └── prompts/
│       ├── README.md             # 이 파일
│       ├── FRONTEND_TEAM.md
│       ├── BACKEND_TEAM.md
│       ├── DEVOPS_TEAM.md
│       ├── QA_TEAM.md
│       ├── COLLABORATION_GUIDE.md
│       ├── GIT_WORKFLOW.md
│       ├── GLOSSARY.md
│       └── TROUBLESHOOTING.md
├── DESIGN_SYSTEM.md             # UI 디자인 규칙
├── src/
│   ├── components/              # React 컴포넌트
│   ├── pages/                   # 페이지
│   ├── lib/                     # API & 유틸
│   ├── hooks/                   # 커스텀 훅
│   └── types/                   # TypeScript 타입
├── .github/workflows/           # CI/CD
└── supabase/                    # DB 마이그레이션
```

## 🔗 참고 링크

### 공식 문서
- [React 문서](https://react.dev/)
- [TypeScript 문서](https://www.typescriptlang.org/)
- [Vite 문서](https://vitejs.dev/)
- [Supabase 문서](https://supabase.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)

### 프로젝트
- [GitHub Repository](https://github.com/minho83/lod-portal)
- [Production Site](https://minho83.github.io/lod-portal/)
- [Supabase Dashboard](https://supabase.com/dashboard/project/wjismpfswlqpkrjatlqe)

## 📝 프롬프트 업데이트

프롬프트는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.

**최근 업데이트**:
- 2025-02-08: 초기 생성 (4개 팀 프롬프트)
- 2025-02-08: 협업 가이드 & Git 워크플로우 추가
- 2025-02-08: 용어 사전 & 트러블슈팅 가이드 추가

## 💬 문의 & 피드백

프롬프트 관련 문의나 개선 제안은 GitHub Issues에 등록해주세요.

- **버그**: `bug` 라벨
- **개선 제안**: `enhancement` 라벨
- **문서**: `documentation` 라벨

---

**Happy Coding! 🎉**
