import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  Search,
  Loader2,
  Inbox,
  Sword,
  Sparkles,
  BookOpen,
} from "lucide-react"
import { ErrorState } from "@/components/game/ErrorState"
import { searchDatabase } from "@/lib/api"
import type { SearchResult } from "@/types"

// ── Constants ──

const CATEGORIES = [
  { key: "all", label: "전체", icon: Search },
  { key: "item", label: "아이템", icon: Sword },
  { key: "skill", label: "기술", icon: Sparkles },
  { key: "spell", label: "마법", icon: BookOpen },
] as const

type CategoryKey = (typeof CATEGORIES)[number]["key"]

const CATEGORY_BADGE_MAP: Record<
  SearchResult["category"],
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  item: { label: "아이템", variant: "default" },
  skill: { label: "기술", variant: "secondary" },
  spell: { label: "마법", variant: "outline" },
}

// ── Sub-components ──

function SearchSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Inbox className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">
          검색어를 입력해주세요
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          초성 검색도 지원합니다
        </p>
      </CardContent>
    </Card>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Search className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">
          &quot;{query}&quot;에 대한 검색 결과가 없습니다
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          다른 검색어를 시도해보세요
        </p>
      </CardContent>
    </Card>
  )
}

function StatValue({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  if (!value || value === "0") return null
  return (
    <span className={cn("text-xs", className)}>
      <span className="text-muted-foreground">{label}</span>{" "}
      <span className="font-medium">{value}</span>
    </span>
  )
}

function ResultCard({ result }: { result: SearchResult }) {
  const badgeConfig = CATEGORY_BADGE_MAP[result.category]

  const stats = [
    { label: "STR", value: result.str },
    { label: "DEX", value: result.dex },
    { label: "INT", value: result.int },
    { label: "WIS", value: result.wis },
    { label: "CON", value: result.con },
    { label: "HP", value: result.hp, className: "text-warrior" },
    { label: "MP", value: result.mp, className: "text-mage" },
  ].filter((s) => s.value && s.value !== "0")

  const combatStats = [
    { label: "AC", value: result.ac },
    { label: "마방", value: result.magicDefense },
    { label: "소뎀", value: result.smallDamage },
    { label: "대뎀", value: result.largeDamage },
  ].filter((s) => s.value && s.value !== "0")

  const metaInfo = [
    result.job && { label: "직업", value: result.job },
    result.level && result.level !== "0" && { label: "Lv", value: result.level },
    result.needLevel &&
      result.needLevel !== "0" && { label: "착용Lv", value: result.needLevel },
    result.costMana &&
      result.costMana !== "0" && { label: "마나", value: result.costMana },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
          <CardTitle className="text-sm">{result.displayName}</CardTitle>
        </div>
        {result.categoryName && result.categoryName !== result.displayName && (
          <p className="text-xs text-muted-foreground">{result.categoryName}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {metaInfo.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {metaInfo.map((info) => (
              <StatValue key={info.label} label={info.label} value={info.value} />
            ))}
          </div>
        )}

        {stats.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {stats.map((stat) => (
              <StatValue
                key={stat.label}
                label={stat.label}
                value={stat.value}
                className={stat.className}
              />
            ))}
          </div>
        )}

        {combatStats.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {combatStats.map((stat) => (
              <StatValue key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        )}

        {result.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {result.description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// ── Main Page ──

export function SearchPage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryKey>("all")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const performSearch = useCallback(
    async (searchQuery: string, searchCategory: CategoryKey) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await searchDatabase(searchQuery, searchCategory)
        setResults(data.results)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "검색 중 오류가 발생했습니다"
        setError(message)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim()
    if (!trimmed) return
    setHasSearched(true)
    performSearch(trimmed, category)
  }, [query, category, performSearch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch()
      }
    },
    [handleSearch],
  )

  const handleCategoryChange = useCallback(
    (newCategory: CategoryKey) => {
      setCategory(newCategory)
      if (hasSearched && query.trim()) {
        performSearch(query.trim(), newCategory)
      }
    },
    [hasSearched, query, performSearch],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">DB 검색</h2>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="아이템, 기술, 마법 이름을 검색하세요 (초성 검색 가능)"
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">검색</span>
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={category === key ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(key)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <SearchSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={handleSearch} />
      ) : !hasSearched ? (
        <EmptyState />
      ) : results.length === 0 ? (
        <NoResults query={query} />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            검색 결과{" "}
            <span className="font-semibold text-foreground">
              {results.length}
            </span>
            건
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((result, index) => (
              <ResultCard key={`${result.category}-${result.displayName}-${index}`} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
