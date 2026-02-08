# Git 워크플로우 가이드

LOD 포털 프로젝트의 Git 브랜치 전략 및 커밋 규칙입니다.

## 🌳 브랜치 전략

### 브랜치 구조

```
main (production)
  ├─ feature/login-ui
  ├─ feature/party-filter
  ├─ bugfix/notification-duplicate
  └─ hotfix/party-join-error
```

### 브랜치 종류

| 브랜치 | 용도 | 네이밍 | 예시 |
|-------|------|--------|------|
| `main` | 프로덕션 배포 | - | `main` |
| `feature/*` | 신규 기능 개발 | `feature/기능명` | `feature/discord-login` |
| `bugfix/*` | 버그 수정 | `bugfix/버그명` | `bugfix/toast-not-showing` |
| `hotfix/*` | 긴급 수정 | `hotfix/이슈명` | `hotfix/party-crash` |
| `refactor/*` | 리팩토링 | `refactor/대상` | `refactor/api-layer` |
| `docs/*` | 문서 작업 | `docs/문서명` | `docs/update-readme` |
| `test/*` | 테스트 추가 | `test/기능명` | `test/party-e2e` |
| `chore/*` | 기타 작업 | `chore/작업명` | `chore/update-deps` |

### 브랜치 생명주기

```
1. 브랜치 생성
   git checkout -b feature/new-feature main

2. 작업 & 커밋
   git add .
   git commit -m "feat: 기능 추가"

3. 원격 푸시
   git push -u origin feature/new-feature

4. PR 생성 & 리뷰
   GitHub에서 PR 생성 → 리뷰 → 승인

5. Merge
   GitHub에서 "Squash and merge"

6. 브랜치 삭제
   git branch -d feature/new-feature
   git push origin --delete feature/new-feature
```

## 📝 커밋 메시지 규칙

### Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (필수)

| Type | 설명 | 예시 |
|------|------|------|
| `feat` | 새 기능 | `feat: 파티 필터 기능 추가` |
| `fix` | 버그 수정 | `fix: 알림 중복 표시 수정` |
| `docs` | 문서 | `docs: README 업데이트` |
| `style` | 코드 포맷 | `style: 들여쓰기 정리` |
| `refactor` | 리팩토링 | `refactor: API 호출 로직 개선` |
| `test` | 테스트 | `test: 파티 E2E 테스트 추가` |
| `chore` | 기타 작업 | `chore: 의존성 업데이트` |
| `perf` | 성능 개선 | `perf: 이미지 lazy loading` |
| `ci` | CI/CD | `ci: GitHub Actions 워크플로우 수정` |
| `build` | 빌드 | `build: Vite 설정 변경` |
| `revert` | 되돌리기 | `revert: feat: 파티 필터 기능 추가` |

### Scope (선택)

작업 범위를 명시합니다.

```
feat(party): 파티 모집 필터 추가
fix(auth): 로그인 토큰 만료 처리
docs(api): API 문서 업데이트
```

**일반적인 Scope**:
- `party` - 파티 모집
- `trade` - 거래소
- `calc` - 라르 계산기
- `auth` - 인증
- `notif` - 알림
- `ui` - UI 컴포넌트
- `api` - API
- `db` - 데이터베이스

### Subject (필수)

- 50자 이내로 작성
- 명령형으로 작성 ("추가한다" ✅, "추가했다" ❌)
- 마침표 없이 작성
- 한글 또는 영어

**좋은 예시**:
```
feat: Discord 로그인 기능 추가
fix: 파티 참가 버튼 클릭 오류 수정
docs: 설치 가이드 업데이트
```

**나쁜 예시**:
```
feat: 기능 추가함.          # 마침표, 과거형
fix: 버그                   # 불명확
update                      # type 없음
```

### Body (선택)

무엇을, 왜 변경했는지 상세히 작성합니다.

```
feat(party): 직업별 필터 기능 추가

파티 모집 목록에서 직업(전사, 도적, 법사, 직자, 도가)별로
필터링할 수 있는 기능을 추가했습니다.

- 직업 선택 칩 UI 구현
- 다중 선택 가능
- URL 쿼리 파라미터로 상태 유지
```

### Footer (선택)

이슈 참조, Breaking Changes 명시

```
Closes #123
Fixes #456

BREAKING CHANGE: API 응답 구조 변경
기존: { data: [] }
변경: { items: [], total: 0 }
```

## 🔀 Pull Request

### PR 제목

커밋 메시지와 동일한 규칙을 따릅니다.

```
feat(party): 직업별 필터 기능 추가
fix(auth): 로그인 토큰 만료 처리
docs: API 문서 업데이트
```

### PR 템플릿

```markdown
## 📝 변경 사항
[변경 내용을 간략히 요약]

## 🔗 관련 Issue
Closes #123

## ✅ 체크리스트
- [ ] 로컬에서 빌드 성공 (`npm run build`)
- [ ] 타입 체크 통과 (`npm run lint`)
- [ ] 코드 리뷰 완료
- [ ] 테스트 작성/업데이트 (해당 시)
- [ ] 문서 업데이트 (해당 시)
- [ ] DESIGN_SYSTEM.md 준수 (Frontend)
- [ ] DB 마이그레이션 테스트 (Backend)

## 📸 스크린샷 (UI 변경 시)
[Before/After 스크린샷]

## 🚀 배포 노트
[배포 시 주의사항, 환경 변수 추가 등]

## 👥 리뷰어
@팀원1 @팀원2
```

### PR 크기 가이드

- **Small** (< 200 lines): 빠른 리뷰 가능 ✅
- **Medium** (200-500 lines): 적정 크기 ✅
- **Large** (> 500 lines): 가능하면 분리 ⚠️

### PR 리뷰 프로세스

```
1. PR 생성
   └─> 자동 CI/CD 실행 (빌드, 린트)

2. 리뷰 요청
   └─> 관련 팀원 태그
       최소 1명 Approve 필요

3. 리뷰 & 피드백
   └─> 코드 리뷰
       개선 제안
       질문 & 답변

4. 수정 & 재리뷰
   └─> 피드백 반영
       재리뷰 요청

5. Approve
   └─> 최소 1명 Approve

6. Merge
   └─> "Squash and merge" 사용
       브랜치 자동 삭제
```

## 🚀 릴리스 프로세스

### 버전 관리 (Semantic Versioning)

```
MAJOR.MINOR.PATCH

예: 1.2.3
- 1: MAJOR (Breaking Changes)
- 2: MINOR (새 기능, 하위 호환)
- 3: PATCH (버그 수정)
```

### 릴리스 워크플로우

```
1. 버전 결정
   └─> Breaking Changes → MAJOR++
       새 기능 → MINOR++
       버그 수정 → PATCH++

2. CHANGELOG 업데이트
   └─> 추가된 기능
       수정된 버그
       Breaking Changes

3. 버전 태그
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin v1.2.3

4. GitHub Release 생성
   └─> Release Notes 작성
       Assets 업로드 (필요 시)

5. 배포
   └─> main 브랜치 자동 배포
       모니터링
```

## 🔧 Git 설정

### Git Config

```bash
# 사용자 정보
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 기본 브랜치
git config --global init.defaultBranch main

# 에디터
git config --global core.editor "code --wait"

# 커밋 템플릿 (선택)
git config --global commit.template ~/.gitmessage
```

### Commit Template

```bash
# ~/.gitmessage
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>

# type: feat, fix, docs, style, refactor, test, chore
# scope: party, trade, calc, auth, notif, ui, api, db
# subject: 50자 이내, 명령형
```

### .gitignore

```gitignore
# 의존성
node_modules/

# 빌드
dist/
.vite/

# 환경 변수
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# 로그
*.log
npm-debug.log*

# 테스트
coverage/
.nyc_output/

# Supabase
.supabase/
```

## 📋 일반적인 Git 명령어

### 브랜치 관리

```bash
# 브랜치 생성 & 전환
git checkout -b feature/new-feature

# 브랜치 목록
git branch -a

# 브랜치 삭제
git branch -d feature/old-feature
git push origin --delete feature/old-feature

# 브랜치 이름 변경
git branch -m old-name new-name
```

### 커밋

```bash
# 스테이징
git add .
git add file1.ts file2.ts

# 커밋
git commit -m "feat: 기능 추가"

# 마지막 커밋 수정 (push 전)
git commit --amend

# 특정 파일만 스테이징 & 커밋
git commit file.ts -m "fix: 수정"
```

### 동기화

```bash
# 원격 변경사항 가져오기
git fetch origin

# 원격 변경사항 가져오기 & 병합
git pull origin main

# 푸시
git push origin feature/new-feature

# 강제 푸시 (주의!)
git push origin feature/new-feature --force
```

### 되돌리기

```bash
# 스테이징 취소
git reset HEAD file.ts

# 로컬 변경 취소
git checkout -- file.ts

# 커밋 되돌리기 (새 커밋 생성)
git revert HEAD

# 커밋 되돌리기 (히스토리 삭제, 주의!)
git reset --hard HEAD~1
```

### 히스토리

```bash
# 커밋 로그
git log

# 간단한 로그
git log --oneline

# 그래프로 보기
git log --graph --oneline --all

# 특정 파일 히스토리
git log -- file.ts
```

## 🚨 문제 해결

### Merge Conflict

```bash
# 1. Conflict 발생
git merge feature/branch
# CONFLICT (content): Merge conflict in file.ts

# 2. 파일 수정 (conflict markers 제거)
# <<<<<<< HEAD
# 현재 브랜치 코드
# =======
# 병합할 브랜치 코드
# >>>>>>> feature/branch

# 3. 스테이징 & 커밋
git add file.ts
git commit -m "merge: Resolve conflict in file.ts"
```

### Push Rejected

```bash
# 원격 변경사항 먼저 가져오기
git pull origin main --rebase
git push origin main
```

### 잘못된 커밋 수정

```bash
# 마지막 커밋 메시지 수정 (push 전)
git commit --amend -m "fix: 올바른 메시지"

# 마지막 커밋에 파일 추가 (push 전)
git add forgotten-file.ts
git commit --amend --no-edit
```

## 📚 참고 자료

- [Git 공식 문서](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)

---

**"좋은 Git 히스토리는 프로젝트의 역사입니다"** 📜
