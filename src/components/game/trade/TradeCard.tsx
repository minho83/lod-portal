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
      <Card className="transition-colors hover:border-primary/50 h-full py-0 gap-0">
        <CardContent className="space-y-1.5 p-2 px-2">
          {/* 상단: 거래유형 + 카테고리/묶음 + 협상 + 예약 */}
          <div className="flex flex-wrap items-center gap-1">
            <TradeBadge tradeType={trade.trade_type} />
            {trade.status === "reserved" && (
              <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] px-1.5 py-0">
                예약중
              </Badge>
            )}
            {isBundle ? (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                <Layers className="mr-0.5 h-2.5 w-2.5" />
                묶음 {trade.items!.length}건
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{trade.item_category}</Badge>
            )}
            {trade.is_negotiable && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                <Handshake className="mr-0.5 h-2.5 w-2.5" />
                협상
              </Badge>
            )}
            {!isBundle && trade.quantity > 1 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                x{trade.quantity}
              </Badge>
            )}
          </div>

          {isBundle ? (
            <>
              <h3 className="text-sm font-semibold leading-tight truncate">{trade.item_name}</h3>
              <div className="space-y-0.5 rounded bg-muted/30 p-1">
                {trade.items!.slice(0, 2).map((item, i) => {
                  const mp = priceMap.get(item.item_name)
                  const delta = mp ? formatPriceDelta(item.price, mp.median_price) : null
                  return (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="truncate">
                        <span className="text-muted-foreground">{item.item_category}</span>
                        {" "}{item.item_name}
                      </span>
                      <span className="ml-1 flex shrink-0 items-center gap-0.5">
                        <span className="font-medium text-primary">{formatPrice(item.price)}</span>
                        {delta?.text && <span className={delta.color}>{delta.text}</span>}
                      </span>
                    </div>
                  )
                })}
                {trade.items!.length > 2 && (
                  <p className="text-[10px] text-muted-foreground">외 {trade.items!.length - 2}건</p>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="text-base font-bold text-primary">{formatPrice(trade.price)}</span>
                <span className="text-[10px] text-muted-foreground">{trade.price_unit}</span>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold leading-tight truncate">{trade.item_name}</h3>
              <div className="flex items-baseline gap-1">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="text-base font-bold text-primary">{formatPrice(trade.price)}</span>
                <span className="text-[10px] text-muted-foreground">{trade.price_unit}</span>
                {singleDelta?.text && (
                  <span className={`text-[10px] ${singleDelta.color}`}>{singleDelta.text}</span>
                )}
              </div>
              {singlePrice && (
                <p className="text-[10px] text-muted-foreground">
                  시세 {formatPrice(singlePrice.median_price)} ({singlePrice.trade_count}건)
                </p>
              )}
            </>
          )}

          {/* 하단: 판매자 + 시간 */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5 border-t border-border/50">
            <span className="truncate">{sellerName}</span>
            <span className="shrink-0">{timeAgo(trade.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
