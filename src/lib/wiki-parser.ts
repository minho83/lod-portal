import type { WikiCategory, WikiItem, WikiBlock } from "@/types"

export function parseWikiBlocks(blocks: unknown[]): WikiCategory[] {
  if (!Array.isArray(blocks) || blocks.length === 0) return []

  const categories: WikiCategory[] = []

  for (const block of blocks) {
    if (typeof block === "object" && block !== null) {
      const b = block as Record<string, unknown>

      // Check if it looks like a WikiCategory
      if ("name" in b && "items" in b && Array.isArray(b.items)) {
        categories.push({
          name: String(b.name || ""),
          icon: String(b.icon || ""),
          items: parseWikiItems(b.items as unknown[]),
        })
        continue
      }

      // Check if it's a generic block with type/content
      if ("type" in b) {
        const type = String(b.type || "unknown")
        const content = String(b.content || b.text || b.title || "")
        const children = Array.isArray(b.children) ? b.children : []

        // Group top-level heading blocks as categories
        if (type === "heading_1" || type === "heading" || type === "category") {
          categories.push({
            name: content,
            icon: String(b.icon || ""),
            items: parseWikiItems(children as unknown[]),
          })
        } else {
          // Add to a miscellaneous category
          let misc = categories.find((c) => c.name === "기타")
          if (!misc) {
            misc = { name: "기타", icon: "", items: [] }
            categories.push(misc)
          }
          misc.items.push({
            id: `block-${categories.length}-${misc.items.length}`,
            title: content || type,
            blocks: [
              {
                type,
                content,
                children: children.map((ch) => ({
                  type: String((ch as Record<string, unknown>).type || "text"),
                  content: String(
                    (ch as Record<string, unknown>).content ||
                      (ch as Record<string, unknown>).text ||
                      "",
                  ),
                })),
              },
            ],
          })
        }
      }
    }
  }

  // If no categories were created, wrap everything in a single category
  if (categories.length === 0 && blocks.length > 0) {
    categories.push({
      name: "가이드",
      icon: "",
      items: blocks.map((block, i) => ({
        id: `raw-${i}`,
        title: extractTitle(block),
        blocks: [
          {
            type: "raw",
            content: typeof block === "string" ? block : JSON.stringify(block, null, 2),
          },
        ],
      })),
    })
  }

  return categories
}

function parseWikiItems(items: unknown[]): WikiItem[] {
  return items.map((item, i) => {
    if (typeof item === "object" && item !== null) {
      const it = item as Record<string, unknown>
      return {
        id: String(it.id || `item-${i}`),
        title: String(it.title || it.name || it.content || `항목 ${i + 1}`),
        icon: it.icon ? String(it.icon) : undefined,
        star: Boolean(it.star),
        blocks: Array.isArray(it.blocks) ? parseBlocks(it.blocks as unknown[]) : undefined,
        children: Array.isArray(it.children)
          ? parseWikiItems(it.children as unknown[])
          : undefined,
      }
    }
    return {
      id: `item-${i}`,
      title: String(item),
    }
  })
}

function parseBlocks(blocks: unknown[]): WikiBlock[] {
  return blocks.map((block) => {
    if (typeof block === "object" && block !== null) {
      const b = block as Record<string, unknown>
      return {
        type: String(b.type || "text"),
        content: String(b.content || b.text || ""),
        children: Array.isArray(b.children)
          ? parseBlocks(b.children as unknown[])
          : undefined,
      }
    }
    return { type: "text", content: String(block) }
  })
}

function extractTitle(block: unknown): string {
  if (typeof block === "string") return block
  if (typeof block === "object" && block !== null) {
    const b = block as Record<string, unknown>
    return String(b.title || b.name || b.content || b.text || "항목")
  }
  return "항목"
}

export function matchesSearch(item: WikiItem, query: string): boolean {
  const lower = query.toLowerCase()
  if (item.title.toLowerCase().includes(lower)) return true
  if (item.blocks?.some((b) => b.content.toLowerCase().includes(lower))) return true
  if (item.children?.some((child) => matchesSearch(child, lower))) return true
  return false
}
