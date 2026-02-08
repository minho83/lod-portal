// Notion API 토큰과 데이터베이스 ID
// .env 파일에서 설정하거나 GitHub Secrets에서 주입
const NOTION_TOKEN = import.meta.env.VITE_NOTION_TOKEN
const DATABASE_ID = import.meta.env.VITE_NOTION_DATABASE_ID

/**
 * Notion 데이터베이스에서 뉴비 가이드 데이터 조회
 * CORS 프록시를 통해 직접 호출
 */
export async function fetchNotionDatabase() {
  try {
    // CORS 우회를 위한 프록시 사용
    const notionUrl = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(notionUrl)}`

    const response = await fetch(proxyUrl, {
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
    })

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`)
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Notion 데이터베이스 조회 실패:", error)
    throw error
  }
}

/**
 * Notion 데이터베이스 항목을 WikiCategory 형식으로 변환
 */
export function convertNotionToWikiFormat(items: any[]) {
  const categories: Map<string, any> = new Map()

  for (const item of items) {
    try {
      const properties = item.properties

      // 카테고리 추출
      const categoryName =
        properties["카테고리"]?.select?.name || "기타"

      // 제목 추출
      const title =
        properties["제목"]?.title?.[0]?.plain_text ||
        properties["Name"]?.title?.[0]?.plain_text ||
        "제목 없음"

      // 내용 추출
      const content =
        properties["내용"]?.rich_text?.[0]?.plain_text || ""

      // 중요 여부
      const isImportant = properties["중요"]?.checkbox || false

      // 아이콘 추출
      const icon = item.icon?.emoji || properties["아이콘"]?.rich_text?.[0]?.plain_text

      // 카테고리가 없으면 생성
      if (!categories.has(categoryName)) {
        categories.set(categoryName, {
          name: categoryName,
          icon: "",
          items: [],
        })
      }

      // 아이템 추가
      const category = categories.get(categoryName)!
      category.items.push({
        id: item.id,
        title,
        icon,
        star: isImportant,
        blocks: content
          ? [
              {
                type: "paragraph",
                content,
              },
            ]
          : undefined,
      })
    } catch (error) {
      console.error("항목 변환 실패:", error, item)
    }
  }

  return Array.from(categories.values())
}
