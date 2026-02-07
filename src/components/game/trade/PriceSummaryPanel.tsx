import { BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import type { MarketPrice } from "@/types"

export function PriceSummaryPanel({ prices }: { prices: MarketPrice[] }) {
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
