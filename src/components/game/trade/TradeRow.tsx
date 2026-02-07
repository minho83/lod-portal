import { Link } from "react-router-dom"
import { Handshake, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TradeBadge } from "@/components/game/TradeBadge"
import { formatPrice, formatPriceDelta, timeAgo } from "@/lib/utils"
import type { Trade, MarketPrice } from "@/types"

export function TradeRow({ trade, priceMap }: { trade: Trade; priceMap: Map<string, MarketPrice> }) {
  const sellerName =
    trade.seller?.game_nickname ?? trade.seller?.discord_username ?? "알 수 없음"
  const isBundle = trade.items && trade.items.length > 0

  const singlePrice = !isBundle ? priceMap.get(trade.item_name) : undefined
  const singleDelta = singlePrice ? formatPriceDelta(trade.price, singlePrice.median_price) : null

  return (
    <Link
      to={`/market/${trade.id}`}
      className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-2.5 transition-colors hover:border-primary/50"
    >
      {/* 거래유형 */}
      <div className="shrink-0">
        <TradeBadge tradeType={trade.trade_type} />
      </div>

      {/* 아이템 정보 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-semibold">{trade.item_name}</span>
          {isBundle && (
            <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
              <Layers className="mr-0.5 h-2.5 w-2.5" />
              {trade.items!.length}건
            </Badge>
          )}
          {trade.is_negotiable && (
            <Handshake className="h-3 w-3 shrink-0 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{isBundle ? "묶음" : trade.item_category}</span>
          {!isBundle && trade.quantity > 1 && <span>x{trade.quantity}</span>}
          <span>{sellerName}</span>
          <span>{timeAgo(trade.created_at)}</span>
        </div>
      </div>

      {/* 가격 */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-primary">{formatPrice(trade.price)}</p>
        {singleDelta?.text ? (
          <p className={`text-[10px] ${singleDelta.color}`}>{singleDelta.text}</p>
        ) : (
          <p className="text-[10px] text-muted-foreground">{trade.price_unit}</p>
        )}
      </div>
    </Link>
  )
}
