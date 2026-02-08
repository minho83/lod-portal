# Vercel 배포 가이드

## 1. Vercel 계정 생성
https://vercel.com 에서 GitHub 계정으로 로그인

## 2. 프로젝트 연동
1. Vercel 대시보드에서 "Add New" → "Project" 클릭
2. GitHub 저장소 `minho83/lod-portal` 선택
3. "Import" 클릭

## 3. 환경 변수 설정
Environment Variables 섹션에서 다음 두 개의 환경 변수 추가:

- **Name**: `NOTION_TOKEN`
  - **Value**: (Notion Integration Token - 별도 전달)

- **Name**: `NOTION_DATABASE_ID`
  - **Value**: `18d50fc9dbd282998b9881d7d965f53f`

## 4. 배포
"Deploy" 버튼 클릭하면 자동으로 빌드 및 배포가 시작됩니다.

## 5. 도메인 설정 (선택사항)
배포 후 Vercel이 제공하는 URL (예: lod-portal.vercel.app)을 사용하거나,
커스텀 도메인 `lod-portal.cc`를 연결할 수 있습니다.

### 커스텀 도메인 연결
1. Vercel 프로젝트 설정 → Domains
2. `lod-portal.cc` 입력 후 Add
3. Cloudflare DNS 설정:
   - A 레코드: `76.76.21.21`
   - CNAME 레코드: `cname.vercel-dns.com`

## 주의사항
- `.env` 파일은 GitHub에 커밋되지 않으므로, Vercel 환경 변수에 직접 입력해야 합니다
- Notion Integration Token은 절대 공개하지 마세요
