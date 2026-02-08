import { useState, useCallback, useEffect, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Calculator, Target, TrendingUp, Gem, Battery, InfoIcon, User, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/components/game/calculator/types"
import type { CalcSettings } from "@/components/game/calculator/types"
import { SettingsPanel } from "@/components/game/calculator/SettingsPanel"
import { StatInputGroup, DansuDisplay } from "@/components/game/calculator/shared"
import { calculateTotalExp, calculateDansu, formatExp, dansuTable } from "@/lib/calculator"
import { RequiredMode } from "@/components/game/calculator/RequiredMode"
import { TargetDansuMode } from "@/components/game/calculator/TargetDansuMode"
import { ReverseMode } from "@/components/game/calculator/ReverseMode"
import { FullExpMode } from "@/components/game/calculator/FullExpMode"

export function CalculatorPage() {
  const [settings, setSettings] = useState<CalcSettings>(DEFAULT_SETTINGS)
  const [currentHp, setCurrentHp] = useState("0")
  const [currentMp, setCurrentMp] = useState("0")
  const [isGuideOpen, setIsGuideOpen] = useState(true)

  // localStorage에서 설정 로드
  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  // 설정 변경 시 저장
  const handleSettingsChange = useCallback((newSettings: CalcSettings) => {
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [])

  // 현재 단수 및 최대 보유 경험치 계산
  const dansuInfo = useMemo(() => {
    const hp = parseInt(currentHp) || 0
    const mp = parseInt(currentMp) || 0
    const totalExp = calculateTotalExp(hp, mp)
    const dansuResult = calculateDansu(totalExp)
    const dansuEntry = dansuTable.find((e) => e.dansu === dansuResult.dansu)
    const maxExp = dansuEntry ? dansuEntry.exp : 0
    return { dansuResult, maxExp }
  }, [currentHp, currentMp])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">라르 계산기</h2>
      </div>

      <SettingsPanel settings={settings} onChange={handleSettingsChange} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>💡 TIP:</strong> 아래에 <strong className="text-primary">현재 순수 스탯(아이템 제외)</strong>을 먼저 입력하세요.
            입력한 값은 모든 탭에서 공유되며, 값을 입력하면 자동으로 계산됩니다.
          </AlertDescription>
        </Alert>

        <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
          <Card className="border-primary/20 bg-primary/5">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between px-4 py-3 h-auto hover:bg-transparent"
              >
                <span className="font-medium text-foreground text-sm">📌 각 탭 기능 안내</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isGuideOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 pb-4">
                <ul className="space-y-1.5 text-muted-foreground ml-4 text-sm">
                  <li>
                    • <span className="text-primary font-medium">필요 라르는?</span><br />
                    <span className="text-xs ml-2">현재 순수 HP/MP → 목표 순수 HP/MP까지 필요한 라르 개수와 비용 계산</span>
                  </li>
                  <li>
                    • <span className="text-primary font-medium">목표 단수는?</span><br />
                    <span className="text-xs ml-2">현재 순수 HP/MP에서 목표 단수에 도달하기 위해 필요한 라르 개수 계산</span>
                  </li>
                  <li>
                    • <span className="text-primary font-medium">올릴 수 있는 수치는?</span><br />
                    <span className="text-xs ml-2">현재 순수 HP/MP + 보유 라르로 올릴 수 있는 HP/MP 계산 (에테르 강화 목걸이 추가 데미지 포함)</span>
                  </li>
                  <li>
                    • <span className="text-primary font-medium">풀경험치 라르</span><br />
                    <span className="text-xs ml-2">현재 HP/MP 기준으로 EXP 100% 채웠을 때 획득 가능한 라르 개수 계산</span>
                  </li>
                </ul>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      <Card className="border-primary/20 bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            현재 순수 스탯 (아이템 제외)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <StatInputGroup
                label="현재 HP"
                value={currentHp}
                onChange={setCurrentHp}
                colorClass="text-warrior"
                showQuickButtons
              />
            </div>
            <div className="space-y-4">
              <StatInputGroup
                label="현재 MP"
                value={currentMp}
                onChange={setCurrentMp}
                colorClass="text-mage"
                showQuickButtons
              />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <DansuDisplay result={dansuInfo.dansuResult} />
            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <span className="text-sm font-medium text-muted-foreground">최대 보유 경험치</span>
              <span className="text-sm font-bold text-primary">{formatExp(dansuInfo.maxExp)}</span>
            </div>
          </div>
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
          <RequiredMode
            settings={settings}
            currentHp={currentHp}
            currentMp={currentMp}
          />
        </TabsContent>
        <TabsContent value="target">
          <TargetDansuMode
            settings={settings}
            currentHp={currentHp}
            currentMp={currentMp}
          />
        </TabsContent>
        <TabsContent value="reverse">
          <ReverseMode
            settings={settings}
            currentHp={currentHp}
            currentMp={currentMp}
          />
        </TabsContent>
        <TabsContent value="fullexp">
          <FullExpMode
            settings={settings}
            currentHp={currentHp}
            currentMp={currentMp}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
