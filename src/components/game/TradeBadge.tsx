import { Badge } from "@/components/ui/badge"
import type { TradeType } from "@/types"

interface TradeBadgeProps {
  tradeType: TradeType
}

export function TradeBadge({ tradeType }: TradeBadgeProps) {
  if (tradeType === "buy") {
    return (
      <Badge variant="outline" className="border-violet-500/50 text-violet-400">
        삽니다
      </Badge>
    )
  }
  return (
    <Badge variant="default" className="bg-emerald-600 text-white">
      팝니다
    </Badge>
  )
}
