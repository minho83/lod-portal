import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { Search, Plus, Package, Handshake, Tag, ShoppingCart, Store, BarChart3, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { formatPrice, formatPriceDelta, timeAgo } from "@/lib/utils"
import type { Trade, TradeCategory, TradeType, MarketPrice } from "@/types"
import { TRADE_CATEGORIES } from "@/types"

export function MarketPage() {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [priceMap, setPriceMap] = useState<Map<string, MarketPrice>>(new Map())
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

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
        {user && (
          <Button asChild size="sm">
            <Link to="/market/new">
              <Plus className="mr-1.5 h-4 w-4" />
              글 등록
            </Link>
          </Button>
        )}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <Package className="h-10 w-10" />
            <p>등록된 매물이 없습니다</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trades.map((trade) => (
            <TradeCard key={trade.id} trade={trade} priceMap={priceMap} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}

/* ─── 시세 요약 패널 ─── */

function PriceSummaryPanel({ prices }: { prices: MarketPrice[] }) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BarChart3 className="h-4 w-4 text-primary" />
          시세 정보
        </div>
        <div className="space-y-2">
          {prices.map((p) => (
            <div key={p.item_name} className="rounded-md bg-card/50 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold">{p.item_name}</span>
                <span className="text-xs text-muted-foreground">
                  {p.trade_count}건 / {p.window_days}일
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <p className="text-muted-foreground">중위가</p>
                  <p className="font-semibold text-primary">{formatPrice(p.median_price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">평균가</p>
                  <p className="font-medium">{formatPrice(p.avg_price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">최저가</p>
                  <p className="font-medium text-green-400">{formatPrice(p.min_price)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">최고가</p>
                  <p className="font-medium text-red-400">{formatPrice(p.max_price)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── 거래 카드 ─── */

function TradeCard({ trade, priceMap }: { trade: Trade; priceMap: Map<string, MarketPrice> }) {
  const sellerName =
    trade.seller?.game_nickname ?? trade.seller?.discord_username ?? "알 수 없음"
  const isBundle = trade.items && trade.items.length > 0

  // 단일 아이템 시세
  const singlePrice = !isBundle ? priceMap.get(trade.item_name) : undefined
  const singleDelta = singlePrice ? formatPriceDelta(trade.price, singlePrice.median_price) : null

  return (
    <Link to={`/market/${trade.id}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardContent className="space-y-3 p-4">
          {/* 상단: 거래유형 + 카테고리/묶음 + 협상 */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={trade.trade_type === "buy" ? "outline" : "default"}
              className={trade.trade_type === "buy" ? "border-violet-500/50 text-violet-400" : "bg-emerald-600 text-white"}
            >
              {trade.trade_type === "buy" ? "삽니다" : "팝니다"}
            </Badge>
            {isBundle ? (
              <Badge variant="secondary">
                <Layers className="mr-1 h-3 w-3" />
                묶음 {trade.items!.length}건
              </Badge>
            ) : (
              <Badge variant="secondary">{trade.item_category}</Badge>
            )}
            {trade.is_negotiable && (
              <Badge variant="outline" className="text-xs">
                <Handshake className="mr-1 h-3 w-3" />
                협상가능
              </Badge>
            )}
            {!isBundle && trade.quantity > 1 && (
              <Badge variant="outline" className="text-xs">
                x{trade.quantity}
              </Badge>
            )}
          </div>

          {isBundle ? (
            <>
              {/* 묶음: 아이템 목록 */}
              <h3 className="text-base font-semibold">{trade.item_name}</h3>
              <div className="space-y-1 rounded-md bg-muted/30 p-2">
                {trade.items!.slice(0, 3).map((item, i) => {
                  const mp = priceMap.get(item.item_name)
                  const delta = mp ? formatPriceDelta(item.price, mp.median_price) : null
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="truncate">
                        <span className="text-muted-foreground">{item.item_category}</span>
                        {" "}
                        {item.item_name}
                        {item.quantity > 1 && <span className="text-muted-foreground"> x{item.quantity}</span>}
                      </span>
                      <span className="ml-2 flex shrink-0 items-center gap-1">
                        <span className="font-medium text-primary">{formatPrice(item.price)}</span>
                        {delta?.text && <span className={delta.color}>{delta.text}</span>}
                      </span>
                    </div>
                  )
                })}
                {trade.items!.length > 3 && (
                  <p className="text-xs text-muted-foreground">외 {trade.items!.length - 3}건...</p>
                )}
              </div>
              {/* 총 가격 */}
              <div className="flex items-baseline gap-1.5">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">총</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(trade.price)}
                </span>
                <span className="text-xs text-muted-foreground">{trade.price_unit}</span>
              </div>
            </>
          ) : (
            <>
              {/* 단일: 아이템명 */}
              <h3 className="text-base font-semibold">{trade.item_name}</h3>

              {/* 가격 + 시세 */}
              <div className="flex items-baseline gap-1.5">
                <Tag className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold text-primary">
                  {formatPrice(trade.price)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {trade.price_unit}
                </span>
                {singleDelta?.text && (
                  <span className={`text-xs ${singleDelta.color}`}>{singleDelta.text}</span>
                )}
              </div>

              {/* 시세 참조 */}
              {singlePrice && (
                <div className="text-xs text-muted-foreground">
                  시세 {formatPrice(singlePrice.median_price)} ({singlePrice.trade_count}건, {singlePrice.window_days}일)
                </div>
              )}
            </>
          )}

          {/* 하단: 판매자 + 시간 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{sellerName}</span>
            <span>{timeAgo(trade.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
