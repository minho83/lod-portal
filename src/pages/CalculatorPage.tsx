import { useState, useCallback, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Calculator, Target, TrendingUp, Gem, Battery } from "lucide-react"
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/components/game/calculator/types"
import type { CalcSettings } from "@/components/game/calculator/types"
import { SettingsPanel } from "@/components/game/calculator/SettingsPanel"
import { CurrentSpecGuide } from "@/components/game/calculator/CurrentSpecGuide"
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

      <CurrentSpecGuide settings={settings} />

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
