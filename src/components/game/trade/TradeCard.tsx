import { Link } from "react-router-dom"
import { Handshake, Tag, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TradeBadge } from "@/components/game/TradeBadge"
import { formatPrice, formatPriceDelta, timeAgo } from "@/lib/utils"
import type { Trade, MarketPrice } from "@/types"

export function TradeCard({ trade, priceMap }: { trade: Trade; priceMap: Map<string, MarketPrice> }) {
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
            <TradeBadge tradeType={trade.trade_type} />
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
