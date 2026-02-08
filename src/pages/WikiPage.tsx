import { BookOpen } from "lucide-react"

const NOTION_URL = "https://lod-wiki.notion.site/18d50fc9dbd282998b9881d7d965f53f?v=2f850fc9dbd280bd96e1000c6ec6b438"

export function WikiPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">뉴비 가이드</h2>
      </div>

      {/* Notion 페이지 임베드 */}
      <div className="notion-embed-container">
        <iframe
          src={NOTION_URL}
          className="w-full rounded-lg border border-border bg-card"
          style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}
          title="뉴비 가이드 - Notion"
        />
      </div>
    </div>
  )
}
