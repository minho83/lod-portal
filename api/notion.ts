import { Client } from "@notionhq/client"

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const DATABASE_ID = process.env.NOTION_DATABASE_ID || ""

export default async function handler(req: any, res: any) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.status(200).end()
    return
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [
        {
          property: "순서",
          direction: "ascending",
        },
      ],
    })

    res.status(200).json({
      results: response.results,
    })
  } catch (error: any) {
    console.error("Notion API 오류:", error)
    res.status(500).json({
      error: error.message || "Notion 데이터를 가져올 수 없습니다",
    })
  }
}
