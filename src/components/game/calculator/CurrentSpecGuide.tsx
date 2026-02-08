import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, Calculator } from "lucide-react"
import type { CalcSettings } from "./types"

interface CurrentSpecGuideProps {
  settings: CalcSettings
}

export function CurrentSpecGuide({ settings }: CurrentSpecGuideProps) {
  const [currentHp, setCurrentHp] = useState("")
  const [currentMp, setCurrentMp] = useState("")
  const [targetHp, setTargetHp] = useState("")
  const [targetMp, setTargetMp] = useState("")

  // 라르당 증가량 (일반적인 기본값)
  const HP_PER_LAR = 10
  const MP_PER_LAR = 5

  // 필요 라르 계산
  const calculateRequiredLar = (current: number, target: number, perLar: number): number => {
    if (!current || !target || target <= current) return 0
    const diff = target - current
    return Math.ceil(diff / perLar)
  }

  const curHp = parseInt(currentHp) || 0
  const curMp = parseInt(currentMp) || 0
  const tarHp = parseInt(targetHp) || 0
  const tarMp = parseInt(targetMp) || 0

  const requiredLarForHp = calculateRequiredLar(curHp, tarHp, HP_PER_LAR)
  const requiredLarForMp = calculateRequiredLar(curMp, tarMp, MP_PER_LAR)

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <InfoIcon className="h-5 w-5 text-primary" />
          현재 스펙으로 필요 라르 계산하기
        </CardTitle>
        <CardDescription>
          캐릭터 정보창에서 현재 체력/마력을 확인하고 입력하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {/* 스텝 1: 캐릭터 정보 확인 방법 */}
          <AccordionItem value="step1">
            <AccordionTrigger className="text-sm font-medium">
              📋 STEP 1. 캐릭터 정보창에서 현재 스펙 확인하기
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="font-medium text-foreground">캐릭터 정보창 여는 방법:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>게임 내에서 <kbd className="px-2 py-1 bg-background rounded text-xs">C</kbd> 키 누르기</li>
                  <li>또는 화면 하단 메뉴에서 "캐릭터 정보" 클릭</li>
                </ul>
              </div>

              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <p className="font-medium text-foreground">확인할 수치:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><span className="text-red-400 font-medium">체력 (HP)</span>: 캐릭터 정보창 상단에 빨간색으로 표시</li>
                  <li><span className="text-blue-400 font-medium">마력 (MP)</span>: 캐릭터 정보창 상단에 파란색으로 표시</li>
                  <li>예시: <span className="text-foreground">체력 1000 / 마력 500</span></li>
                </ul>
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  💡 <strong>TIP:</strong> 장비를 착용한 상태의 총 수치를 확인하세요. 아이템 효과가 모두 포함된 최종 수치입니다.
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>

          {/* 스텝 2: 현재 스펙 입력 */}
          <AccordionItem value="step2">
            <AccordionTrigger className="text-sm font-medium">
              ✏️ STEP 2. 현재/목표 체력/마력 입력하기
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentHp" className="flex items-center gap-2">
                    <span className="text-red-400">❤️</span> 현재 체력 (HP)
                  </Label>
                  <Input
                    id="currentHp"
                    type="number"
                    min={0}
                    value={currentHp}
                    onChange={(e) => setCurrentHp(e.target.value)}
                    placeholder="예: 1000"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetHp" className="flex items-center gap-2">
                    <span className="text-red-400">🎯</span> 목표 체력 (HP)
                  </Label>
                  <Input
                    id="targetHp"
                    type="number"
                    min={0}
                    value={targetHp}
                    onChange={(e) => setTargetHp(e.target.value)}
                    placeholder="예: 1500"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentMp" className="flex items-center gap-2">
                    <span className="text-blue-400">💙</span> 현재 마력 (MP)
                  </Label>
                  <Input
                    id="currentMp"
                    type="number"
                    min={0}
                    value={currentMp}
                    onChange={(e) => setCurrentMp(e.target.value)}
                    placeholder="예: 500"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetMp" className="flex items-center gap-2">
                    <span className="text-blue-400">🎯</span> 목표 마력 (MP)
                  </Label>
                  <Input
                    id="targetMp"
                    type="number"
                    min={0}
                    value={targetMp}
                    onChange={(e) => setTargetMp(e.target.value)}
                    placeholder="예: 700"
                    className="text-lg"
                  />
                </div>
              </div>

              {(curHp > 0 && tarHp > 0) || (curMp > 0 && tarMp > 0) ? (
                <div className="rounded-lg border-2 border-primary bg-primary/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <span className="font-bold text-foreground">계산 결과</span>
                  </div>

                  {curHp > 0 && tarHp > 0 && (
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          체력: <span className="text-red-400 font-medium">{curHp.toLocaleString()}</span> → {" "}
                          <span className="text-primary font-medium">{tarHp.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          필요 수치: {Math.max(0, tarHp - curHp).toLocaleString()} (라르당 +{HP_PER_LAR})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {requiredLarForHp.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">필요 라르</div>
                      </div>
                    </div>
                  )}

                  {curMp > 0 && tarMp > 0 && (
                    <div className="flex justify-between items-center p-3 rounded-md bg-background/50">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          마력: <span className="text-blue-400 font-medium">{curMp.toLocaleString()}</span> → {" "}
                          <span className="text-primary font-medium">{tarMp.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          필요 수치: {Math.max(0, tarMp - curMp).toLocaleString()} (라르당 +{MP_PER_LAR})
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {requiredLarForMp.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">필요 라르</div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </AccordionContent>
          </AccordionItem>

          {/* 스텝 3: 계산 원리 이해 */}
          <AccordionItem value="step3">
            <AccordionTrigger className="text-sm font-medium">
              🎓 STEP 3. 계산 원리 이해하기
            </AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm">
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div>
                  <p className="font-medium text-foreground mb-2">라르 1개당 증가 수치:</p>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-warrior">전사</span>: 체력 +{HP_PER_LAR}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-rogue">도적</span>: 체력 +{HP_PER_LAR}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-mage">법사</span>: 마력 +{MP_PER_LAR}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cleric">직자</span>: 마력 +{MP_PER_LAR}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-taoist">도가</span>: 체력 +{HP_PER_LAR}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="font-medium text-foreground mb-2">계산 공식:</p>
                  <div className="bg-background/80 p-3 rounded-md font-mono text-xs space-y-1">
                    <div>필요 수치 = 목표 수치 - 현재 수치</div>
                    <div>필요 라르 = 필요 수치 ÷ 라르당 증가량 (올림)</div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="font-medium text-foreground mb-2">예시 계산:</p>
                  <div className="bg-primary/10 p-3 rounded-md text-muted-foreground">
                    <p>전사 캐릭터 (체력 +{HP_PER_LAR}/라르)</p>
                    <p className="mt-2">• 현재 체력: 1000</p>
                    <p>• 목표 체력: 1500</p>
                    <p>• 필요 수치: 1500 - 1000 = 500</p>
                    <p className="text-primary font-medium">• 필요 라르: 500 ÷ {HP_PER_LAR} = {Math.ceil(500 / HP_PER_LAR)}개</p>
                  </div>
                </div>
              </div>

              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  💡 <strong>참고:</strong> 라르당 증가량은 일반적인 기본값입니다. 실제 게임 설정에 따라 다를 수 있습니다.
                </AlertDescription>
              </Alert>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
