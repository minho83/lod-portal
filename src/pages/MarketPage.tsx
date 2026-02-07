import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { Search, Plus, Package, ShoppingCart, Store, LayoutGrid, List } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { fetchTrades, fetchMarketPriceMap, extractItemNames, PAGE_SIZE, type TradeFilters } from "@/lib/trades"
import { EmptyState } from "@/components/game/EmptyState"
import { Pagination } from "@/components/game/Pagination"
import { PriceSummaryPanel } from "@/components/game/trade/PriceSummaryPanel"
import { TradeCard } from "@/components/game/trade/TradeCard"
import { TradeRow } from "@/components/game/trade/TradeRow"
import type { Trade, TradeCategory, TradeType, MarketPrice } from "@/types"
import { TRADE_CATEGORIES } from "@/types"

export function MarketPage() {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [priceMap, setPriceMap] = useState<Map<string, MarketPrice>>(new Map())
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // 뷰 모드
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    return (localStorage.getItem("market-view") as "grid" | "list") || "grid"
  })

  const toggleView = (mode: "grid" | "list") => {
    setViewMode(mode)
    localStorage.setItem("market-view", mode)
  }

  // 필터
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState<TradeCategory | "">("")
  const [tradeType, setTradeType] = useState<TradeType | "">("")
  const [searchInput, setSearchInput] = useState("")

  const loadTrades = useCallback(async () => {
    setLoading(true)
    try {
      const filters: TradeFilters = {}
      if (keyword) filters.keyword = keyword
      if (category) filters.category = category
      if (tradeType) filters.tradeType = tradeType
      const result = await fetchTrades(filters, page)
      setTrades(result.data)
      setTotalCount(result.count)

      // 시세 데이터 로드 (묶음 아이템 포함)
      const itemNames = extractItemNames(result.data)
      if (itemNames.length > 0) {
        try {
          const map = await fetchMarketPriceMap(itemNames)
          setPriceMap(map)
        } catch {
          // 시세 테이블 미생성 시 무시
        }
      }
    } catch {
      setTrades([])
      setTotalCount(0)
    }
    setLoading(false)
  }, [keyword, category, tradeType, page])

  useEffect(() => {
    loadTrades()
  }, [loadTrades])

  const handleSearch = () => {
    setKeyword(searchInput)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  // 검색 시 보여줄 시세 목록 (최대 5개)
  const searchPrices = keyword
    ? [...priceMap.values()]
        .sort((a, b) => b.trade_count - a.trade_count)
        .slice(0, 5)
    : []

  return (
    <div className="space-y-6 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">거래소</h2>
        <div className="flex items-center gap-2">
          {/* 뷰 토글 */}
          <div className="flex rounded-md border border-border">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={() => toggleView("grid")}
              title="타일 보기"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={() => toggleView("list")}
              title="리스트 보기"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
          {user && (
            <Button asChild size="sm">
              <Link to="/market/new">
                <Plus className="mr-1.5 h-4 w-4" />
                글 등록
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* 거래유형 탭 */}
      <Tabs
        value={tradeType || "all"}
        onValueChange={(v) => {
          setTradeType(v === "all" ? "" : (v as TradeType))
          setPage(1)
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
          <TabsTrigger value="sell" className="flex-1">
            <Store className="mr-1.5 h-3.5 w-3.5" />
            팝니다
          </TabsTrigger>
          <TabsTrigger value="buy" className="flex-1">
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            삽니다
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 필터 바 */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="아이템명 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="min-w-0 flex-1"
            />
            <Button variant="secondary" size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v === "all" ? "" : (v as TradeCategory))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {TRADE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 시세 요약 패널 (검색 시에만 표시) */}
      {searchPrices.length > 0 && <PriceSummaryPanel prices={searchPrices} />}

      {/* 매물 목록 */}
      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        )
      ) : trades.length === 0 ? (
        <EmptyState icon={Package} title="등록된 매물이 없습니다" />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {trades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} priceMap={priceMap} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {trades.map((trade) => (
            <TradeRow key={trade.id} trade={trade} priceMap={priceMap} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}

