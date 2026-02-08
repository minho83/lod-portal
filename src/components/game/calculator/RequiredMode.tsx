import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  calculateTotalExp,
  calculateDansu,
  calculateTierRar,
  hpRarTiers,
  mpRarTiers,
} from "@/lib/calculator"
import type { CalcSettings } from "@/components/game/calculator/types"
import {
  StatInputGroup,
  ResultCard,
  ResultRow,
  CostSummary,
} from "@/components/game/calculator/shared"

export function RequiredMode({
  settings,
  currentHp,
  currentMp,
}: {
  settings: CalcSettings
  currentHp: string
  currentMp: string
}) {
  const [targetHp, setTargetHp] = useState("0")
  const [targetMp, setTargetMp] = useState("0")

  const curHp = parseInt(currentHp) || 0
  const curMp = parseInt(currentMp) || 0
  const tgtHp = parseInt(targetHp) || 0
  const tgtMp = parseInt(targetMp) || 0

  const result = useMemo(() => {
    const hpRar = calculateTierRar(curHp, tgtHp, hpRarTiers, settings.discountRate)
    const mpRar = calculateTierRar(curMp, tgtMp, mpRarTiers, settings.discountRate)
    const totalRar = hpRar.totalRar + mpRar.totalRar

    const currentExp = calculateTotalExp(curHp, curMp)
    const targetExp = calculateTotalExp(tgtHp, tgtMp)
    const currentDansu = calculateDansu(currentExp)
    const targetDansu = calculateDansu(targetExp)

    return { hpRar, mpRar, totalRar, currentDansu, targetDansu }
  }, [curHp, curMp, tgtHp, tgtMp, settings.discountRate])

  const hasInput = tgtHp > curHp || tgtMp > curMp

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">목표 스탯</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <StatInputGroup
              label="목표 HP"
              value={targetHp}
              onChange={setTargetHp}
              colorClass="text-warrior"
              showQuickButtons
            />
            <StatInputGroup
              label="목표 MP"
              value={targetMp}
              onChange={setTargetMp}
              colorClass="text-mage"
              showQuickButtons
            />
          </div>
        </CardContent>
      </Card>

      {hasInput && (
        <ResultCard title="계산 결과">
          <CostSummary totalRar={result.totalRar} settings={settings} />
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <ResultRow
                label="HP 라르"
                value={`${result.hpRar.totalRar.toLocaleString()}개`}
                valueClass="text-warrior"
              />
              <ResultRow
                label="MP 라르"
                value={`${result.mpRar.totalRar.toLocaleString()}개`}
                valueClass="text-mage"
              />
            </div>
            <div className="space-y-2">
              <ResultRow
                label="HP"
                value={`${curHp.toLocaleString()} → ${tgtHp.toLocaleString()}`}
                valueClass="text-warrior"
              />
              <ResultRow
                label="MP"
                value={`${curMp.toLocaleString()} → ${tgtMp.toLocaleString()}`}
                valueClass="text-mage"
              />
              <ResultRow
                label="단수"
                value={`${result.currentDansu.dansu}단 → ${result.targetDansu.dansu}단`}
                valueClass="text-primary"
              />
            </div>
          </div>
        </ResultCard>
      )}
    </div>
  )
}
