# 팀 간 협업 가이드

LOD 포털 프로젝트의 효율적인 팀 간 협업을 위한 가이드입니다.

## 🎯 협업 원칙

### 1. 명확한 책임 분리
각 팀은 자신의 전문 영역에 집중하고, 다른 팀 영역은 존중합니다.

| 팀 | 주요 책임 | 작업 범위 |
|---|---------|----------|
| **Frontend** | UI/UX 구현 | 컴포넌트, 페이지, 스타일 |
| **Backend** | 서버 로직 & DB | API, 스키마, RPC 함수 |
| **DevOps** | 배포 & 인프라 | CI/CD, 모니터링, 백업 |
| **QA** | 품질 보증 | 테스트, 버그 리포트 |

### 2. 투명한 커뮤니케이션
- 모든 변경 사항은 GitHub Issues/PR로 공유
- 중요한 결정은 팀 간 합의 필요
- 문제 발생 시 즉시 관련 팀에 알림

### 3. 문서화 우선
- 코드 변경 시 관련 문서 업데이트
- API 변경 시 타입 정의 동기화
- 새 기능은 README/DESIGN_SYSTEM 업데이트

## 🔄 협업 워크플로우

### 신규 기능 개발

```
1. 기획 & 설계
   └─> Backend: DB 스키마 설계
       Frontend: UI/UX 디자인
       DevOps: 인프라 요구사항 확인

2. Backend 구현
   └─> DB 마이그레이션 작성
       API 엔드포인트 구현
       타입 정의 (types/index.ts)
       DevOps에 배포 요청

3. Frontend 구현
   └─> Backend 타입 import
       UI 컴포넌트 개발
       API 연동

4. 통합 & 테스트
   └─> QA: 기능 테스트
       DevOps: 성능 모니터링
       버그 발견 → 해당 팀 수정

5. 배포
   └─> DevOps: 프로덕션 배포
       QA: 스모크 테스트
       모니터링 시작
```

### 버그 수정

```
1. QA: 버그 발견 & Issue 생성
   └─> 재현 단계 상세 작성
       우선순위 설정 (Critical/High/Medium/Low)
       관련 팀 태그

2. 해당 팀: 버그 분석 & 수정
   └─> 근본 원인 파악
       수정 PR 생성
       관련 팀 리뷰 요청

3. QA: 수정 확인
   └─> 버그 재현 안 됨 확인
       회귀 테스트
       Issue 닫기
```

## 🤝 팀별 협업 인터페이스

### Frontend ↔ Backend

#### API 계약
```typescript
// Backend: types/index.ts에 타입 정의
export interface PartyRecruit {
  id: string
  title: string
  status: RecruitStatus
  // ...
}

// Backend: API 함수 구현
export async function getRecruits(): Promise<PartyRecruit[]> {
  // ...
}

// Frontend: 타입 import & 사용
import type { PartyRecruit } from '@/types'
import { getRecruits } from '@/lib/recruits'
```

#### 협업 체크리스트
- [ ] Backend: 타입 정의 먼저 작성 (`types/index.ts`)
- [ ] Backend: API 함수 구현 후 Frontend에 알림
- [ ] Frontend: 타입 import & 사용
- [ ] Frontend: 에러 케이스 처리
- [ ] 양 팀: 통합 테스트

#### 커뮤니케이션 포인트
- API 엔드포인트 변경
- 응답 데이터 구조 변경
- 에러 메시지 형식
- Realtime 이벤트 구조

---

### Backend ↔ DevOps

#### 배포 요청
```markdown
## DB 마이그레이션 배포 요청

**마이그레이션 파일**: `supabase/migrations/20250208_add_notifications.sql`

**변경 내용**:
- `notifications` 테이블 추가
- RLS 정책 설정
- 인덱스 추가

**배포 시점**: 2025-02-08 23:00 KST (트래픽 낮을 때)

**롤백 계획**: [롤백 SQL 첨부]

**테스트 완료**: ✅ Local Supabase 테스트 완료
```

#### 협업 체크리스트
- [ ] Backend: 마이그레이션 SQL 작성 & 테스트
- [ ] Backend: 롤백 SQL 준비
- [ ] DevOps: 배포 시점 조율
- [ ] DevOps: Secrets 설정 (필요 시)
- [ ] DevOps: 배포 실행
- [ ] Backend: 배포 후 동작 확인

#### 커뮤니케이션 포인트
- DB 스키마 변경
- Edge Functions 배포
- 환경 변수 추가/변경
- Secrets 관리

---

### Frontend ↔ DevOps

#### 환경 변수 요청
```markdown
## 환경 변수 추가 요청

**변수명**: `VITE_DISCORD_CLIENT_ID`

**용도**: Discord OAuth 로그인

**값**: [Secret으로 전달]

**환경**: Production, Staging (Local은 .env.local)

**긴급도**: Medium (배포 전 필요)
```

#### 협업 체크리스트
- [ ] Frontend: 환경 변수 필요성 확인
- [ ] DevOps: GitHub Secrets 추가
- [ ] DevOps: 워크플로우에 변수 추가
- [ ] Frontend: 로컬 .env.local 추가
- [ ] 양 팀: 통합 테스트

#### 커뮤니케이션 포인트
- 빌드 에러
- 환경 변수 추가/변경
- 번들 크기 최적화
- 성능 개선

---

### QA ↔ 모든 팀

#### 버그 리포트
```markdown
## 🐛 버그: 파티 참가 버튼 클릭 시 에러

**우선순위**: High

**환경**:
- 브라우저: Chrome 120
- OS: Windows 11
- URL: https://minho83.github.io/lod-portal/#/recruit/123

**재현 단계**:
1. 파티 모집 상세 페이지 접속
2. "참가" 버튼 클릭
3. 에러 토스트 표시

**예상 결과**: 파티에 참가되고 "참가 완료" 메시지 표시

**실제 결과**: "오류가 발생했습니다" 토스트 표시

**콘솔 에러**:
```
Error: Failed to insert into party_members
  at recruits.ts:45
```

**스크린샷**: [첨부]

**관련 팀**: @Backend @Frontend
```

#### 협업 체크리스트
- [ ] QA: 버그 재현 & Issue 생성
- [ ] QA: 우선순위 & 관련 팀 태그
- [ ] 해당 팀: 버그 분석 & 수정
- [ ] QA: 수정 확인 & 회귀 테스트
- [ ] QA: Issue 닫기

## 📋 커뮤니케이션 채널

### GitHub Issues
- 버그 리포트
- 기능 제안
- 기술 논의

**라벨 규칙**:
- `bug` - 버그
- `enhancement` - 기능 개선
- `documentation` - 문서
- `frontend` - Frontend 팀
- `backend` - Backend 팀
- `devops` - DevOps 팀
- `qa` - QA 팀
- `priority:critical` - 긴급
- `priority:high` - 높음
- `priority:medium` - 중간
- `priority:low` - 낮음

### Pull Requests
- 코드 변경
- 리뷰 요청
- 배포 전 확인

**PR 템플릿**:
```markdown
## 변경 사항
[변경 내용 요약]

## 관련 Issue
Closes #123

## 체크리스트
- [ ] 코드 리뷰 완료
- [ ] 테스트 통과
- [ ] 문서 업데이트
- [ ] 관련 팀 확인

## 스크린샷 (UI 변경 시)
[스크린샷]

## 배포 노트
[배포 시 주의사항]
```

### Discord (예정)
- 실시간 소통
- 긴급 알림
- 일상 대화

## 🚨 긴급 상황 대응

### Critical 버그 발생 (서비스 다운)
```
1. QA: 즉시 관련 팀에 알림 (@Frontend @Backend @DevOps)
2. 해당 팀: 즉시 분석 시작 (30분 이내)
3. DevOps: 롤백 준비 (필요 시)
4. 수정 완료 → 핫픽스 배포
5. QA: 긴급 테스트
6. 사후 분석 (Post-mortem)
```

### 배포 실패
```
1. DevOps: 배포 중단 & 관련 팀 알림
2. 해당 팀: 로그 확인 & 원인 파악
3. DevOps: 이전 버전으로 롤백
4. 문제 수정 후 재배포
```

### DB 마이그레이션 실패
```
1. Backend: 즉시 DevOps에 알림
2. DevOps: DB 백업 확인
3. Backend: 롤백 SQL 실행
4. Backend: 마이그레이션 수정 & 재테스트
5. DevOps: 재배포
```

## 📊 협업 메트릭

### 추적 지표
- **평균 PR 리뷰 시간**: < 4시간
- **버그 수정 시간**: Critical < 4h, High < 24h
- **배포 빈도**: 주 2-3회
- **배포 성공률**: > 95%

### 개선 목표
- PR 리뷰 시간 단축
- 버그 발견 → 수정 사이클 단축
- 팀 간 의존성 최소화
- 문서화 품질 향상

## 🎓 베스트 프랙티스

### ✅ DO
- 작은 단위로 자주 커밋
- PR은 작게 유지 (< 500 lines)
- 코드 리뷰는 빠르게
- 변경 사항은 즉시 문서화
- 테스트 작성 (자동화 구축 시)

### ❌ DON'T
- 큰 변경을 한 번에 PR
- 리뷰 없이 머지
- 문서 없이 API 변경
- 테스트 없이 배포
- 다른 팀 영역 침범

## 📚 참고 자료

- [Git 워크플로우](./GIT_WORKFLOW.md)
- [프로젝트 용어 사전](./GLOSSARY.md)
- [트러블슈팅 가이드](./TROUBLESHOOTING.md)
- [팀별 프롬프트](./README.md)

---

**"좋은 협업이 좋은 제품을 만듭니다"** 🤝
