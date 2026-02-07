import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Calculator,
  Target,
  TrendingUp,
  Gem,
  Minus,
  Plus,
  RotateCcw,
  Info,
} from "lucide-react"
import {
  calculateHpExp,
  calculateMpExp,
  calculateTotalExp,
  calculateDansu,
  formatExp,
  getNecklaceBonus,
  dansuTable,
  type DansuResult,
} from "@/lib/calculator"

// ── Constants ──

const LAR_EXP = 700_000_000
const LAR_PRICE = 700_000

const QUICK_BUTTONS = [
  { label: "+100만", value: 1_000_000 },
  { label: "+10만", value: 100_000 },
  { label: "+1만", value: 10_000 },
  { label: "+천", value: 1_000 },
  { label: "+백", value: 100 },
] as const

// ── Shared sub-components ──

function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number
  className?: string
  barClassName?: string
}) {
  const clamped = Math.min(Math.max(value, 0), 100)
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full bg-primary transition-all duration-300", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

function StatInputGroup({
  label,
  value,
  onChange,
  colorClass,
  showQuickButtons = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  colorClass: string
  showQuickButtons?: boolean
}) {
  const numValue = parseInt(value) || 0

  const handleQuickAdd = useCallback(
    (amount: number) => {
      onChange(String(numValue + amount))
    },
    [numValue, onChange],
  )

  const handleReset = useCallback(() => {
    onChange("0")
  }, [onChange])

  return (
    <div className="space-y-2">
      <label className={cn("text-sm font-medium", colorClass)}>{label}</label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        min={0}
      />
      {showQuickButtons && (
        <div className="flex flex-wrap gap-1">
          {QUICK_BUTTONS.map((btn) => (
            <Button
              key={btn.label}
              variant="outline"
              size="xs"
              onClick={() => handleQuickAdd(btn.value)}
            >
              {btn.label}
            </Button>
          ))}
          <Button variant="ghost" size="xs" onClick={handleReset}>
            <RotateCcw className="h-3 w-3" />
            초기화
          </Button>
        </div>
      )}
    </div>
  )
}

function NecklaceStepper({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const bonus = getNecklaceBonus(value)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        목걸이 레벨
      </label>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value <= 0}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="min-w-8 text-center text-sm font-semibold">{value}</span>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => onChange(Math.min(30, value + 1))}
          disabled={value >= 30}
        >
          <Plus className="h-3 w-3" />
        </Button>
        {value > 0 && (
          <Badge variant="secondary" className="text-xs">
            +{(bonus * 100).toFixed(0)}% 보너스
          </Badge>
        )}
      </div>
    </div>
  )
}

function DansuDisplay({ result }: { result: DansuResult }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">현재 단수</span>
        <span className="text-lg font-bold text-primary">{result.dansu}단</span>
      </div>
      <ProgressBar value={result.progress} />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{result.progress.toFixed(1)}%</span>
        {result.nextExp !== null && (
          <span>다음 단수까지: {formatExp(result.nextExp - result.currentExp)}</span>
        )}
      </div>
    </div>
  )
}

function ResultCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  )
}

function ResultRow({
  label,
  value,
  valueClass,
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold", valueClass)}>{value}</span>
    </div>
  )
}

// ── Utility: calculate Lar needed for given exp ──

function calcLarCount(expNeeded: number, necklaceLevel: number): number {
  if (expNeeded <= 0) return 0
  const bonus = getNecklaceBonus(necklaceLevel)
  const effectivePerLar = LAR_EXP * (1 + bonus)
  return Math.ceil(expNeeded / effectivePerLar)
}

// ── Mode 1: 필요 라르는? ──

function RequiredMode() {
  const [currentHp, setCurrentHp] = useState("0")
  const [currentMp, setCurrentMp] = useState("0")
  const [targetHp, setTargetHp] = useState("0")
  const [targetMp, setTargetMp] = useState("0")
  const [necklaceLevel, setNecklaceLevel] = useState(0)

  const curHp = parseInt(currentHp) || 0
  const curMp = parseInt(currentMp) || 0
  const tgtHp = parseInt(targetHp) || 0
  const tgtMp = parseInt(targetMp) || 0

  const result = useMemo(() => {
    const currentExp = calculateTotalExp(curHp, curMp)
    const targetExp = calculateTotalExp(tgtHp, tgtMp)
    const neededExp = Math.max(0, targetExp - currentExp)
    const larCount = calcLarCount(neededExp, necklaceLevel)
    const cost = larCount * LAR_PRICE

    const currentDansu = calculateDansu(currentExp)
    const targetDansu = calculateDansu(targetExp)

    return {
      currentExp,
      targetExp,
      neededExp,
      larCount,
      cost,
      currentDansu,
      targetDansu,
      hpDiff: tgtHp - curHp,
      mpDiff: tgtMp - curMp,
    }
  }, [curHp, curMp, tgtHp, tgtMp, necklaceLevel])

  const hasInput = tgtHp > 0 || tgtMp > 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">현재 스탯</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatInputGroup
              label="HP"
              value={currentHp}
              onChange={setCurrentHp}
              colorClass="text-warrior"
              showQuickButtons
            />
            <StatInputGroup
              label="MP"
              value={currentMp}
              onChange={setCurrentMp}
              colorClass="text-mage"
              showQuickButtons
            />
            <DansuDisplay result={result.currentDansu} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">목표 스탯</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <NecklaceStepper value={necklaceLevel} onChange={setNecklaceLevel} />
          </CardContent>
        </Card>
      </div>

      {hasInput && (
        <ResultCard title="계산 결과">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <ResultRow
                label="HP 변화"
                value={`${curHp.toLocaleString()} → ${tgtHp.toLocaleString()} (+${result.hpDiff.toLocaleString()})`}
                valueClass="text-warrior"
              />
              <ResultRow
                label="MP 변화"
                value={`${curMp.toLocaleString()} → ${tgtMp.toLocaleString()} (+${result.mpDiff.toLocaleString()})`}
                valueClass="text-mage"
              />
              <ResultRow
                label="단수 변화"
                value={`${result.currentDansu.dansu}단 → ${result.targetDansu.dansu}단`}
                valueClass="text-primary"
              />
            </div>
            <div className="space-y-2">
              <ResultRow label="필요 경험치" value={formatExp(result.neededExp)} />
              <ResultRow
                label="필요 라르"
                value={`${result.larCount.toLocaleString()}개`}
                valueClass="text-primary"
              />
              <ResultRow
                label="예상 비용"
                value={`${formatExp(result.cost)} 아데나`}
              />
            </div>
          </div>
          <DansuDisplay result={result.targetDansu} />
        </ResultCard>
      )}
    </div>
  )
}

// ── Mode 2: 목표 단수는? ──

function TargetDansuMode() {
  const [currentHp, setCurrentHp] = useState("0")
  const [currentMp, setCurrentMp] = useState("0")
  const [targetDansu, setTargetDansu] = useState("7")
  const [statChoice, setStatChoice] = useState<"both" | "hp" | "mp">("both")
  const [necklaceLevel, setNecklaceLevel] = useState(0)

  const curHp = parseInt(currentHp) || 0
  const curMp = parseInt(currentMp) || 0
  const tgtDansu = parseInt(targetDansu) || 7

  const result = useMemo(() => {
    const currentExp = calculateTotalExp(curHp, curMp)
    const currentDansuResult = calculateDansu(currentExp)

    const targetEntry = dansuTable.find((e) => e.dansu === tgtDansu)
    if (!targetEntry) return null

    const neededExp = Math.max(0, targetEntry.exp - currentExp)
    const larCount = calcLarCount(neededExp, necklaceLevel)
    const cost = larCount * LAR_PRICE

    return {
      currentExp,
      currentDansu: currentDansuResult,
      targetExp: targetEntry.exp,
      neededExp,
      larCount,
      cost,
    }
  }, [curHp, curMp, tgtDansu, necklaceLevel, statChoice])

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
              value={currentHp}
              onChange={setCurrentHp}
              colorClass="text-warrior"
            />
            <StatInputGroup
              label="MP"
              value={currentMp}
              onChange={setCurrentMp}
              colorClass="text-mage"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              목표 단수
            </label>
            <Select value={targetDansu} onValueChange={setTargetDansu}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="목표 단수 선택" />
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
            <label className="text-sm font-medium text-muted-foreground">
              스탯 선택
            </label>
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

          <NecklaceStepper value={necklaceLevel} onChange={setNecklaceLevel} />
        </CardContent>
      </Card>

      {result && (
        <ResultCard title="계산 결과">
          <ResultRow
            label="현재 단수"
            value={`${result.currentDansu.dansu}단`}
            valueClass="text-muted-foreground"
          />
          <ResultRow
            label="목표 단수"
            value={`${tgtDansu}단`}
            valueClass="text-primary"
          />
          <ResultRow label="현재 경험치" value={formatExp(result.currentExp)} />
          <ResultRow label="목표 경험치" value={formatExp(result.targetExp)} />
          <ResultRow label="필요 경험치" value={formatExp(result.neededExp)} />
          <ResultRow
            label="필요 라르"
            value={`${result.larCount.toLocaleString()}개`}
            valueClass="text-primary"
          />
          <ResultRow
            label="예상 비용"
            value={`${formatExp(result.cost)} 아데나`}
          />
        </ResultCard>
      )}
    </div>
  )
}

// ── Mode 3: 올릴 수 있는 수치는? ──

function RaiseMode() {
  const [currentHp, setCurrentHp] = useState("0")
  const [currentMp, setCurrentMp] = useState("0")
  const [larCount, setLarCount] = useState("0")
  const [statChoice, setStatChoice] = useState<"hp" | "mp">("hp")
  const [necklaceLevel, setNecklaceLevel] = useState(0)

  const curHp = parseInt(currentHp) || 0
  const curMp = parseInt(currentMp) || 0
  const lars = parseInt(larCount) || 0

  const result = useMemo(() => {
    if (lars <= 0) return null

    const bonus = getNecklaceBonus(necklaceLevel)
    const totalExpGain = lars * LAR_EXP * (1 + bonus)

    const currentTotalExp = calculateTotalExp(curHp, curMp)
    const currentDansu = calculateDansu(currentTotalExp)

    // Simulate stat increase by binary-searching for the max stat achievable
    let lo = 0
    let hi = 100_000_000

    if (statChoice === "hp") {
      // Find max HP we can reach from curHp with totalExpGain
      while (lo < hi) {
        const mid = Math.floor((lo + hi + 1) / 2)
        const targetHp = curHp + mid
        const expNeeded = calculateHpExp(targetHp) - calculateHpExp(curHp)
        if (expNeeded <= totalExpGain) {
          lo = mid
        } else {
          hi = mid - 1
        }
      }
      const finalHp = curHp + lo
      const afterTotalExp = calculateTotalExp(finalHp, curMp)
      const afterDansu = calculateDansu(afterTotalExp)

      return {
        statGain: lo,
        statLabel: "HP",
        finalStat: finalHp,
        currentDansu,
        afterDansu,
        totalExpGain,
        colorClass: "text-warrior" as const,
      }
    } else {
      while (lo < hi) {
        const mid = Math.floor((lo + hi + 1) / 2)
        const targetMp = curMp + mid
        const expNeeded = calculateMpExp(targetMp) - calculateMpExp(curMp)
        if (expNeeded <= totalExpGain) {
          lo = mid
        } else {
          hi = mid - 1
        }
      }
      const finalMp = curMp + lo
      const afterTotalExp = calculateTotalExp(curHp, finalMp)
      const afterDansu = calculateDansu(afterTotalExp)

      return {
        statGain: lo,
        statLabel: "MP",
        finalStat: finalMp,
        currentDansu,
        afterDansu,
        totalExpGain,
        colorClass: "text-mage" as const,
      }
    }
  }, [curHp, curMp, lars, statChoice, necklaceLevel])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">현재 스탯 &amp; 라르 수량</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatInputGroup
              label="HP"
              value={currentHp}
              onChange={setCurrentHp}
              colorClass="text-warrior"
            />
            <StatInputGroup
              label="MP"
              value={currentMp}
              onChange={setCurrentMp}
              colorClass="text-mage"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              라르 개수
            </label>
            <Input
              type="number"
              value={larCount}
              onChange={(e) => setLarCount(e.target.value)}
              placeholder="0"
              min={0}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              올릴 스탯
            </label>
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

          <NecklaceStepper value={necklaceLevel} onChange={setNecklaceLevel} />
        </CardContent>
      </Card>

      {result && (
        <ResultCard title="계산 결과">
          <ResultRow
            label="투입 경험치"
            value={formatExp(result.totalExpGain)}
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

// ── Mode 4: 풀경험치 라르 ──

function FullExpMode() {
  const [hp, setHp] = useState("0")
  const [mp, setMp] = useState("0")

  const hpVal = parseInt(hp) || 0
  const mpVal = parseInt(mp) || 0

  const result = useMemo(() => {
    const hpExp = calculateHpExp(hpVal)
    const mpExp = calculateMpExp(mpVal)
    const totalExp = hpExp + mpExp
    const dansu = calculateDansu(totalExp)

    return { hpExp, mpExp, totalExp, dansu }
  }, [hpVal, mpVal])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">스탯 입력</CardTitle>
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
        </CardContent>
      </Card>

      <ResultCard title="경험치 정보">
        <ResultRow
          label="HP 경험치"
          value={formatExp(result.hpExp)}
          valueClass="text-warrior"
        />
        <ResultRow
          label="MP 경험치"
          value={formatExp(result.mpExp)}
          valueClass="text-mage"
        />
        <ResultRow
          label="총 경험치"
          value={formatExp(result.totalExp)}
          valueClass="text-primary"
        />
        <DansuDisplay result={result.dansu} />
      </ResultCard>
    </div>
  )
}

// ── Main Page ──

export function CalculatorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">라르 계산기</h2>
      </div>

      <Card className="border-muted">
        <CardContent className="flex items-start gap-2 py-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            라르 1개 = 경험치 7억 기준으로 계산합니다. 목걸이 보너스를 설정하면
            추가 경험치가 반영됩니다.
          </span>
        </CardContent>
      </Card>

      <Tabs defaultValue="required">
        <TabsList className="w-full">
          <TabsTrigger value="required" className="flex-1 gap-1">
            <Target className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">필요 라르는?</span>
            <span className="sm:hidden">필요</span>
          </TabsTrigger>
          <TabsTrigger value="target" className="flex-1 gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">목표 단수는?</span>
            <span className="sm:hidden">단수</span>
          </TabsTrigger>
          <TabsTrigger value="raise" className="flex-1 gap-1">
            <Gem className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">올릴 수 있는 수치는?</span>
            <span className="sm:hidden">수치</span>
          </TabsTrigger>
          <TabsTrigger value="fullexp" className="flex-1 gap-1">
            <Calculator className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">풀경험치 라르</span>
            <span className="sm:hidden">풀경</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="required">
          <RequiredMode />
        </TabsContent>
        <TabsContent value="target">
          <TargetDansuMode />
        </TabsContent>
        <TabsContent value="raise">
          <RaiseMode />
        </TabsContent>
        <TabsContent value="fullexp">
          <FullExpMode />
        </TabsContent>
      </Tabs>
    </div>
  )
}
