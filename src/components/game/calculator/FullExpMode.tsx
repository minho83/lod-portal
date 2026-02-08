import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  calculateFullExpRar,
  formatExp,
} from "@/lib/calculator"
import type { CalcSettings } from "@/components/game/calculator/types"
import {
  ResultCard,
  ResultRow,
  CostSummary,
} from "@/components/game/calculator/shared"

export function FullExpMode({
  settings,
  currentHp,
  currentMp,
}: {
  settings: CalcSettings
  currentHp: string
  currentMp: string
}) {
  const hpVal = parseInt(currentHp) || 0
  const mpVal = parseInt(currentMp) || 0

  const result = useMemo(() => {
    if (hpVal <= 0 && mpVal <= 0) return null
    return calculateFullExpRar(hpVal, mpVal, settings.discountRate)
  }, [hpVal, mpVal, settings.discountRate])

  return (
    <div className="space-y-6">
      {result ? (
        <ResultCard title="풀경험치 라르 계산 (EXP 100% → 라르)">
          <ResultRow label="현재 단수" value={`${result.dansu}단`} valueClass="text-primary" />
          <ResultRow label="최대 보유 경험치" value={formatExp(result.maxExp)} />

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <Card className={cn("border", result.recommended === "hp" ? "border-warrior/50" : "border-border")}>
              <CardContent className="space-y-2 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-warrior">HP로 소비</span>
                  {result.recommended === "hp" && (
                    <Badge variant="secondary" className="text-xs">추천</Badge>
                  )}
                </div>
                <div className="text-lg font-bold text-warrior">
                  {result.hp.rar.toLocaleString()}개
                </div>
                <div className="text-xs text-muted-foreground">
                  HP {result.hp.start.toLocaleString()} → {result.hp.target.toLocaleString()} (+{result.hp.gain.toLocaleString()})
                </div>
              </CardContent>
            </Card>
            <Card className={cn("border", result.recommended === "mp" ? "border-mage/50" : "border-border")}>
              <CardContent className="space-y-2 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-mage">MP로 소비</span>
                  {result.recommended === "mp" && (
                    <Badge variant="secondary" className="text-xs">추천</Badge>
                  )}
                </div>
                <div className="text-lg font-bold text-mage">
                  {result.mp.rar.toLocaleString()}개
                </div>
                <div className="text-xs text-muted-foreground">
                  MP {result.mp.start.toLocaleString()} → {result.mp.target.toLocaleString()} (+{result.mp.gain.toLocaleString()})
                </div>
              </CardContent>
            </Card>
          </div>

          <CostSummary totalRar={result.minRar} settings={settings} />
        </ResultCard>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            상단에 현재 순수 HP/MP를 입력하면 풀경험치 라르가 자동으로 계산됩니다
          </CardContent>
        </Card>
      )}
    </div>
  )
}
