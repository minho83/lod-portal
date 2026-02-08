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
          <strong>사용 방법:</strong> 아래 탭에서 원하는 계산 방식을 선택하고 값을 입력하면 자동으로 결과가 표시됩니다.
          값을 입력하면 즉시 필요한 라르 개수, 비용, 단수 변화를 확인할 수 있습니다.
        </AlertDescription>
      </Alert>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">📌 각 탭 기능 안내</p>
            <ul className="space-y-1 text-muted-foreground ml-4">
              <li>• <span className="text-primary font-medium">필요 라르는?</span> - 현재 스탯에서 목표 스탯까지 필요한 라르 계산</li>
              <li>• <span className="text-primary font-medium">목표 단수는?</span> - 특정 단수에 도달하기 위한 라르 계산</li>
              <li>• <span className="text-primary font-medium">올릴 수 있는 수치는?</span> - 보유한 라르로 올릴 수 있는 HP/MP 계산</li>
              <li>• <span className="text-primary font-medium">풀경험치 라르</span> - 경험치 100%를 라르로 전환 시 획득 가능한 개수 계산</li>
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
