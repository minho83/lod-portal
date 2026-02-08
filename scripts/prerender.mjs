import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(__dirname, "../dist")
const serverDir = path.resolve(distDir, "server")

const ROUTES = [
  "/",
  "/calculator",
  "/spirit",
  "/npcmap",
  "/search",
  "/wiki",
  "/guide",
  "/profile",
  "/mypage",
  "/recruit",
  "/market",
]

async function prerender() {
  // 1. 클라이언트 빌드 index.html을 템플릿으로 읽기
  const template = fs.readFileSync(
    path.resolve(distDir, "index.html"),
    "utf-8",
  )

  // 2. 원본을 404.html로 복사 (동적 라우트용 SPA fallback)
  fs.copyFileSync(
    path.resolve(distDir, "index.html"),
    path.resolve(distDir, "404.html"),
  )
  console.log("Created 404.html (SPA fallback)")

  // 3. SSR 번들 로드
  const serverEntry = pathToFileURL(
    path.resolve(serverDir, "entry-server.js"),
  ).href
  const { render } = await import(serverEntry)

  // 4. 각 라우트 pre-render
  let success = 0
  let failed = 0

  for (const route of ROUTES) {
    try {
      const appHtml = render(route)

      // SSR 콘텐츠를 템플릿에 주입
      const html = template.replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`,
      )

      // 출력 경로 결정
      const outputPath =
        route === "/"
          ? path.resolve(distDir, "index.html")
          : path.resolve(distDir, route.slice(1), "index.html")

      // 디렉토리 생성
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })

      // 파일 작성
      fs.writeFileSync(outputPath, html)
      console.log(`  ✓ ${route} -> ${path.relative(distDir, outputPath)}`)
      success++
    } catch (error) {
      console.error(`  ✗ ${route}: ${error.message}`)

      // 에러 시 원본 템플릿으로 fallback
      const outputPath =
        route === "/"
          ? path.resolve(distDir, "index.html")
          : path.resolve(distDir, route.slice(1), "index.html")
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.writeFileSync(outputPath, template)
      failed++
    }
  }

  // 5. 서버 번들 삭제 (배포 불필요)
  fs.rmSync(serverDir, { recursive: true, force: true })

  console.log(
    `\nPre-rendering complete: ${success} success, ${failed} fallback`,
  )
}

prerender().catch((err) => {
  console.error("Pre-render failed:", err)
  process.exit(1)
})
