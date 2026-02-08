import { useState, useCallback, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Calculator, Target, TrendingUp, Gem, Battery, InfoIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/components/game/calculator/types"
import type { CalcSettings } from "@/components/game/calculator/types"
import { SettingsPanel } from "@/components/game/calculator/SettingsPanel"
import { RequiredMode } from "@/components/game/calculator/RequiredMode"
import { TargetDansuMode } from "@/components/game/calculator/TargetDansuMode"
import { ReverseMode } from "@/components/game/calculator/ReverseMode"
import { FullExpMode } from "@/components/game/calculator/FullExpMode"

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

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>💡 TIP:</strong> 모든 HP/MP는 <strong className="text-primary">순수 스탯(아이템 제외)</strong>을 입력하세요.
          값을 입력하면 자동으로 필요한 라르, 비용, 단수 변화가 계산됩니다.
        </AlertDescription>
      </Alert>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">📌 각 탭 기능 안내</p>
            <ul className="space-y-1.5 text-muted-foreground ml-4">
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
