import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SPIRIT_DATA, getGoldByWeeklyCount, formatGold } from "@/lib/spirit-data"

export function SpiritPage() {
  const [currentLevel, setCurrentLevel] = useState<number | null>(null)
  const [currentExp, setCurrentExp] = useState(0)
  const [targetLevel, setTargetLevel] = useState<number | null>(null)
  const [weeklyLevelup, setWeeklyLevelup] = useState(7)

  // 시세
  const [spimentPrice, setSpimentPrice] = useState(0)
  const [etherPrice, setEtherPrice] = useState(0)
  const [spitumPrice, setSpitumPrice] = useState(0)

  // 보유 재료
  const [ownedSpiment, setOwnedSpiment] = useState(0)
  const [ownedEther, setOwnedEther] = useState(0)
  const [ownedSpitum, setOwnedSpitum] = useState(0)
  const [ownedGold, setOwnedGold] = useState(0)

  // 계산 결과
  const [results, setResults] = useState<{
    weekCount: number
    totalExpCount: number
    totalSpiment: number
    totalEther: number
    totalSpitum: number
    totalGold: number
    needSpiment: number
    needEther: number
    needSpitum: number
    needGold: number
    spimentGold: number
    etherGold: number
    spitumGold: number
    totalCost: number
  } | null>(null)

  const maxExp = currentLevel && currentLevel >= 1 && currentLevel <= 50
    ? SPIRIT_DATA[currentLevel - 1].exp
    : 0

  useEffect(() => {
    if (!currentLevel || !targetLevel || targetLevel <= currentLevel) {
      setResults(null)
      return
    }

    // 각 레벨별 필요 정보 수집
    interface LevelExpItem {
      data: typeof SPIRIT_DATA[0]
      isLevelUp: boolean
    }
    const levelExpList: LevelExpItem[] = []
    let totalExpCount = 0
    let totalSpiment = 0
    let totalEther = 0
    let totalSpitum = 0

    for (let lv = currentLevel; lv < targetLevel; lv++) {
      const data = SPIRIT_DATA[lv - 1]
      const startExp = lv === currentLevel ? currentExp : 0
      const expNeeded = data.exp - startExp

      for (let i = 0; i < expNeeded; i++) {
        levelExpList.push({ data, isLevelUp: i === expNeeded - 1 })
      }

      totalExpCount += expNeeded
      totalSpiment += data.spiment * expNeeded
      totalEther += data.ether * expNeeded
      totalSpitum += data.spitum
    }

    // 주당 레벨업 횟수에 따른 골드 계산
    let totalGold = 0
    let weekCount = 0
    let currentWeekCount = 0

    for (let i = 0; i < levelExpList.length; i++) {
      currentWeekCount++
      const item = levelExpList[i]

      const expGold = getGoldByWeeklyCount(item.data, currentWeekCount)
      totalGold += expGold

      if (item.isLevelUp) {
        totalGold += expGold * item.data.spitum
      }

      if (currentWeekCount >= weeklyLevelup) {
        weekCount++
        currentWeekCount = 0
      }
    }

    if (currentWeekCount > 0) {
      weekCount++
    }

    // 추가 필요량 계산
    const needSpiment = Math.max(0, totalSpiment - ownedSpiment)
    const needEther = Math.max(0, totalEther - ownedEther)
    const needSpitum = Math.max(0, totalSpitum - ownedSpitum)
    const needGold = Math.max(0, totalGold - ownedGold)

    const spimentGold = totalSpiment * spimentPrice
    const etherGold = totalEther * etherPrice
    const spitumGold = totalSpitum * spitumPrice

    let totalCost = totalGold
    if (spimentPrice > 0) totalCost += spimentGold
    if (etherPrice > 0) totalCost += etherGold
    if (spitumPrice > 0) totalCost += spitumGold

    setResults({
      weekCount,
      totalExpCount,
      totalSpiment,
      totalEther,
      totalSpitum,
      totalGold,
      needSpiment,
      needEther,
      needSpitum,
      needGold,
      spimentGold,
      etherGold,
      spitumGold,
      totalCost,
    })
  }, [
    currentLevel,
    currentExp,
    targetLevel,
    weeklyLevelup,
    spimentPrice,
    etherPrice,
    spitumPrice,
    ownedSpiment,
    ownedEther,
    ownedSpitum,
    ownedGold,
  ])

  return (
    <div className="container mx-auto max-w-4xl space-y-4 p-4">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">⚔️ 정령 레벨업 비용 계산기</h1>
        <p className="text-sm text-muted-foreground">
          제작: <span className="text-foreground font-medium">밀떡밀떡</span> | 자료참고:{" "}
          <a
            href="https://cafe.naver.com/sclod12/492172"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            수이교 님
          </a>
        </p>
      </div>

      {/* 정령 정보 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 정령 정보 입력</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">현재 레벨</label>
            <Select value={currentLevel?.toString() ?? ""} onValueChange={(v) => setCurrentLevel(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 50 }, (_, i) => i + 1).map((lv) => (
                  <SelectItem key={lv} value={lv.toString()}>
                    {lv}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">현재 EXP</label>
            <Input
              type="number"
              min={0}
              max={maxExp}
              value={currentExp}
              onChange={(e) => setCurrentExp(Number(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">최대: {maxExp || "-"}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">목표 레벨</label>
            <Select value={targetLevel?.toString() ?? ""} onValueChange={(v) => setTargetLevel(Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 50 }, (_, i) => i + 2).map((lv) => (
                  <SelectItem key={lv} value={lv.toString()}>
                    {lv === 51 ? "51 (50레벨 만렙)" : lv}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">주당 레벨업 횟수</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={weeklyLevelup}
              onChange={(e) => setWeeklyLevelup(Number(e.target.value) || 7)}
              placeholder="7"
            />
            <p className="text-xs text-muted-foreground">1~7: r17, 8: r8, 9: r9, 10+: r10</p>
          </div>
        </CardContent>
      </Card>

      {/* 계산 결과 */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary">📈 계산 결과</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 소요 주 수 */}
            <div className="rounded-lg border-2 border-cyan-500/50 bg-cyan-500/10 p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-foreground">📅 소요 주 수</span>
                <span className="text-xl font-bold text-cyan-500">{results.weekCount} 주</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">총 EXP 횟수</span>
                <span className="font-semibold text-cyan-400">{results.totalExpCount.toLocaleString()} 회</span>
              </div>
            </div>

            {/* 예상 골드 */}
            <div className="rounded-lg border-2 border-cyan-500/50 bg-cyan-500/10 p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-foreground">💎 예상 골드</span>
                <span className="text-xl font-bold text-cyan-500">{formatGold(results.totalGold)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">주당 레벨업</span>
                <span className="font-semibold text-cyan-400">주당 {weeklyLevelup}회 진행</span>
              </div>
            </div>

            {/* 필요 스피먼트 */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-foreground">필요 스피먼트</span>
                <span className="text-xl font-bold text-primary">{results.totalSpiment.toLocaleString()} 개</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">추가 필요</span>
                <span className="font-semibold text-green-500">{results.needSpiment.toLocaleString()} 개</span>
              </div>
            </div>

            {/* 필요 에테르 */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-foreground">필요 에테르</span>
                <span className="text-xl font-bold text-primary">{results.totalEther.toLocaleString()} 개</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">추가 필요</span>
                <span className="font-semibold text-green-500">{results.needEther.toLocaleString()} 개</span>
              </div>
            </div>

            {/* 필요 스피튬 */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-foreground">필요 스피튬</span>
                <span className="text-xl font-bold text-primary">{results.totalSpitum.toLocaleString()} 개</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">추가 필요</span>
                <span className="font-semibold text-green-500">{results.needSpitum.toLocaleString()} 개</span>
              </div>
            </div>

            {/* 레벨업 골드 */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-foreground">레벨업 골드</span>
                <span className="text-xl font-bold text-primary">{formatGold(results.totalGold)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">추가 필요</span>
                <span className="font-semibold text-green-500">{formatGold(results.needGold)}</span>
              </div>
            </div>

            {/* 시세 환산 */}
            {spimentPrice > 0 && (
              <div className="rounded-lg border bg-card p-4 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">스피먼트 환산 골드</span>
                  <span className="text-xl font-bold text-primary">{formatGold(results.spimentGold)}</span>
                </div>
              </div>
            )}

            {etherPrice > 0 && (
              <div className="rounded-lg border bg-card p-4 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">에테르 환산 골드</span>
                  <span className="text-xl font-bold text-primary">{formatGold(results.etherGold)}</span>
                </div>
              </div>
            )}

            {spitumPrice > 0 && (
              <div className="rounded-lg border bg-card p-4 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground">스피튬 환산 골드</span>
                  <span className="text-xl font-bold text-primary">{formatGold(results.spitumGold)}</span>
                </div>
              </div>
            )}

            {/* 통합 총 비용 */}
            <div className="rounded-lg border-2 border-primary bg-primary/10 p-4 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">💰 통합 총 비용</span>
                <span className="text-2xl font-bold text-primary">{formatGold(results.totalCost)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 시세 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>
            💰 시세 입력 <span className="text-xs text-muted-foreground ml-2">(선택)</span>
          </CardTitle>
          <CardDescription>거래소 시세를 입력하면 골드 환산 비용이 표시됩니다</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">스피먼트 시세 (골드)</label>
            <Input
              type="number"
              min={0}
              value={spimentPrice || ""}
              onChange={(e) => setSpimentPrice(Number(e.target.value) || 0)}
              placeholder="예: 100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">에테르 시세 (골드)</label>
            <Input
              type="number"
              min={0}
              value={etherPrice || ""}
              onChange={(e) => setEtherPrice(Number(e.target.value) || 0)}
              placeholder="예: 5000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">스피튬 시세 (골드)</label>
            <Input
              type="number"
              min={0}
              value={spitumPrice || ""}
              onChange={(e) => setSpitumPrice(Number(e.target.value) || 0)}
              placeholder="예: 10000"
            />
          </div>
        </CardContent>
      </Card>

      {/* 보유 재료 입력 */}
      <Card>
        <CardHeader>
          <CardTitle>
            📦 보유 재료 입력 <span className="text-xs text-muted-foreground ml-2">(선택)</span>
          </CardTitle>
          <CardDescription>현재 보유한 재료를 입력하면 추가로 필요한 수량이 표시됩니다</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">스피먼트</label>
            <Input
              type="number"
              min={0}
              value={ownedSpiment || ""}
              onChange={(e) => setOwnedSpiment(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">에테르</label>
            <Input
              type="number"
              min={0}
              value={ownedEther || ""}
              onChange={(e) => setOwnedEther(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">스피튬</label>
            <Input
              type="number"
              min={0}
              value={ownedSpitum || ""}
              onChange={(e) => setOwnedSpitum(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">골드</label>
            <Input
              type="number"
              min={0}
              value={ownedGold || ""}
              onChange={(e) => setOwnedGold(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* 계산식 설명 */}
      <Card>
        <CardHeader>
          <CardTitle>📖 계산식 설명</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="font-bold mb-2">주간 레벨업 비용 시스템</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>매주 레벨업 횟수가 <span className="text-cyan-400">리셋</span>됩니다</li>
              <li>
                주간 <span className="text-green-400">1~7번째</span> 레벨업:{" "}
                <span className="text-primary">r17 비용</span> (저렴)
              </li>
              <li>
                주간 <span className="text-orange-400">8번째</span> 레벨업:{" "}
                <span className="text-primary">r8 비용</span>
              </li>
              <li>
                주간 <span className="text-red-400">9번째</span> 레벨업:{" "}
                <span className="text-primary">r9 비용</span>
              </li>
              <li>
                주간 <span className="text-red-500">10번째 이상</span>:{" "}
                <span className="text-primary">r10 비용</span> (비쌈)
              </li>
            </ul>
          </div>

          <div className="rounded-lg border bg-cyan-500/10 p-3">
            <p className="font-bold text-cyan-400 mb-2">최소 비용 계산 방법</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <strong>최소 소요 주 수</strong> = 총 EXP 횟수 ÷ 7 (올림)
              </li>
              <li>
                <strong>최소 골드</strong> = 모든 EXP를 r17 비용으로만 계산
              </li>
              <li>매주 7번까지만 레벨업하면 가장 저렴하게 육성 가능</li>
            </ul>
          </div>

          <div className="rounded-lg border bg-primary/10 p-3">
            <p className="font-bold text-primary mb-2">레벨업 골드 계산</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>EXP 골드 = 각 레벨별 스피먼트/에테르 투입 시 골드</li>
              <li>스피튬 골드 = 레벨업 시 스피튬 개수 × 해당 레벨 골드</li>
              <li>총 골드 = EXP 골드 + 스피튬 골드</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
