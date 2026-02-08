# DevOps 팀 프롬프트

## 역할
CI/CD, 배포, 인프라 관리 전문 팀

## 필수 참조 문서
- **.claude/CLAUDE.md** - 프로젝트 규칙
- **MEMORY.md** - 배포 설정 정보

## 기술 스택
- GitHub Actions (CI/CD)
- GitHub Pages (정적 호스팅)
- Supabase (BaaS)
- Vite (빌드 도구)

## 배포 환경

### Production
- **URL**: https://minho83.github.io/lod-portal/
- **Branch**: `main`
- **자동 배포**: main 브랜치 push 시 자동 배포
- **호스팅**: GitHub Pages

### Development
- **URL**: http://localhost:5173
- **명령어**: `npm run dev`

## GitHub Actions 워크플로우

### 1. Deploy (배포)
**파일**: `.github/workflows/deploy.yml`

```yaml
트리거:
  - main 브랜치 push
  - 수동 실행 (workflow_dispatch)

작업:
  1. Build:
     - Node.js 20 설치
     - 의존성 설치 (npm ci)
     - 프로젝트 빌드 (npm run build)
     - 아티팩트 업로드 (dist/)

  2. Deploy:
     - GitHub Pages에 배포
     - CNAME 설정 (도메인 사용 시)
```

**환경 변수** (GitHub Secrets):
```
VITE_SUPABASE_URL: Supabase 프로젝트 URL
VITE_SUPABASE_ANON_KEY: Supabase Anon 키
VITE_SERVER_URL: 레거시 서버 URL (선택)
```

### 2. Recruit Reminder (파티모집 알림)
**파일**: `.github/workflows/recruit-reminder.yml`

```yaml
트리거:
  - 스케줄: 매 5분마다 (*/5 * * * *)
  - 수동 실행

작업:
  - Supabase Edge Function 호출 (recruit-reminder)
  - 모집 시작 5분 전 알림 전송
```

**필요 Secret**:
```
SUPABASE_SERVICE_KEY: Supabase 서비스 키 (높은 권한)
```

### 3. Daily Maintenance (일일 유지보수)
**파일**: `.github/workflows/daily-maintenance.yml`

```yaml
트리거:
  - 스케줄:
    - 매일 자정 KST (0 15 * * *)  # UTC 15:00
    - 매시간 (0 * * * *)           # 만료 처리
  - 수동 실행

작업:
  1. 시세 집계 (자정에만):
     - RPC: aggregate_daily_prices
     - 전날 거래 데이터 집계

  2. 거래 만료 처리 (매시간):
     - RPC: expire_old_trades
     - 24시간 경과 거래 만료

  3. 모집글 마감 (매시간):
     - RPC: close_expired_recruits
     - 예정 시간 경과한 모집글 마감
```

## 빌드 & 배포 프로세스

### 로컬 빌드
```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트 체크
npm run lint
```

### 빌드 설정
**파일**: `vite.config.ts`

```typescript
export default defineConfig({
  base: '/lod-portal/',  // GitHub Pages 서브경로
  build: {
    outDir: 'dist',
    sourcemap: false,      // 프로덕션에서 소스맵 비활성화
    rollupOptions: {
      output: {
        manualChunks: {    // 코드 스플리팅
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react']
        }
      }
    }
  }
})
```

### 라우팅 설정
**HashRouter 사용 이유**:
- GitHub Pages는 SPA 라우팅 미지원
- HashRouter는 `/#/path` 형식으로 클라이언트 라우팅
- 404.html 불필요

```typescript
// src/App.tsx
import { HashRouter } from 'react-router-dom'

function App() {
  return (
    <HashRouter>
      {/* 라우트 */}
    </HashRouter>
  )
}
```

## 환경 변수 관리

### 개발 환경 (.env.local)
```env
VITE_SUPABASE_URL=https://wjismpfswlqpkrjatlqe.supabase.co
VITE_SUPABASE_ANON_KEY=[development-key]
VITE_SERVER_URL=http://localhost:3000  # 선택
```

### 프로덕션 환경 (GitHub Secrets)
```
Settings → Secrets and variables → Actions → Repository secrets

필수:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY

선택:
- VITE_SERVER_URL (레거시 서버)
```

### 환경 변수 접근
```typescript
// TypeScript에서 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## CI/CD 파이프라인

### 배포 플로우
```
1. 코드 Push (main 브랜치)
   ↓
2. GitHub Actions 트리거
   ↓
3. Build Job 실행
   - 의존성 설치
   - TypeScript 컴파일
   - Vite 빌드
   ↓
4. Deploy Job 실행
   - GitHub Pages에 배포
   ↓
5. 배포 완료 (~2-3분)
```

### 배포 모니터링
```bash
# Actions 탭에서 워크플로우 실행 확인
# GitHub → Actions → Deploy to GitHub Pages

# 실패 시 로그 확인
# 워크플로우 실행 → 실패한 Job → 로그 확인
```

## 성능 최적화

### 빌드 최적화
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Terser로 압축
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // console.log 제거
        drop_debugger: true
      }
    },

    // 청크 크기 경고 임계값
    chunkSizeWarningLimit: 1000,

    // 코드 스플리팅
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
```

### 캐싱 전략
```yaml
# GitHub Actions 캐싱
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'  # npm 캐시 활성화
```

### 번들 크기 분석
```bash
# 번들 분석
npm run build -- --analyze

# 또는 rollup-plugin-visualizer 사용
```

## 모니터링 & 알림

### GitHub Actions 알림
```yaml
# 실패 시 이메일 알림 (GitHub 기본 제공)
# Settings → Notifications → Actions
```

### Supabase 모니터링
- **대시보드**: https://supabase.com/dashboard
- **API Health**: API 요청 수, 에러율
- **Database**: 쿼리 성능, 연결 수
- **Storage**: 사용량

### 워크플로우 상태 뱃지
```markdown
# README.md에 추가
![Deploy](https://github.com/minho83/lod-portal/actions/workflows/deploy.yml/badge.svg)
```

## 롤백 & 복구

### GitHub Pages 롤백
```bash
# 이전 커밋으로 롤백
git revert HEAD
git push origin main

# 또는 특정 커밋으로 리셋
git reset --hard <commit-hash>
git push origin main --force  # 주의: force push
```

### Supabase 롤백
```sql
-- 마이그레이션 롤백 (수동)
-- 이전 마이그레이션 SQL 실행
```

## 보안

### Secrets 관리
```bash
# Secret 추가
GitHub → Settings → Secrets → New repository secret

# Secret 로테이션
- 정기적으로 Supabase 키 재생성
- GitHub Secret 업데이트
```

### 권한 관리
```yaml
# 워크플로우 권한 최소화
permissions:
  contents: read      # 코드 읽기만
  pages: write        # Pages 쓰기
  id-token: write     # OIDC 토큰
```

### HTTPS 적용
```
GitHub Pages는 기본적으로 HTTPS 강제
- https://minho83.github.io/lod-portal/
```

## 문제 해결

### 배포 실패
```bash
# 1. 빌드 에러 확인
npm run build

# 2. TypeScript 에러 확인
npm run lint

# 3. 환경 변수 확인
# GitHub Secrets 설정 확인

# 4. 워크플로우 로그 확인
# Actions 탭 → 실패한 워크플로우 → 로그
```

### 워크플로우 실행 안 됨
```yaml
# 트리거 확인
on:
  push:
    branches: [main]  # 브랜치명 확인

# 워크플로우 파일 위치 확인
.github/workflows/deploy.yml
```

### Supabase RPC 실패
```bash
# Service Key 확인
# Secrets에 SUPABASE_SERVICE_KEY 설정 확인

# RPC 함수 존재 확인
# Supabase 대시보드 → Database → Functions

# 권한 확인
GRANT EXECUTE ON FUNCTION function_name TO service_role;
```

### 캐시 문제
```yaml
# 캐시 무효화
- name: Clear cache
  run: npm cache clean --force
```

## 유지보수 작업

### 정기 작업 (월 1회)
- [ ] 의존성 업데이트 (`npm update`)
- [ ] 보안 취약점 체크 (`npm audit`)
- [ ] Supabase 키 로테이션 (분기 1회)
- [ ] 워크플로우 성능 검토
- [ ] 빌드 시간 모니터링

### 의존성 업데이트
```bash
# 취약점 확인
npm audit

# 자동 수정
npm audit fix

# 메이저 버전 업데이트
npm update --save
```

## 배포 체크리스트

### 배포 전
- [ ] 로컬 빌드 성공 (`npm run build`)
- [ ] TypeScript 에러 없음 (`npm run lint`)
- [ ] 환경 변수 설정 확인
- [ ] GitHub Secrets 설정 확인
- [ ] 테스트 통과 (추후 구현)

### 배포 후
- [ ] GitHub Actions 성공 확인
- [ ] 프로덕션 사이트 동작 확인
- [ ] 콘솔 에러 확인 (F12)
- [ ] 주요 기능 동작 확인
- [ ] 모바일 반응형 확인

## 성능 벤치마크

### 목표 지표
- **빌드 시간**: < 2분
- **배포 시간**: < 3분 (전체)
- **페이지 로드**: < 3초 (3G)
- **번들 크기**: < 500KB (초기)

### 측정 도구
- Lighthouse (Chrome DevTools)
- WebPageTest
- Bundle Analyzer

## Supabase Edge Functions 배포

### Edge Functions 구조
```
supabase/
└── functions/
    └── recruit-reminder/
        ├── index.ts
        └── deno.json (optional)
```

### 배포 프로세스
```bash
# 1. Supabase CLI 설치
npm install -g supabase

# 2. 로그인
supabase login

# 3. 프로젝트 연결
supabase link --project-ref wjismpfswlqpkrjatlqe

# 4. 함수 배포
supabase functions deploy recruit-reminder

# 5. 환경 변수 설정
supabase secrets set SOME_SECRET=value
```

### GitHub Actions로 자동 배포
```yaml
# .github/workflows/deploy-functions.yml
name: Deploy Edge Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase functions deploy recruit-reminder
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: wjismpfswlqpkrjatlqe
```

## DB 백업 & 복구

### 자동 백업 (Supabase 기본 제공)
- 일일 자동 백업 (7일 보관)
- PITR (Point-in-Time Recovery) - Pro 플랜 이상

### 수동 백업
```bash
# pg_dump로 백업
supabase db dump -f backup.sql

# 복원
supabase db reset
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup.sql
```

### 마이그레이션 백업
```bash
# 마이그레이션 히스토리 보기
supabase migration list

# 특정 시점으로 롤백
supabase migration repair --status reverted 20240101000000
```

## 환경별 설정 관리

### Development
```bash
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=local-anon-key
```

### Production
```bash
# GitHub Secrets
VITE_SUPABASE_URL=https://wjismpfswlqpkrjatlqe.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_KEY=prod-service-key
```

### Staging (예정)
```bash
# Staging 환경 구축 시
VITE_SUPABASE_URL=https://staging-xxx.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
```

## 성능 모니터링 도구

### 1. GitHub Actions 성능
- 빌드 시간 추적
- 배포 시간 측정
- Actions 사용량 모니터링

### 2. Vercel Analytics (예정)
- 실시간 사용자 분석
- Core Web Vitals 추적
- 성능 인사이트

### 3. Supabase Dashboard
- API 요청 수
- DB 쿼리 성능
- Realtime 연결 수
- Storage 사용량

### 4. Lighthouse CI (예정)
```yaml
# .github/workflows/lighthouse.yml
- uses: treosh/lighthouse-ci-action@v9
  with:
    urls: https://minho83.github.io/lod-portal/
    budgetPath: .lighthouserc.json
```

## 팀 간 협업

### Frontend 팀과 협업
- 빌드 에러 디버깅
- 환경 변수 추가/변경
- 성능 최적화 제안

### Backend 팀과 협업
- DB 마이그레이션 배포 스케줄 조율
- Edge Functions 배포
- Secret 관리

### QA 팀과 협업
- 배포 전 스모크 테스트 요청
- 롤백 프로세스 협의
- 성능 벤치마크 공유

## 참고 자료
- [GitHub Actions 문서](https://docs.github.com/actions)
- [GitHub Pages 문서](https://docs.github.com/pages)
- [Vite 문서](https://vitejs.dev/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
