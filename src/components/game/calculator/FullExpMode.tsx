import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  calculateTotalExp,
  calculateDansu,
  calculateFullExpRar,
  formatExp,
} from "@/lib/calculator"
import type { CalcSettings } from "@/components/game/calculator/types"
import {
  StatInputGroup,
  DansuDisplay,
  ResultCard,
  ResultRow,
  CostSummary,
} from "@/components/game/calculator/shared"

export function FullExpMode({ settings }: { settings: CalcSettings }) {
  const [hp, setHp] = useState("0")
  const [mp, setMp] = useState("0")

  const hpVal = parseInt(hp) || 0
  const mpVal = parseInt(mp) || 0

  const result = useMemo(() => {
    if (hpVal <= 0 && mpVal <= 0) return null
    return calculateFullExpRar(hpVal, mpVal, settings.discountRate)
  }, [hpVal, mpVal, settings.discountRate])

  const dansu = useMemo(() => {
    const totalExp = calculateTotalExp(hpVal, mpVal)
    return calculateDansu(totalExp)
  }, [hpVal, mpVal])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">현재 스탯</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatInputGroup
              label="HP"
              value={hp}
              onChange={setHp}
              colorClass="text-warrior"
              showQuickButtons
            />
            <StatInputGroup
              label="MP"
              value={mp}
              onChange={setMp}
              colorClass="text-mage"
              showQuickButtons
            />
          </div>
          <DansuDisplay result={dansu} />
        </CardContent>
      </Card>

      {result && (
        <ResultCard title="풀경험치 라르 계산">
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
      )}
    </div>
  )
}
