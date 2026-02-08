const PAGE_ID = "18d50fc9dbd282998b9881d7d965f53f"

/**
 * Notion Public 페이지에서 데이터 조회
 */
export async function fetchNotionDatabase() {
  try {
    // Notion Public API 프록시 사용
    const response = await fetch(
      `https://notion-api.splitbee.io/v1/page/${PAGE_ID}`
    )

    if (!response.ok) {
      throw new Error(`Notion API 오류: ${response.status}`)
    }

    const data = await response.json()

    // 모든 블록 데이터 추출
    const blocks = Object.values(data).filter((item: any) => item.value)

    // collection 타입의 블록들을 찾아서 변환
    const results = blocks
      .filter((block: any) => block.value.type === "page" || block.value.type === "collection_view")
      .map((block: any) => {
        const properties = block.value.properties || {}

        return {
          id: block.value.id,
          properties: {
            제목: {
              title: properties.title ? [{ plain_text: properties.title[0]?.[0] || "" }] : [],
            },
            카테고리: {
              select: { name: properties.카테고리?.[0]?.[0] || "기타" },
            },
            내용: {
              rich_text: properties.내용 ? [{ plain_text: properties.내용[0]?.[0] || "" }] : [],
            },
            중요: {
              checkbox: properties.중요?.[0]?.[0] === "Yes" || false,
            },
            아이콘: {
              rich_text: properties.아이콘 ? [{ plain_text: properties.아이콘[0]?.[0] || "" }] : [],
            },
          },
        }
      })

    return results
  } catch (error) {
    console.error("Notion 데이터베이스 조회 실패:", error)
    throw error
  }
}

/**
 * Notion 페이지 블록 조회
 */
export async function fetchNotionBlocks(pageId: string) {
  try {
    const response = await fetch(
      `https://notion-api.splitbee.io/v1/page/${pageId}`
    )

    if (!response.ok) {
      throw new Error(`Notion API 오류: ${response.status}`)
    }

    const data = await response.json()
    const blocks = Object.values(data).filter((item: any) => item.value)
    return blocks.map((block: any) => block.value)
  } catch (error) {
    console.error("Notion 블록 조회 실패:", error)
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
