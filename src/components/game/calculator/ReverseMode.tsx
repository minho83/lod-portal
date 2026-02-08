import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  calculateTotalExp,
  calculateDansu,
  calculateReverseRar,
  hpRarTiers,
  mpRarTiers,
} from "@/lib/calculator"
import type { CalcSettings } from "@/components/game/calculator/types"
import {
  DansuDisplay,
  ResultCard,
  ResultRow,
} from "@/components/game/calculator/shared"

export function ReverseMode({
  settings,
  currentHp,
  currentMp,
}: {
  settings: CalcSettings
  currentHp: string
  currentMp: string
}) {
  const [larCount, setLarCount] = useState("0")
  const [statChoice, setStatChoice] = useState<"hp" | "mp">("hp")

  const curHp = parseInt(currentHp) || 0
  const curMp = parseInt(currentMp) || 0
  const lars = parseInt(larCount) || 0

  const result = useMemo(() => {
    if (lars <= 0) return null

    const currentTotalExp = calculateTotalExp(curHp, curMp)
    const currentDansu = calculateDansu(currentTotalExp)

    if (statChoice === "hp") {
      const rev = calculateReverseRar(curHp, lars, hpRarTiers, settings.discountRate)
      const afterTotalExp = calculateTotalExp(rev.finalValue, curMp)
      const afterDansu = calculateDansu(afterTotalExp)
      return {
        statLabel: "HP",
        statGain: rev.totalGain,
        finalStat: rev.finalValue,
        currentDansu,
        afterDansu,
        usedRar: lars - rev.remainingRar,
        colorClass: "text-warrior" as const,
      }
    } else {
      const rev = calculateReverseRar(curMp, lars, mpRarTiers, settings.discountRate)
      const afterTotalExp = calculateTotalExp(curHp, rev.finalValue)
      const afterDansu = calculateDansu(afterTotalExp)
      return {
        statLabel: "MP",
        statGain: rev.totalGain,
        finalStat: rev.finalValue,
        currentDansu,
        afterDansu,
        usedRar: lars - rev.remainingRar,
        colorClass: "text-mage" as const,
      }
    }
  }, [curHp, curMp, lars, statChoice, settings.discountRate])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">보유 라르 &amp; 올릴 스탯</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">보유 라르</label>
            <Input
              type="number"
              value={larCount}
              onChange={(e) => setLarCount(e.target.value)}
              placeholder="0"
              min={0}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">올릴 스탯</label>
            <div className="flex gap-2">
              <Button
                variant={statChoice === "hp" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatChoice("hp")}
              >
                <span className="text-warrior">HP</span>
              </Button>
              <Button
                variant={statChoice === "mp" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatChoice("mp")}
              >
                <span className="text-mage">MP</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <ResultCard title="계산 결과">
          <ResultRow
            label="사용 라르"
            value={`${result.usedRar.toLocaleString()}개`}
          />
          <ResultRow
            label={`${result.statLabel} 상승량`}
            value={`+${result.statGain.toLocaleString()}`}
            valueClass={result.colorClass}
          />
          <ResultRow
            label={`최종 ${result.statLabel}`}
            value={result.finalStat.toLocaleString()}
            valueClass={result.colorClass}
          />
          <ResultRow
            label="단수 변화"
            value={`${result.currentDansu.dansu}단 → ${result.afterDansu.dansu}단`}
            valueClass="text-primary"
          />
          <DansuDisplay result={result.afterDansu} />
        </ResultCard>
      )}
    </div>
  )
}
