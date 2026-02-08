export interface SpiritLevelData {
  level: number
  spiment: number
  ether: number
  gold: {
    r17: number
    r8: number
    r9: number
    r10: number
  }
  spitum: number
  exp: number
}

export const SPIRIT_DATA: SpiritLevelData[] = [
  { level: 1, spiment: 200, ether: 1, gold: { r17: 1000000, r8: 2000000, r9: 4000000, r10: 8000000 }, spitum: 1, exp: 8 },
  { level: 2, spiment: 200, ether: 1, gold: { r17: 1000000, r8: 2000000, r9: 4000000, r10: 8000000 }, spitum: 2, exp: 8 },
  { level: 3, spiment: 200, ether: 1, gold: { r17: 1000000, r8: 2000000, r9: 4000000, r10: 8000000 }, spitum: 3, exp: 8 },
  { level: 4, spiment: 200, ether: 1, gold: { r17: 1000000, r8: 2000000, r9: 4000000, r10: 8000000 }, spitum: 4, exp: 8 },
  { level: 5, spiment: 200, ether: 1, gold: { r17: 1000000, r8: 2000000, r9: 4000000, r10: 8000000 }, spitum: 5, exp: 8 },
  { level: 6, spiment: 200, ether: 1, gold: { r17: 2000000, r8: 4000000, r9: 8000000, r10: 16000000 }, spitum: 6, exp: 8 },
  { level: 7, spiment: 200, ether: 1, gold: { r17: 2000000, r8: 4000000, r9: 8000000, r10: 16000000 }, spitum: 7, exp: 8 },
  { level: 8, spiment: 200, ether: 1, gold: { r17: 2000000, r8: 4000000, r9: 8000000, r10: 16000000 }, spitum: 7, exp: 8 },
  { level: 9, spiment: 200, ether: 1, gold: { r17: 2000000, r8: 4000000, r9: 8000000, r10: 16000000 }, spitum: 7, exp: 8 },
  { level: 10, spiment: 200, ether: 1, gold: { r17: 2000000, r8: 4000000, r9: 8000000, r10: 16000000 }, spitum: 7, exp: 8 },
  { level: 11, spiment: 300, ether: 2, gold: { r17: 3000000, r8: 6000000, r9: 12000000, r10: 24000000 }, spitum: 8, exp: 16 },
  { level: 12, spiment: 300, ether: 2, gold: { r17: 3000000, r8: 6000000, r9: 12000000, r10: 24000000 }, spitum: 8, exp: 16 },
  { level: 13, spiment: 300, ether: 2, gold: { r17: 3000000, r8: 6000000, r9: 12000000, r10: 24000000 }, spitum: 8, exp: 16 },
  { level: 14, spiment: 300, ether: 2, gold: { r17: 3000000, r8: 6000000, r9: 12000000, r10: 24000000 }, spitum: 8, exp: 16 },
  { level: 15, spiment: 300, ether: 2, gold: { r17: 3000000, r8: 6000000, r9: 12000000, r10: 24000000 }, spitum: 8, exp: 16 },
  { level: 16, spiment: 300, ether: 2, gold: { r17: 4000000, r8: 8000000, r9: 16000000, r10: 32000000 }, spitum: 8, exp: 16 },
  { level: 17, spiment: 300, ether: 2, gold: { r17: 4000000, r8: 8000000, r9: 16000000, r10: 32000000 }, spitum: 8, exp: 16 },
  { level: 18, spiment: 300, ether: 2, gold: { r17: 4000000, r8: 8000000, r9: 16000000, r10: 32000000 }, spitum: 8, exp: 16 },
  { level: 19, spiment: 300, ether: 2, gold: { r17: 4000000, r8: 8000000, r9: 16000000, r10: 32000000 }, spitum: 8, exp: 16 },
  { level: 20, spiment: 300, ether: 2, gold: { r17: 4000000, r8: 8000000, r9: 16000000, r10: 32000000 }, spitum: 8, exp: 32 },
  { level: 21, spiment: 300, ether: 2, gold: { r17: 5000000, r8: 10000000, r9: 20000000, r10: 40000000 }, spitum: 10, exp: 32 },
  { level: 22, spiment: 300, ether: 2, gold: { r17: 5000000, r8: 10000000, r9: 20000000, r10: 40000000 }, spitum: 10, exp: 32 },
  { level: 23, spiment: 300, ether: 2, gold: { r17: 5000000, r8: 10000000, r9: 20000000, r10: 40000000 }, spitum: 10, exp: 32 },
  { level: 24, spiment: 300, ether: 2, gold: { r17: 5000000, r8: 10000000, r9: 20000000, r10: 40000000 }, spitum: 10, exp: 32 },
  { level: 25, spiment: 300, ether: 2, gold: { r17: 5000000, r8: 10000000, r9: 20000000, r10: 40000000 }, spitum: 10, exp: 32 },
  { level: 26, spiment: 300, ether: 2, gold: { r17: 6000000, r8: 12000000, r9: 24000000, r10: 48000000 }, spitum: 10, exp: 32 },
  { level: 27, spiment: 300, ether: 2, gold: { r17: 6000000, r8: 12000000, r9: 24000000, r10: 48000000 }, spitum: 10, exp: 32 },
  { level: 28, spiment: 300, ether: 2, gold: { r17: 6000000, r8: 12000000, r9: 24000000, r10: 48000000 }, spitum: 10, exp: 32 },
  { level: 29, spiment: 300, ether: 2, gold: { r17: 6000000, r8: 12000000, r9: 24000000, r10: 48000000 }, spitum: 10, exp: 32 },
  { level: 30, spiment: 400, ether: 3, gold: { r17: 6000000, r8: 12000000, r9: 24000000, r10: 48000000 }, spitum: 10, exp: 48 },
  { level: 31, spiment: 400, ether: 3, gold: { r17: 7000000, r8: 14000000, r9: 28000000, r10: 56000000 }, spitum: 12, exp: 48 },
  { level: 32, spiment: 400, ether: 3, gold: { r17: 7000000, r8: 14000000, r9: 28000000, r10: 56000000 }, spitum: 12, exp: 48 },
  { level: 33, spiment: 400, ether: 3, gold: { r17: 7000000, r8: 14000000, r9: 28000000, r10: 56000000 }, spitum: 12, exp: 48 },
  { level: 34, spiment: 400, ether: 3, gold: { r17: 7000000, r8: 14000000, r9: 28000000, r10: 56000000 }, spitum: 12, exp: 48 },
  { level: 35, spiment: 400, ether: 3, gold: { r17: 7000000, r8: 14000000, r9: 28000000, r10: 56000000 }, spitum: 12, exp: 48 },
  { level: 36, spiment: 400, ether: 3, gold: { r17: 8000000, r8: 16000000, r9: 32000000, r10: 64000000 }, spitum: 12, exp: 48 },
  { level: 37, spiment: 400, ether: 3, gold: { r17: 8000000, r8: 16000000, r9: 32000000, r10: 64000000 }, spitum: 12, exp: 48 },
  { level: 38, spiment: 400, ether: 3, gold: { r17: 8000000, r8: 16000000, r9: 32000000, r10: 64000000 }, spitum: 12, exp: 48 },
  { level: 39, spiment: 400, ether: 3, gold: { r17: 8000000, r8: 16000000, r9: 32000000, r10: 64000000 }, spitum: 12, exp: 48 },
  { level: 40, spiment: 400, ether: 3, gold: { r17: 8000000, r8: 16000000, r9: 32000000, r10: 64000000 }, spitum: 12, exp: 64 },
  { level: 41, spiment: 400, ether: 3, gold: { r17: 9000000, r8: 18000000, r9: 36000000, r10: 72000000 }, spitum: 14, exp: 64 },
  { level: 42, spiment: 400, ether: 3, gold: { r17: 9000000, r8: 18000000, r9: 36000000, r10: 72000000 }, spitum: 14, exp: 64 },
  { level: 43, spiment: 400, ether: 3, gold: { r17: 9000000, r8: 18000000, r9: 36000000, r10: 72000000 }, spitum: 14, exp: 64 },
  { level: 44, spiment: 400, ether: 3, gold: { r17: 9000000, r8: 18000000, r9: 36000000, r10: 72000000 }, spitum: 14, exp: 64 },
  { level: 45, spiment: 400, ether: 3, gold: { r17: 9000000, r8: 18000000, r9: 36000000, r10: 72000000 }, spitum: 14, exp: 64 },
  { level: 46, spiment: 400, ether: 3, gold: { r17: 10000000, r8: 20000000, r9: 40000000, r10: 80000000 }, spitum: 14, exp: 64 },
  { level: 47, spiment: 400, ether: 3, gold: { r17: 10000000, r8: 20000000, r9: 40000000, r10: 80000000 }, spitum: 14, exp: 64 },
  { level: 48, spiment: 400, ether: 3, gold: { r17: 10000000, r8: 20000000, r9: 40000000, r10: 80000000 }, spitum: 14, exp: 64 },
  { level: 49, spiment: 400, ether: 3, gold: { r17: 10000000, r8: 20000000, r9: 40000000, r10: 80000000 }, spitum: 14, exp: 64 },
  { level: 50, spiment: 400, ether: 3, gold: { r17: 10000000, r8: 20000000, r9: 40000000, r10: 80000000 }, spitum: 14, exp: 64 },
]

export function getGoldByWeeklyCount(data: SpiritLevelData, weeklyCount: number): number {
  if (weeklyCount <= 7) return data.gold.r17
  if (weeklyCount === 8) return data.gold.r8
  if (weeklyCount === 9) return data.gold.r9
  return data.gold.r10
}

export function formatGold(gold: number): string {
  if (gold >= 100000000) {
    return `${gold.toLocaleString("ko-KR")} (${(gold / 100000000).toFixed(2)}억)`
  }
  if (gold >= 10000) {
    return `${gold.toLocaleString("ko-KR")} (${(gold / 10000).toFixed(1)}만)`
  }
  return gold.toLocaleString("ko-KR")
}
