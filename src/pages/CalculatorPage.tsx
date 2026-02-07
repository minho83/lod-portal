import { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Calculator,
  Target,
  TrendingUp,
  Gem,
  Minus,
  Plus,
  RotateCcw,
  Settings,
  ChevronDown,
  ChevronRight,
  Battery,
} from "lucide-react"
import {
  calculateHpExp,
  calculateMpExp,
  calculateTotalExp,
  calculateDansu,
  formatExp,
  formatCash,
  formatCurrency,
  dansuTable,
  hpRarTiers,
  mpRarTiers,
  calculateTierRar,
  calculateReverseRar,
  calculateFullExpRar,
  RAR_GOLD_PRICE,
  type DansuResult,
} from "@/lib/calculator"

// ── Types & Constants ──

interface CalcSettings {
  discountRate: number
  exchangeRate: number
  dailyFreeRar: number
  weeklyFreeRar: number
  targetDays: number
}

const DEFAULT_SETTINGS: CalcSettings = {
  discountRate: 0,
  exchangeRate: 6000,
  dailyFreeRar: 0,
  weeklyFreeRar: 0,
  targetDays: 0,
}

const STORAGE_KEY = "lodCalcSettings"

const QUICK_BUTTONS = [
  { label: "+100만", value: 1_000_000 },
  { label: "+10만", value: 100_000 },
  { label: "+1만", value: 10_000 },
  { label: "+천", value: 1_000 },
  { label: "+백", value: 100 },
] as const

// ── Settings Persistence ──

function loadSettings(): CalcSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_SETTINGS
    const s = JSON.parse(saved)
    return {
      discountRate: Math.max(0, Math.min(99, Number(s.discountRate) || 0)),
      exchangeRate: Math.max(100, Number(String(s.exchangeRate).replace(/,/g, "")) || 6000),
      dailyFreeRar: Math.max(0, Number(String(s.dailyFreeRar).replace(/,/g, "")) || 0),
      weeklyFreeRar: Math.max(0, Number(String(s.weeklyFreeRar).replace(/,/g, "")) || 0),
      targetDays: Math.max(0, Number(String(s.targetDays).replace(/,/g, "")) || 0),
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: CalcSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// ── Shared Sub-Components ──

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
              onClick={() => onChange(String(numValue + btn.value))}
            >
              {btn.label}
            </Button>
          ))}
          <Button variant="ghost" size="xs" onClick={() => onChange("0")}>
            <RotateCcw className="h-3 w-3" />
            초기화
          </Button>
        </div>
      )}
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

/** 라르 비용 요약 (총 라르, 골드, 현금, 무료라르 기간) */
function CostSummary({
  totalRar,
  settings,
}: {
  totalRar: number
  settings: CalcSettings
}) {
  if (totalRar <= 0) return null

  const totalGold = totalRar * RAR_GOLD_PRICE
  const totalCash = (totalGold / 100_000_000) * settings.exchangeRate

  const weeklyFreeTotal = settings.dailyFreeRar * 7 + settings.weeklyFreeRar
  const weeksNeeded = weeklyFreeTotal > 0 ? Math.ceil(totalRar / weeklyFreeTotal) : null

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <div className="text-lg font-bold text-primary">{totalRar.toLocaleString()}개</div>
          <div className="text-xs text-muted-foreground">필요 라르</div>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <div className="text-lg font-bold text-blue-400">{formatCurrency(totalGold)}</div>
          <div className="text-xs text-muted-foreground">총 비용 (골드)</div>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3 text-center">
          <div className="text-lg font-bold text-sky-400">{formatCash(totalCash)}</div>
          <div className="text-xs text-muted-foreground">예상 현금</div>
        </div>
      </div>
      {weeksNeeded !== null && (
        <div className="text-center">
          <Badge variant="secondary" className="text-xs">
            무료 라르만으로 약 {weeksNeeded}주 ({weeksNeeded * 7}일) 소요
          </Badge>
        </div>
      )}
    </div>
  )
}

// ── Settings Panel ──

function SettingsPanel({
  settings,
  onChange,
}: {
  settings: CalcSettings
  onChange: (s: CalcSettings) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const update = useCallback(
    (key: keyof CalcSettings, value: number) => {
      onChange({ ...settings, [key]: value })
    },
    [settings, onChange],
  )

  return (
    <Card>
      <button
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Settings className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">계산 설정</div>
          <div className="text-xs text-muted-foreground truncate">
            할인{" "}
            <span className="text-purple-400">{settings.discountRate}%</span>
            {" · "}시세{" "}
            <span className="text-blue-400">
              {settings.exchangeRate.toLocaleString()}원
            </span>
            {" · "}무료라르{" "}
            <span className="text-green-400">
              일{settings.dailyFreeRar}/주{settings.weeklyFreeRar}
            </span>
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {isOpen && (
        <CardContent className="space-y-4 border-t pt-4">
          {/* 라르 할인율 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-purple-400">
              라르 할인율
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() =>
                  update("discountRate", Math.max(0, settings.discountRate - 10))
                }
                disabled={settings.discountRate <= 0}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={settings.discountRate}
                  onChange={(e) =>
                    update(
                      "discountRate",
                      Math.max(0, Math.min(99, parseInt(e.target.value) || 0)),
                    )
                  }
                  className="text-center pr-8"
                  min={0}
                  max={99}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-purple-400">
                  %
                </span>
              </div>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() =>
                  update("discountRate", Math.min(99, settings.discountRate + 10))
                }
                disabled={settings.discountRate >= 99}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              10% 단위 조절 (0~99%)
            </p>
          </div>

          {/* 어둠돈 환율 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-400">
              어둠돈 1억 = 현금
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() =>
                  update(
                    "exchangeRate",
                    Math.max(100, settings.exchangeRate - 100),
                  )
                }
                disabled={settings.exchangeRate <= 100}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <div className="relative flex-1">
                <Input
                  type="number"
                  value={settings.exchangeRate}
                  onChange={(e) =>
                    update(
                      "exchangeRate",
                      Math.max(100, parseInt(e.target.value) || 6000),
                    )
                  }
                  className="text-center pr-8"
                  min={100}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-400">
                  원
                </span>
              </div>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={() =>
                  update("exchangeRate", settings.exchangeRate + 100)
                }
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              100원 단위 조절
            </p>
          </div>

          {/* 무료 라르 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-green-400">
              무료 라르 (목표 기간 계산)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">매일</span>
                <Input
                  type="number"
                  value={settings.dailyFreeRar || ""}
                  onChange={(e) =>
                    update(
                      "dailyFreeRar",
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                  className="text-center"
                  min={0}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">주간</span>
                <Input
                  type="number"
                  value={settings.weeklyFreeRar || ""}
                  onChange={(e) =>
                    update(
                      "weeklyFreeRar",
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                  className="text-center"
                  min={0}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">목표(일)</span>
                <Input
                  type="number"
                  value={settings.targetDays || ""}
                  onChange={(e) =>
                    update(
                      "targetDays",
                      Math.max(0, parseInt(e.target.value) || 0),
                    )
                  }
                  className="text-center"
                  min={0}
                  placeholder="30"
                />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ── Mode 1: 필요 라르는? ──

function RequiredMode({ settings }: { settings: CalcSettings }) {
  const [currentHp, setCurrentHp] = useState("0")
  const [currentMp, setCurrentMp] = useState("0")
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
          </CardContent>
        </Card>
      </div>

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

// ── Mode 2: 목표 단수는? ──

function TargetDansuMode({ settings }: { settings: CalcSettings }) {
  const [currentHp, setCurrentHp] = useState("0")
  const [currentMp, setCurrentMp] = useState("0")
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
      // HP만으로 목표 달성: binary search
      const neededHpExp = targetEntry.exp - calculateMpExp(curMp)
      let lo = curHp
      let hi = 10_000_000
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2)
        if (calculateHpExp(mid) < neededHpExp) lo = mid + 1
        else hi = mid
      }
      targetHp = lo
    } else if (statChoice === "mp") {
      // MP만으로 목표 달성: binary search
      const neededMpExp = targetEntry.exp - calculateHpExp(curHp)
      let lo = curMp
      let hi = 10_000_000
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2)
        if (calculateMpExp(mid) < neededMpExp) lo = mid + 1
        else hi = mid
      }
      targetMp = lo
    } else {
      // 둘 다: 동일 수치 증가로 목표 달성
      let lo = 0
      let hi = 10_000_000
      while (lo < hi) {
        const mid = Math.floor((lo + hi) / 2)
        if (calculateTotalExp(curHp + mid, curMp + mid) < targetEntry.exp) lo = mid + 1
        else hi = mid
      }
      targetHp = curHp + lo
      targetMp = curMp + lo
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
          <CardTitle className="text-sm">현재 스탯 &amp; 목표</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatInputGroup label="HP" value={currentHp} onChange={setCurrentHp} colorClass="text-warrior" />
            <StatInputGroup label="MP" value={currentMp} onChange={setCurrentMp} colorClass="text-mage" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">목표 단수</label>
            <select
              value={targetDansu}
              onChange={(e) => setTargetDansu(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {dansuTable.map((entry) => (
                <option key={entry.dansu} value={String(entry.dansu)}>
                  {entry.dansu}단 ({formatExp(entry.exp)})
                </option>
              ))}
            </select>
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

// ── Mode 3: 올릴 수 있는 수치는? ──

function ReverseMode({ settings }: { settings: CalcSettings }) {
  const [currentHp, setCurrentHp] = useState("0")
  const [currentMp, setCurrentMp] = useState("0")
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
          <CardTitle className="text-sm">현재 스탯 &amp; 보유 라르</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatInputGroup label="HP" value={currentHp} onChange={setCurrentHp} colorClass="text-warrior" />
            <StatInputGroup label="MP" value={currentMp} onChange={setCurrentMp} colorClass="text-mage" />
          </div>

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

// ── Mode 4: 풀경험치 라르 ──

function FullExpMode({ settings }: { settings: CalcSettings }) {
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

// ── Main Page ──

export function CalculatorPage() {
  const [settings, setSettings] = useState<CalcSettings>(DEFAULT_SETTINGS)

  // localStorage에서 설정 로드
  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  // 설정 변경 시 저장
  const handleSettingsChange = useCallback((newSettings: CalcSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">라르 계산기</h2>
      </div>

      <SettingsPanel settings={settings} onChange={handleSettingsChange} />

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
          <TabsTrigger value="reverse" className="flex-1 gap-1">
            <Gem className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">올릴 수 있는 수치는?</span>
            <span className="sm:hidden">수치</span>
          </TabsTrigger>
          <TabsTrigger value="fullexp" className="flex-1 gap-1">
            <Battery className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">풀경험치 라르</span>
            <span className="sm:hidden">풀경</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="required">
          <RequiredMode settings={settings} />
        </TabsContent>
        <TabsContent value="target">
          <TargetDansuMode settings={settings} />
        </TabsContent>
        <TabsContent value="reverse">
          <ReverseMode settings={settings} />
        </TabsContent>
        <TabsContent value="fullexp">
          <FullExpMode settings={settings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
