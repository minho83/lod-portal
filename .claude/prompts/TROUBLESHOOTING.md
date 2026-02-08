# 통합 트러블슈팅 가이드

LOD 포털 프로젝트의 일반적인 문제와 해결 방법입니다.

## 🎯 빠른 찾기

- [개발 환경](#-개발-환경)
- [빌드 & 배포](#-빌드--배포)
- [Supabase](#-supabase)
- [Frontend](#-frontend)
- [Git](#-git)
- [성능](#-성능)

---

## 🛠️ 개발 환경

### npm install 실패

**증상**: 의존성 설치 중 에러

```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve
```

**해결**:
```bash
# 1. node_modules 삭제
rm -rf node_modules package-lock.json

# 2. npm 캐시 정리
npm cache clean --force

# 3. 재설치
npm install

# 4. 여전히 안 되면 legacy peer deps 사용
npm install --legacy-peer-deps
```

---

### 개발 서버 실행 안 됨

**증상**: `npm run dev` 실행 시 에러

```bash
Error: Cannot find module 'vite'
```

**해결**:
```bash
# 의존성 확인 & 재설치
npm install

# 포트 충돌 확인 (5173 포트)
# Windows
netstat -ano | findstr :5173

# macOS/Linux
lsof -i :5173

# 프로세스 종료 후 재실행
```

---

### TypeScript 에러

**증상**: 타입 에러가 많이 발생

**해결**:
```bash
# 1. TypeScript 서버 재시작 (VSCode)
# Ctrl+Shift+P → "TypeScript: Restart TS Server"

# 2. node_modules/@types 재설치
rm -rf node_modules/@types
npm install

# 3. tsconfig.json 확인
# baseUrl과 paths 설정 확인
```

---

### 환경 변수 인식 안 됨

**증상**: `import.meta.env.VITE_*` 값이 undefined

**해결**:
```bash
# 1. .env.local 파일 확인
# 파일 위치: 프로젝트 루트
# 접두사: VITE_ 필수

# 2. 개발 서버 재시작
# 환경 변수 변경 시 재시작 필요

# 3. .env.local 예시
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🏗️ 빌드 & 배포

### 빌드 실패

**증상**: `npm run build` 에러

```bash
[vite]: Rollup failed to resolve import
```

**해결**:
```bash
# 1. 타입 에러 확인
npm run lint

# 2. 잘못된 import 확인
# @ alias 사용 확인
# import from '@/components/...'

# 3. 캐시 삭제 & 재빌드
rm -rf dist node_modules/.vite
npm run build
```

---

### GitHub Actions 배포 실패

**증상**: Actions 워크플로우 실패

**해결**:
```yaml
# 1. GitHub Secrets 확인
# Settings → Secrets → Actions
# 필수: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

# 2. 워크플로우 로그 확인
# Actions 탭 → 실패한 워크플로우 → 로그

# 3. 로컬에서 빌드 테스트
npm ci
npm run build

# 4. 권한 확인
# Settings → Actions → General
# Workflow permissions → Read and write
```

---

### GitHub Pages 404 에러

**증상**: 배포 후 페이지가 404

**해결**:
```typescript
// 1. vite.config.ts base 경로 확인
export default defineConfig({
  base: '/lod-portal/',  // GitHub Pages 서브경로
})

// 2. HashRouter 사용 확인
// src/App.tsx
import { HashRouter } from 'react-router-dom'

// 3. GitHub Pages 설정 확인
// Settings → Pages
// Source: GitHub Actions
```

---

## 🗄️ Supabase

### MCP 연결 안 됨

**증상**: Supabase MCP 서버 인식 안 됨

**해결**:
```bash
# 1. .mcp.json 확인
# 파일 위치: 프로젝트 루트
# "type": "http" 필드 필수

# 2. Claude Code 재시작

# 3. MCP 인증
# /mcp → Authenticate → 브라우저 로그인

# 4. MCP 설정 확인
cat .mcp.json
```

---

### DB 권한 에러

**증상**: `permission denied for table`

**해결**:
```sql
-- Supabase MCP를 통해 실행

-- 1. RLS 활성화 확인
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 2. 권한 부여
GRANT SELECT, INSERT, UPDATE, DELETE
ON table_name
TO anon, authenticated;

-- 3. RLS 정책 생성
CREATE POLICY "Users can view active items"
ON table_name
FOR SELECT
USING (status = 'active');
```

---

### 스키마 캐시 이슈

**증상**: DB 변경 후 API 응답 없음

**해결**:
```sql
-- PostgREST 스키마 리로드
NOTIFY pgrst, 'reload schema';

-- 또는 Supabase 대시보드
-- Settings → API → Reload schema cache
```

---

### Realtime 구독 안 됨

**증상**: 실시간 업데이트 동작 안 함

**해결**:
```typescript
// 1. Realtime 활성화 확인
// Supabase 대시보드 → Database → Replication
// 테이블 Realtime 활성화

// 2. 구독 코드 확인
const channel = supabase
  .channel('custom-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'table_name'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()

// 3. 구독 해제 (메모리 누수 방지)
return () => {
  supabase.removeChannel(channel)
}
```

---

### Edge Function 실행 안 됨

**증상**: Edge Function 호출 시 에러

**해결**:
```bash
# 1. 함수 배포 확인
supabase functions list

# 2. 함수 로그 확인
supabase functions logs recruit-reminder

# 3. 환경 변수 확인
supabase secrets list

# 4. 권한 확인
# Service Role Key 사용 확인
```

---

## 🎨 Frontend

### shadcn/ui 컴포넌트 import 에러

**증상**: `Module not found: Can't resolve '@/components/ui/button'`

**해결**:
```bash
# 1. 컴포넌트 설치 확인
npx shadcn@latest add button

# 2. tsconfig.json paths 확인
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# 3. vite.config.ts alias 확인
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

---

### Tailwind CSS 스타일 적용 안 됨

**증상**: Tailwind 클래스가 적용되지 않음

**해결**:
```typescript
// 1. index.css import 확인
// src/main.tsx
import './index.css'

// 2. index.css 내용 확인
@import "tailwindcss";

// 3. tailwind.config.ts 확인
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
}

// 4. 개발 서버 재시작
```

---

### Toast 알림 표시 안 됨

**증상**: `toast.success()` 호출해도 알림 없음

**해결**:
```tsx
// 1. Toaster 컴포넌트 추가 확인
// src/App.tsx
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <>
      {/* routes */}
      <Toaster />
    </>
  )
}

// 2. toast import 확인
import { toast } from "sonner"

toast.success("성공!")
```

---

### React Router 라우팅 안 됨

**증상**: 페이지 이동이 안 됨

**해결**:
```tsx
// 1. HashRouter 사용 확인
import { HashRouter } from 'react-router-dom'

// GitHub Pages는 HashRouter 필수
<HashRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
  </Routes>
</HashRouter>

// 2. Link 컴포넌트 사용
import { Link } from 'react-router-dom'

<Link to="/party">파티</Link>
```

---

## 📜 Git

### Merge Conflict

**증상**: Pull/Merge 시 충돌

**해결**:
```bash
# 1. Conflict 발생 파일 확인
git status

# 2. 파일 열어서 수정
# <<<<<<< HEAD
# 현재 브랜치 코드
# =======
# 병합할 코드
# >>>>>>> branch-name

# 3. Conflict markers 제거 후 저장

# 4. 스테이징 & 커밋
git add .
git commit -m "merge: Resolve conflict"
```

---

### Push Rejected

**증상**: `! [rejected] main -> main (non-fast-forward)`

**해결**:
```bash
# 1. 원격 변경사항 가져오기
git pull origin main --rebase

# 2. Conflict 있으면 해결

# 3. 푸시
git push origin main
```

---

### 잘못된 커밋 취소

**증상**: 잘못된 커밋을 되돌리고 싶음

**해결**:
```bash
# Push 전 (로컬만)
git reset --soft HEAD~1  # 커밋만 취소
git reset --hard HEAD~1  # 커밋 & 변경사항 모두 취소

# Push 후 (원격)
git revert HEAD  # 새 커밋으로 되돌림
git push origin main
```

---

## ⚡ 성능

### 페이지 로딩 느림

**증상**: 페이지 로드가 3초 이상 걸림

**해결**:
```typescript
// 1. 번들 크기 확인
npm run build -- --analyze

// 2. 코드 스플리팅
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        }
      }
    }
  }
})

// 3. 이미지 최적화
// - WebP 포맷 사용
// - lazy loading 적용
<img loading="lazy" src="..." />

// 4. Lighthouse 분석
// Chrome DevTools → Lighthouse
```

---

### 불필요한 리렌더링

**증상**: 컴포넌트가 너무 자주 렌더링됨

**해결**:
```tsx
// 1. React DevTools Profiler 사용
// Chrome Extension 설치

// 2. React.memo 사용
const MyComponent = React.memo(({ data }) => {
  return <div>{data}</div>
})

// 3. useMemo/useCallback 사용
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b)
}, [a, b])

const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])

// 4. 상태 구조 최적화
// 필요한 부분만 상태로 관리
```

---

### API 응답 느림

**증상**: API 호출이 1초 이상 걸림

**해결**:
```typescript
// 1. 필요한 컬럼만 선택
const { data } = await supabase
  .from('table')
  .select('id, name')  // 필요한 컬럼만
  .limit(50)           // 페이지네이션

// 2. 인덱스 확인
// Supabase 대시보드 → Database → Indexes

// 3. RPC 함수 사용
// 복잡한 쿼리는 PostgreSQL 함수로

// 4. 캐싱 (React Query 사용 시)
useQuery(['trades'], getTrades, {
  staleTime: 1000 * 60,  // 1분
  cacheTime: 1000 * 60 * 5,  // 5분
})
```

---

## 🔍 디버깅 팁

### Console Logging

```typescript
// 개발 환경에서만 로그
if (import.meta.env.DEV) {
  console.log('Debug:', data)
}

// 시간 측정
console.time('API Call')
await fetchData()
console.timeEnd('API Call')

// 테이블 형식
console.table(array)
```

---

### React DevTools

```
1. Chrome Extension 설치
2. F12 → Components/Profiler 탭
3. 컴포넌트 상태/Props 확인
4. 렌더링 성능 분석
```

---

### Network 디버깅

```
1. F12 → Network 탭
2. API 호출 확인
3. 응답 시간/크기 확인
4. 실패한 요청 디버깅
```

---

## 📞 추가 도움

### 문제가 해결되지 않을 때

1. **GitHub Issues 검색**: 유사한 이슈 확인
2. **공식 문서 확인**:
   - [Vite](https://vitejs.dev/)
   - [React](https://react.dev/)
   - [Supabase](https://supabase.com/docs)
   - [shadcn/ui](https://ui.shadcn.com/)
3. **팀에게 문의**: GitHub Issues에 새 Issue 생성
4. **로그 첨부**: 콘솔 에러, 네트워크 로그 포함

### Issue 생성 템플릿

```markdown
## 문제 설명
[간단명료하게 설명]

## 환경
- OS: Windows 11
- 브라우저: Chrome 120
- Node.js: v20.10.0
- npm: v10.2.3

## 재현 단계
1. ...
2. ...
3. ...

## 예상 결과
[기대했던 동작]

## 실제 결과
[실제 발생한 동작]

## 에러 메시지
```
[에러 메시지 전체]
```

## 시도한 해결 방법
- [ ] npm install 재실행
- [ ] 캐시 삭제
- [ ] ...

## 스크린샷/로그
[첨부]
```

---

**"문제는 기회입니다. 해결하면 더 강해집니다!"** 💪
