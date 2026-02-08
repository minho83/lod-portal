import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  const NOTION_TOKEN = process.env.NOTION_TOKEN
  const DATABASE_ID = process.env.NOTION_DATABASE_ID

  if (!NOTION_TOKEN || !DATABASE_ID) {
    return res.status(500).json({
      error: "Notion 환경 변수가 설정되지 않았습니다",
    })
  }

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sorts: [
            {
              property: "순서",
              direction: "ascending",
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Notion API 오류: ${response.status} - ${error}`)
    }

    const data = await response.json()

    return res.status(200).json({
      results: data.results,
    })
  } catch (error: any) {
    console.error("Notion API 오류:", error)
    return res.status(500).json({
      error: error.message || "Notion 데이터를 가져올 수 없습니다",
    })
  }
}
