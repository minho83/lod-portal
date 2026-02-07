import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { RotateCcw } from "lucide-react"
import {
  formatExp,
  formatCash,
  formatCurrency,
  RAR_GOLD_PRICE,
  type DansuResult,
} from "@/lib/calculator"
import { QUICK_BUTTONS, type CalcSettings } from "@/components/game/calculator/types"

// ── Shared Sub-Components ──

export function ProgressBar({
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

export function StatInputGroup({
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

export function DansuDisplay({ result }: { result: DansuResult }) {
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

export function ResultCard({
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

export function ResultRow({
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
export function CostSummary({
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
