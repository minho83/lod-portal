import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  calculateHpExp,
  calculateMpExp,
  calculateTotalExp,
  calculateDansu,
  calculateTierRar,
  formatExp,
  dansuTable,
  hpRarTiers,
  mpRarTiers,
  findMinStatForExp,
} from "@/lib/calculator"
import type { CalcSettings } from "@/components/game/calculator/types"
import {
  ResultCard,
  ResultRow,
  CostSummary,
} from "@/components/game/calculator/shared"

export function TargetDansuMode({
  settings,
  currentHp,
  currentMp,
}: {
  settings: CalcSettings
  currentHp: string
  currentMp: string
}) {
  const [targetDansu, setTargetDansu] = useState("7")
  const [statChoice, setStatChoice] = useState<"both" | "hp" | "mp">("both")

  const curHp = parseInt(currentHp) || 0
  const curMp = parseInt(currentMp) || 0
  const tgtDansu = parseInt(targetDansu) || 7

  const result = useMemo(() => {
    const targetEntry = dansuTable.find((e) => e.dansu === tgtDansu)
    if (!targetEntry) return null

    const currentExp = calculateTotalExp(curHp, curMp)
    const currentDansuResult = calculateDansu(currentExp)
    const neededExp = Math.max(0, targetEntry.exp - currentExp)
    if (neededExp <= 0) return { currentDansu: currentDansuResult, neededExp: 0, totalRar: 0, targetHp: curHp, targetMp: curMp }

    let targetHp = curHp
    let targetMp = curMp

    if (statChoice === "hp") {
      const neededHpExp = targetEntry.exp - calculateMpExp(curMp)
      targetHp = findMinStatForExp(curHp, calculateHpExp, neededHpExp)
    } else if (statChoice === "mp") {
      const neededMpExp = targetEntry.exp - calculateHpExp(curHp)
      targetMp = findMinStatForExp(curMp, calculateMpExp, neededMpExp)
    } else {
      // 둘 다: 동일 수치 증가로 목표 달성
      const addNeeded = findMinStatForExp(
        0,
        (add) => calculateTotalExp(curHp + add, curMp + add),
        targetEntry.exp,
      )
      targetHp = curHp + addNeeded
      targetMp = curMp + addNeeded
    }

    const hpRar = calculateTierRar(curHp, targetHp, hpRarTiers, settings.discountRate)
    const mpRar = calculateTierRar(curMp, targetMp, mpRarTiers, settings.discountRate)
    const totalRar = hpRar.totalRar + mpRar.totalRar

    return { currentDansu: currentDansuResult, neededExp, totalRar, targetHp, targetMp, hpRar: hpRar.totalRar, mpRar: mpRar.totalRar }
  }, [curHp, curMp, tgtDansu, statChoice, settings.discountRate])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">목표 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">목표 단수</label>
            <Select value={targetDansu} onValueChange={setTargetDansu}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dansuTable.map((entry) => (
                  <SelectItem key={entry.dansu} value={String(entry.dansu)}>
                    {entry.dansu}단 ({formatExp(entry.exp)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">올릴 스탯</label>
            <div className="flex gap-2">
              {(
                [
                  { key: "both", label: "HP+MP" },
                  { key: "hp", label: "HP만" },
                  { key: "mp", label: "MP만" },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.key}
                  variant={statChoice === opt.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatChoice(opt.key)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {result && result.totalRar > 0 && (
        <ResultCard title="계산 결과">
          <CostSummary totalRar={result.totalRar} settings={settings} />
          <div className="space-y-2 pt-2">
            <ResultRow
              label="현재 단수"
              value={`${result.currentDansu.dansu}단`}
              valueClass="text-muted-foreground"
            />
            <ResultRow label="목표 단수" value={`${tgtDansu}단`} valueClass="text-primary" />
            <ResultRow
              label="목표 HP"
              value={result.targetHp.toLocaleString()}
              valueClass="text-warrior"
            />
            <ResultRow
              label="목표 MP"
              value={result.targetMp.toLocaleString()}
              valueClass="text-mage"
            />
            {result.hpRar !== undefined && (
              <>
                <ResultRow label="HP 라르" value={`${result.hpRar.toLocaleString()}개`} valueClass="text-warrior" />
                <ResultRow label="MP 라르" value={`${result.mpRar!.toLocaleString()}개`} valueClass="text-mage" />
              </>
            )}
          </div>
        </ResultCard>
      )}

      {result && result.neededExp <= 0 && (curHp > 0 || curMp > 0) && (
        <Card className="border-green-500/30">
          <CardContent className="py-6 text-center">
            <p className="text-sm font-medium text-green-400">이미 목표 단수에 도달했습니다!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
