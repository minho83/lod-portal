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
  Star,
  FileText,
  FolderOpen,
  Loader2,
} from "lucide-react"
import { EmptyState } from "@/components/game/EmptyState"
import { ErrorState } from "@/components/game/ErrorState"
import { fetchWiki } from "@/lib/api"
import { parseWikiBlocks, matchesSearch } from "@/lib/wiki-parser"
import type { WikiCategory, WikiItem, WikiBlock } from "@/types"

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
        <ErrorState message={error} onRetry={loadWiki} />
      ) : categories.length === 0 ? (
        <EmptyState
          title="아직 위키 데이터가 없습니다"
          description="서버가 연결되어 있는지 확인해주세요"
        />
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
