import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, ChevronDown, ChevronRight, Minus, Plus } from "lucide-react"
import type { CalcSettings } from "@/components/game/calculator/types"

export function SettingsPanel({
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
        <CardContent className="border-t pt-3 pb-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {/* 라르 할인율 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-purple-400">할인율</label>
              <div className="flex items-center gap-1">
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
                    className="text-center pr-6 h-8 text-sm"
                    min={0}
                    max={99}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-purple-400">%</span>
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
            </div>

            {/* 어둠돈 환율 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-blue-400">1억 = 현금</label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() =>
                    update("exchangeRate", Math.max(100, settings.exchangeRate - 100))
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
                    className="text-center pr-6 h-8 text-sm"
                    min={100}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400">원</span>
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
            </div>

            {/* 무료 라르 - 매일 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-green-400">무료(일)</label>
              <Input
                type="number"
                value={settings.dailyFreeRar || ""}
                onChange={(e) =>
                  update("dailyFreeRar", Math.max(0, parseInt(e.target.value) || 0))
                }
                className="text-center h-8 text-sm"
                min={0}
                placeholder="0"
              />
            </div>

            {/* 무료 라르 - 주간 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-green-400">무료(주)</label>
              <Input
                type="number"
                value={settings.weeklyFreeRar || ""}
                onChange={(e) =>
                  update("weeklyFreeRar", Math.max(0, parseInt(e.target.value) || 0))
                }
                className="text-center h-8 text-sm"
                min={0}
                placeholder="0"
              />
            </div>

            {/* 목표 기간 */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-green-400">목표(일)</label>
              <Input
                type="number"
                value={settings.targetDays || ""}
                onChange={(e) =>
                  update("targetDays", Math.max(0, parseInt(e.target.value) || 0))
                }
                className="text-center h-8 text-sm"
                min={0}
                placeholder="30"
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
