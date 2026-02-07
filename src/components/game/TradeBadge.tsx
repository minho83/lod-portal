import { Badge } from "@/components/ui/badge"
import type { TradeType } from "@/types"

interface TradeBadgeProps {
  tradeType: TradeType
}

export function TradeBadge({ tradeType }: TradeBadgeProps) {
  if (tradeType === "buy") {
    return (
      <Badge variant="outline" className="border-violet-500/50 text-violet-400 text-[10px] px-1.5 py-0">
        삽니다
      </Badge>
    )
  }
  return (
    <Badge variant="default" className="bg-emerald-600 text-white text-[10px] px-1.5 py-0">
      팝니다
    </Badge>
  )
}
