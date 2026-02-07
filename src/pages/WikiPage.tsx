import { useState, useEffect, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Inbox,
  Star,
  FileText,
  FolderOpen,
  Loader2,
} from "lucide-react"
import { fetchWiki } from "@/lib/api"
import type { WikiCategory, WikiItem, WikiBlock } from "@/types"

// ── Helpers ──

function parseWikiBlocks(blocks: unknown[]): WikiCategory[] {
  if (!Array.isArray(blocks) || blocks.length === 0) return []

  // Try to interpret the data structure
  // If blocks are already WikiCategory-shaped, use them directly
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

function matchesSearch(item: WikiItem, query: string): boolean {
  const lower = query.toLowerCase()
  if (item.title.toLowerCase().includes(lower)) return true
  if (item.blocks?.some((b) => b.content.toLowerCase().includes(lower))) return true
  if (item.children?.some((child) => matchesSearch(child, lower))) return true
  return false
}

// ── Sub-components ──

function WikiSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 py-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function WikiBlockRenderer({ block }: { block: WikiBlock }) {
  return (
    <div className="space-y-1">
      {block.content && (
        <p
          className={cn(
            "text-sm leading-relaxed",
            block.type === "heading_2" || block.type === "heading_3"
              ? "font-semibold text-foreground"
              : "text-muted-foreground",
          )}
        >
          {block.content}
        </p>
      )}
      {block.children && block.children.length > 0 && (
        <div className="space-y-1 pl-4 border-l border-border">
          {block.children.map((child, i) => (
            <WikiBlockRenderer key={i} block={child} />
          ))}
        </div>
      )}
    </div>
  )
}

function WikiItemCard({
  item,
  depth = 0,
}: {
  item: WikiItem
  depth?: number
}) {
  const [isOpen, setIsOpen] = useState(false)

  const hasContent =
    (item.blocks && item.blocks.length > 0) ||
    (item.children && item.children.length > 0)

  return (
    <div className={cn(depth > 0 && "pl-4 border-l border-border")}>
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
          "hover:bg-accent",
          hasContent && "cursor-pointer",
          !hasContent && "cursor-default",
        )}
        onClick={() => hasContent && setIsOpen(!isOpen)}
        type="button"
      >
        {hasContent ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        <span className="flex-1 font-medium">
          {item.icon && <span className="mr-1">{item.icon}</span>}
          {item.title}
        </span>

        {item.star && <Star className="h-3.5 w-3.5 text-warning shrink-0" />}
      </button>

      {isOpen && hasContent && (
        <div className="space-y-2 px-3 pb-3">
          {item.blocks && item.blocks.length > 0 && (
            <div className="space-y-2 rounded-md bg-secondary/30 p-3">
              {item.blocks.map((block, i) => (
                <WikiBlockRenderer key={i} block={block} />
              ))}
            </div>
          )}

          {item.children && item.children.length > 0 && (
            <div className="space-y-1">
              {item.children.map((child) => (
                <WikiItemCard key={child.id} item={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WikiCategoryCard({
  category,
  searchQuery,
}: {
  category: WikiCategory
  searchQuery: string
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return category.items
    return category.items.filter((item) => matchesSearch(item, searchQuery))
  }, [category.items, searchQuery])

  if (filteredItems.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <button
          className="flex w-full items-center gap-2 text-left"
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
        >
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-primary" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <CardTitle className="flex-1 text-sm">
            {category.icon && <span className="mr-1">{category.icon}</span>}
            {category.name}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {filteredItems.length}
          </Badge>
        </button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-1 pt-0">
          {filteredItems.map((item) => (
            <WikiItemCard key={item.id} item={item} />
          ))}
        </CardContent>
      )}
    </Card>
  )
}

// ── Main Page ──

export function WikiPage() {
  const [categories, setCategories] = useState<WikiCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const loadWiki = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchWiki()
      const parsed = parseWikiBlocks(data.blocks)
      setCategories(parsed)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "위키 데이터를 불러올 수 없습니다"
      setError(message)
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWiki()
  }, [loadWiki])

  const displayedCategories = useMemo(() => {
    if (activeCategory) {
      return categories.filter((c) => c.name === activeCategory)
    }
    return categories
  }, [categories, activeCategory])

  const visibleCount = useMemo(() => {
    return displayedCategories.reduce((acc, cat) => {
      if (!searchQuery.trim()) return acc + cat.items.length
      return acc + cat.items.filter((item) => matchesSearch(item, searchQuery)).length
    }, 0)
  }, [displayedCategories, searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">뉴비 가이드</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadWiki}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          새로고침
        </Button>
      </div>

      {/* Search within wiki */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="가이드 내용 검색..."
          className="pl-9"
        />
      </div>

      {/* Category navigation chips */}
      {!isLoading && categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            전체
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.name}
              variant={activeCategory === cat.name ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setActiveCategory(activeCategory === cat.name ? null : cat.name)
              }
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.name}
              <Badge variant="secondary" className="ml-1 text-xs">
                {cat.items.length}
              </Badge>
            </Button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <WikiSkeleton />
      ) : error ? (
        <Card className="border-destructive/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="mb-4 h-12 w-12 text-destructive/50" />
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={loadWiki}
            >
              다시 시도
            </Button>
          </CardContent>
        </Card>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              아직 위키 데이터가 없습니다
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              서버가 연결되어 있는지 확인해주세요
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {searchQuery.trim() && (
            <p className="text-sm text-muted-foreground">
              검색 결과{" "}
              <span className="font-semibold text-foreground">{visibleCount}</span>건
            </p>
          )}
          {displayedCategories.map((category) => (
            <WikiCategoryCard
              key={category.name}
              category={category}
              searchQuery={searchQuery}
            />
          ))}
          {searchQuery.trim() && visibleCount === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Search className="mb-4 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">
                  &quot;{searchQuery}&quot;에 대한 결과가 없습니다
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
