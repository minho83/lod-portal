import type { DansuEntry } from "@/types"

interface ExpTier {
  min: number
  max: number
  increment: number
}

const hpExpTiers: ExpTier[] = [
  { min: 0, max: 5550000, increment: 50 },
  { min: 5550000, max: 5600000, increment: 45 },
  { min: 5600000, max: 5650000, increment: 40 },
  { min: 5650000, max: 5700000, increment: 35 },
  { min: 5700000, max: 5750000, increment: 30 },
  { min: 5750000, max: 5800000, increment: 25 },
  { min: 5800000, max: 5850000, increment: 20 },
  { min: 5850000, max: 5900000, increment: 15 },
  { min: 5900000, max: 5950000, increment: 10 },
  { min: 5950000, max: 6000000, increment: 5 },
  { min: 6000000, max: Infinity, increment: 1 },
]

const mpExpTiers: ExpTier[] = [
  { min: 0, max: 2800000, increment: 25 },
  { min: 2800000, max: 2850000, increment: 20 },
  { min: 2850000, max: 2900000, increment: 15 },
  { min: 2900000, max: 2950000, increment: 10 },
  { min: 2950000, max: 3000000, increment: 5 },
  { min: 3000000, max: Infinity, increment: 1 },
]

export const dansuTable: DansuEntry[] = [
  { dansu: 7, exp: 2000000000 },
  { dansu: 8, exp: 107000000000 },
  { dansu: 9, exp: 212000000000 },
  { dansu: 10, exp: 315000000000 },
  { dansu: 11, exp: 420000000000 },
  { dansu: 12, exp: 530000000000 },
  { dansu: 13, exp: 631000000000 },
  { dansu: 14, exp: 1250000000000 },
  { dansu: 15, exp: 1900000000000 },
  { dansu: 16, exp: 2500000000000 },
  { dansu: 17, exp: 3150000000000 },
  { dansu: 18, exp: 3750000000000 },
  { dansu: 19, exp: 4400000000000 },
  { dansu: 20, exp: 5000000000000 },
  { dansu: 21, exp: 6000000000000 },
  { dansu: 22, exp: 7100000000000 },
  { dansu: 23, exp: 8200000000000 },
  { dansu: 24, exp: 9300000000000 },
  { dansu: 25, exp: 10300000000000 },
  { dansu: 26, exp: 11500000000000 },
  { dansu: 27, exp: 12600000000000 },
  { dansu: 28, exp: 13500000000000 },
  { dansu: 29, exp: 14500000000000 },
  { dansu: 30, exp: 15600000000000 },
  { dansu: 31, exp: 17600000000000 },
  { dansu: 32, exp: 20700000000000 },
  { dansu: 33, exp: 24820000000000 },
  { dansu: 34, exp: 29900000000000 },
  { dansu: 35, exp: 36000000000000 },
  { dansu: 36, exp: 40000000000000 },
  { dansu: 37, exp: 51000000000000 },
  { dansu: 38, exp: 60000000000000 },
  { dansu: 39, exp: 70000000000000 },
  { dansu: 40, exp: 81000000000000 },
  { dansu: 41, exp: 93500000000000 },
  { dansu: 42, exp: 108000000000000 },
  { dansu: 43, exp: 122500000000000 },
  { dansu: 44, exp: 137000000000000 },
  { dansu: 45, exp: 151500000000000 },
  { dansu: 46, exp: 169500000000000 },
  { dansu: 47, exp: 187500000000000 },
  { dansu: 48, exp: 206000000000000 },
  { dansu: 49, exp: 224500000000000 },
  { dansu: 50, exp: 248000000000000 },
  { dansu: 51, exp: 271500000000000 },
  { dansu: 52, exp: 292000000000000 },
  { dansu: 53, exp: 318500000000000 },
  { dansu: 54, exp: 342000000000000 },
  { dansu: 55, exp: 367150000000000 },
  { dansu: 56, exp: 394200000000000 },
  { dansu: 57, exp: 422250000000000 },
  { dansu: 58, exp: 451350000000000 },
  { dansu: 59, exp: 482500000000000 },
  { dansu: 60, exp: 512400000000000 },
  { dansu: 61, exp: 545000000000000 },
  { dansu: 62, exp: 577000000000000 },
  { dansu: 63, exp: 611000000000000 },
  { dansu: 64, exp: 646500000000000 },
  { dansu: 65, exp: 682500000000000 },
  { dansu: 66, exp: 719500000000000 },
  { dansu: 67, exp: 758500000000000 },
  { dansu: 68, exp: 798000000000000 },
  { dansu: 69, exp: 837000000000000 },
  { dansu: 70, exp: 878000000000000 },
  { dansu: 71, exp: 921000000000000 },
]

export function getHpExpIncrement(hp: number): number {
  for (const tier of hpExpTiers) {
    if (hp >= tier.min && hp < tier.max) return tier.increment
  }
  return 1
}

export function getMpExpIncrement(mp: number): number {
  for (const tier of mpExpTiers) {
    if (mp >= tier.min && mp < tier.max) return tier.increment
  }
  return 1
}

export function calculateHpExp(hp: number): number {
  if (hp <= 0) return 0
  const BASE_INCREMENT = 50
  let totalExp = 0
  let currentHp = 0

  for (const tier of hpExpTiers) {
    if (currentHp >= hp) break
    const increment = tier.increment
    const tierStart = Math.max(currentHp, tier.min)
    const tierEnd = Math.min(hp, tier.max)
    if (tierStart >= tierEnd) continue
    const steps = Math.floor((tierEnd - tierStart) / increment)
    if (steps <= 0) continue
    const actualEnd = tierStart + steps * increment
    const baseExp =
      actualEnd * (actualEnd - 50) * 5 - tierStart * (tierStart - 50) * 5
    const adjustedExp = baseExp * (BASE_INCREMENT / increment)
    totalExp += adjustedExp
    currentHp = actualEnd
  }
  return totalExp
}

export function calculateMpExp(mp: number): number {
  if (mp <= 0) return 0
  const BASE_INCREMENT = 25
  let totalExp = 0
  let currentMp = 0

  for (const tier of mpExpTiers) {
    if (currentMp >= mp) break
    const increment = tier.increment
    const tierStart = Math.max(currentMp, tier.min)
    const tierEnd = Math.min(mp, tier.max)
    if (tierStart >= tierEnd) continue
    const steps = Math.floor((tierEnd - tierStart) / increment)
    if (steps <= 0) continue
    const actualEnd = tierStart + steps * increment
    const baseExp =
      actualEnd * (actualEnd - 25) * 10 -
      tierStart * (tierStart - 25) * 10
    const adjustedExp = baseExp * (BASE_INCREMENT / increment)
    totalExp += adjustedExp
    currentMp = actualEnd
  }
  return totalExp
}

export function calculateTotalExp(hp: number, mp: number): number {
  return calculateHpExp(hp) + calculateMpExp(mp)
}

export interface DansuResult {
  dansu: number
  nextExp: number | null
  currentExp: number
  progress: number
}

export function calculateDansu(totalExp: number): DansuResult {
  if (dansuTable.length === 0) {
    return { dansu: 6, nextExp: 0, currentExp: 0, progress: 0 }
  }
  if (totalExp < dansuTable[0].exp) {
    return {
      dansu: 6,
      nextExp: dansuTable[0].exp,
      currentExp: 0,
      progress: (totalExp / dansuTable[0].exp) * 100,
    }
  }
  for (let i = dansuTable.length - 1; i >= 0; i--) {
    if (totalExp >= dansuTable[i].exp) {
      const nextEntry = i < dansuTable.length - 1 ? dansuTable[i + 1] : null
      const progress = nextEntry
        ? ((totalExp - dansuTable[i].exp) / (nextEntry.exp - dansuTable[i].exp)) * 100
        : 100
      return {
        dansu: dansuTable[i].dansu,
        nextExp: nextEntry ? nextEntry.exp : null,
        currentExp: dansuTable[i].exp,
        progress: Math.min(progress, 100),
      }
    }
  }
  return { dansu: 6, nextExp: dansuTable[0].exp, currentExp: 0, progress: 0 }
}

export function formatExp(exp: number): string {
  if (exp >= 1e12) return (exp / 1e12).toFixed(2) + "조"
  if (exp >= 1e8) return (exp / 1e8).toFixed(2) + "억"
  if (exp >= 1e4) return (exp / 1e4).toFixed(1) + "만"
  return exp.toLocaleString()
}

export function getNecklaceBonus(level: number): number {
  let bonus = 0
  for (let i = 1; i <= level; i++) {
    bonus += i % 5 === 0 ? 0.2 : 0.1
  }
  return bonus
}

// ── Rar Tier-Based Calculation Model ──
// 라르 1개 = 10,000 골드 (아데나)
// 각 스탯 구간마다 1업그레이드당 필요 라르(rarPerUpgrade)가 다름

export const RAR_GOLD_PRICE = 10_000

export interface RarTier {
  min: number
  max: number
  increment: number
  rarPerUpgrade: number
  label: string
}

export const hpRarTiers: RarTier[] = [
  { min: 300_000, max: 400_000, increment: 50, rarPerUpgrade: 10, label: "30만~40만" },
  { min: 400_000, max: 500_000, increment: 50, rarPerUpgrade: 20, label: "40만~50만" },
  { min: 500_000, max: 1_000_000, increment: 50, rarPerUpgrade: 30, label: "50만~100만" },
  { min: 1_000_000, max: 2_500_000, increment: 50, rarPerUpgrade: 50, label: "100만~250만" },
  { min: 2_500_000, max: 5_550_000, increment: 50, rarPerUpgrade: 100, label: "250만~555만" },
  { min: 5_550_000, max: 5_600_000, increment: 45, rarPerUpgrade: 200, label: "555만~560만" },
  { min: 5_600_000, max: 5_650_000, increment: 40, rarPerUpgrade: 200, label: "560만~565만" },
  { min: 5_650_000, max: 5_700_000, increment: 35, rarPerUpgrade: 200, label: "565만~570만" },
  { min: 5_700_000, max: 5_750_000, increment: 30, rarPerUpgrade: 200, label: "570만~575만" },
  { min: 5_750_000, max: 5_800_000, increment: 25, rarPerUpgrade: 200, label: "575만~580만" },
  { min: 5_800_000, max: 5_850_000, increment: 20, rarPerUpgrade: 200, label: "580만~585만" },
  { min: 5_850_000, max: 5_900_000, increment: 15, rarPerUpgrade: 200, label: "585만~590만" },
  { min: 5_900_000, max: 5_950_000, increment: 10, rarPerUpgrade: 200, label: "590만~595만" },
  { min: 5_950_000, max: 6_000_000, increment: 5, rarPerUpgrade: 200, label: "595만~600만" },
  { min: 6_000_000, max: Infinity, increment: 1, rarPerUpgrade: 200, label: "600만 이상" },
]

export const mpRarTiers: RarTier[] = [
  { min: 150_000, max: 200_000, increment: 25, rarPerUpgrade: 10, label: "15만~20만" },
  { min: 200_000, max: 250_000, increment: 25, rarPerUpgrade: 20, label: "20만~25만" },
  { min: 250_000, max: 500_000, increment: 25, rarPerUpgrade: 30, label: "25만~50만" },
  { min: 500_000, max: 1_000_000, increment: 25, rarPerUpgrade: 50, label: "50만~100만" },
  { min: 1_000_000, max: 1_250_000, increment: 25, rarPerUpgrade: 50, label: "100만~125만" },
  { min: 1_250_000, max: 2_750_000, increment: 25, rarPerUpgrade: 100, label: "125만~275만" },
  { min: 2_750_000, max: 2_800_000, increment: 25, rarPerUpgrade: 200, label: "275만~280만" },
  { min: 2_800_000, max: 2_850_000, increment: 20, rarPerUpgrade: 200, label: "280만~285만" },
  { min: 2_850_000, max: 2_900_000, increment: 15, rarPerUpgrade: 200, label: "285만~290만" },
  { min: 2_900_000, max: 2_950_000, increment: 10, rarPerUpgrade: 200, label: "290만~295만" },
  { min: 2_950_000, max: 3_000_000, increment: 5, rarPerUpgrade: 200, label: "295만~300만" },
  { min: 3_000_000, max: Infinity, increment: 1, rarPerUpgrade: 200, label: "300만 이상" },
]

export const maxExpTable: { dansu: number; maxExp: number }[] = [
  { dansu: 7, maxExp: 4_294_967_295 },
  { dansu: 8, maxExp: 4_294_967_295 },
  { dansu: 9, maxExp: 4_294_967_295 },
  { dansu: 10, maxExp: 10_000_000_000 },
  { dansu: 11, maxExp: 15_000_000_000 },
  { dansu: 12, maxExp: 20_000_000_000 },
  { dansu: 13, maxExp: 25_000_000_000 },
  { dansu: 14, maxExp: 50_000_000_000 },
  { dansu: 15, maxExp: 50_000_000_000 },
  { dansu: 16, maxExp: 100_000_000_000 },
  { dansu: 17, maxExp: 100_000_000_000 },
  { dansu: 18, maxExp: 100_000_000_000 },
  { dansu: 19, maxExp: 100_000_000_000 },
  { dansu: 20, maxExp: 200_000_000_000 },
  { dansu: 21, maxExp: 200_000_000_000 },
  { dansu: 22, maxExp: 200_000_000_000 },
  { dansu: 23, maxExp: 200_000_000_000 },
  { dansu: 24, maxExp: 200_000_000_000 },
  { dansu: 25, maxExp: 300_000_000_000 },
  { dansu: 26, maxExp: 300_000_000_000 },
  { dansu: 27, maxExp: 300_000_000_000 },
  { dansu: 28, maxExp: 300_000_000_000 },
  { dansu: 29, maxExp: 300_000_000_000 },
  { dansu: 30, maxExp: 1_000_000_000_000 },
  { dansu: 31, maxExp: 1_100_000_000_000 },
  { dansu: 32, maxExp: 1_200_000_000_000 },
  { dansu: 33, maxExp: 1_300_000_000_000 },
  { dansu: 34, maxExp: 1_400_000_000_000 },
  { dansu: 35, maxExp: 1_500_000_000_000 },
  { dansu: 36, maxExp: 1_600_000_000_000 },
  { dansu: 37, maxExp: 1_700_000_000_000 },
  { dansu: 38, maxExp: 1_800_000_000_000 },
  { dansu: 39, maxExp: 1_900_000_000_000 },
  { dansu: 40, maxExp: 2_000_000_000_000 },
  { dansu: 41, maxExp: 2_100_000_000_000 },
  { dansu: 42, maxExp: 2_200_000_000_000 },
  { dansu: 43, maxExp: 2_300_000_000_000 },
  { dansu: 44, maxExp: 2_400_000_000_000 },
  { dansu: 45, maxExp: 2_500_000_000_000 },
  { dansu: 46, maxExp: 2_600_000_000_000 },
  { dansu: 47, maxExp: 2_700_000_000_000 },
  { dansu: 48, maxExp: 2_800_000_000_000 },
  { dansu: 49, maxExp: 2_900_000_000_000 },
  { dansu: 50, maxExp: 3_000_000_000_000 },
  { dansu: 51, maxExp: 3_100_000_000_000 },
  { dansu: 52, maxExp: 3_200_000_000_000 },
  { dansu: 53, maxExp: 3_300_000_000_000 },
  { dansu: 54, maxExp: 3_400_000_000_000 },
  { dansu: 55, maxExp: 3_500_000_000_000 },
  { dansu: 56, maxExp: 3_600_000_000_000 },
  { dansu: 57, maxExp: 3_700_000_000_000 },
  { dansu: 58, maxExp: 3_800_000_000_000 },
  { dansu: 59, maxExp: 3_900_000_000_000 },
  { dansu: 60, maxExp: 4_000_000_000_000 },
  { dansu: 61, maxExp: 4_100_000_000_000 },
  { dansu: 62, maxExp: 4_200_000_000_000 },
  { dansu: 63, maxExp: 4_300_000_000_000 },
  { dansu: 64, maxExp: 4_400_000_000_000 },
  { dansu: 65, maxExp: 4_500_000_000_000 },
  { dansu: 66, maxExp: 4_600_000_000_000 },
  { dansu: 67, maxExp: 4_700_000_000_000 },
  { dansu: 68, maxExp: 4_800_000_000_000 },
  { dansu: 69, maxExp: 4_900_000_000_000 },
  { dansu: 70, maxExp: 5_000_000_000_000 },
  { dansu: 71, maxExp: 5_100_000_000_000 },
]

// ── Tier-Based Rar Calculation Functions ──

export interface TierRarBreakdown {
  label: string
  upgrades: number
  rar: number
  gain: number
}

export interface TierRarResult {
  totalRar: number
  breakdown: TierRarBreakdown[]
}

/** 현재 스탯 → 목표 스탯까지 필요한 라르 계산 */
export function calculateTierRar(
  current: number,
  target: number,
  tiers: RarTier[],
  discountRate: number = 0,
): TierRarResult {
  const breakdown: TierRarBreakdown[] = []
  if (tiers.length === 0 || target <= current) return { totalRar: 0, breakdown }

  let totalRar = 0
  const firstTierMin = tiers[0].min
  let currentValue = Math.max(current, firstTierMin)
  const discountFactor = 1 - Math.max(0, Math.min(99, discountRate)) / 100

  if (target < firstTierMin) return { totalRar: 0, breakdown }

  for (const tier of tiers) {
    if (currentValue >= target) break
    if (currentValue >= tier.max) continue
    if (target <= tier.min) continue

    const tierStart = Math.max(currentValue, tier.min)
    const tierEnd = Math.min(target, tier.max)
    const gainInTier = tierEnd - tierStart

    if (gainInTier > 0) {
      const upgrades = Math.ceil(gainInTier / tier.increment)
      const rarNeeded = Math.floor(upgrades * tier.rarPerUpgrade * discountFactor)
      totalRar += rarNeeded
      breakdown.push({ label: tier.label, upgrades, rar: rarNeeded, gain: gainInTier })
      currentValue = tierEnd
    }
  }

  return { totalRar, breakdown }
}

export interface ReverseRarResult {
  finalValue: number
  totalGain: number
  remainingRar: number
}

/** 보유 라르로 올릴 수 있는 최대 스탯 계산 */
export function calculateReverseRar(
  current: number,
  availableRar: number,
  tiers: RarTier[],
  discountRate: number = 0,
): ReverseRarResult {
  if (tiers.length === 0 || availableRar <= 0) {
    return { finalValue: current, totalGain: 0, remainingRar: availableRar }
  }

  let remainingRar = availableRar
  let currentValue = Math.max(current, tiers[0].min)
  let totalGain = 0
  const discountFactor = 1 - Math.max(0, Math.min(99, discountRate)) / 100

  for (const tier of tiers) {
    if (remainingRar <= 0) break
    if (currentValue >= tier.max) continue
    if (currentValue < tier.min) continue

    const rarPerUpgrade = Math.floor(tier.rarPerUpgrade * discountFactor)
    if (rarPerUpgrade === 0) {
      // 할인이 100%면 무한 업그레이드 방지
      const gain = tier.max === Infinity ? 0 : tier.max - currentValue
      currentValue += gain
      totalGain += gain
      continue
    }

    const maxUpgrades = tier.max === Infinity
      ? Math.floor(remainingRar / rarPerUpgrade)
      : Math.ceil((tier.max - currentValue) / tier.increment)
    const possibleUpgrades = Math.floor(remainingRar / rarPerUpgrade)
    const actualUpgrades = Math.min(possibleUpgrades, maxUpgrades)

    if (actualUpgrades <= 0) break

    let gain = actualUpgrades * tier.increment
    if (tier.max !== Infinity && currentValue + gain > tier.max) {
      gain = tier.max - currentValue
    }

    currentValue += gain
    totalGain += gain
    remainingRar -= actualUpgrades * rarPerUpgrade
  }

  return { finalValue: currentValue, totalGain, remainingRar }
}

export interface RarForExpResult {
  rar: number
  start: number
  target: number
  gain: number
  expUsed: number
}

/** 주어진 경험치를 소비하는데 필요한 라르 계산 (풀경 모드용) */
export function calculateRarForNeededExp(
  currentStat: number,
  availableExp: number,
  statType: "hp" | "mp",
  discountRate: number = 0,
): RarForExpResult {
  if (availableExp <= 0) {
    return { rar: 0, start: currentStat, target: currentStat, gain: 0, expUsed: 0 }
  }

  const discountFactor = 1 - Math.max(0, Math.min(99, discountRate)) / 100
  let totalRar = 0
  let currentValue = currentStat
  let remainingExp = availableExp

  const isHp = statType === "hp"
  const tiers = isHp ? hpRarTiers : mpRarTiers
  const BASE_INCREMENT = isHp ? 50 : 25
  const minStart = isHp ? 300_000 : 150_000
  const expBase = isHp ? 50 : 25
  const expMult = isHp ? 5 : 10

  if (currentValue < minStart) currentValue = minStart

  for (const tier of tiers) {
    if (remainingExp <= 0) break
    if (currentValue >= tier.max) continue
    if (currentValue < tier.min) continue

    const increment = tier.increment
    const rarPerUpgrade = Math.floor(tier.rarPerUpgrade * discountFactor)

    while (remainingExp > 0 && currentValue < tier.max) {
      const nextValue = currentValue + increment
      const baseExpBefore = currentValue * (currentValue - expBase) * expMult
      const baseExpAfter = nextValue * (nextValue - expBase) * expMult
      const expCost = (baseExpAfter - baseExpBefore) * (BASE_INCREMENT / increment)
      if (expCost > remainingExp) break
      remainingExp -= expCost
      totalRar += rarPerUpgrade
      currentValue = nextValue
    }
  }

  return {
    rar: totalRar,
    start: currentStat,
    target: currentValue,
    gain: currentValue - currentStat,
    expUsed: availableExp - remainingExp,
  }
}

export interface FullExpResult {
  dansu: number
  maxExp: number
  currentTotalExp: number
  hp: RarForExpResult
  mp: RarForExpResult
  recommended: "hp" | "mp"
  minRar: number
}

/** 현재 스탯 기준 풀경험치 소비에 필요한 라르 계산 */
export function calculateFullExpRar(
  currentHP: number,
  currentMP: number,
  discountRate: number = 0,
): FullExpResult | null {
  const currentTotalExp = calculateHpExp(currentHP) + calculateMpExp(currentMP)
  const dansuInfo = calculateDansu(currentTotalExp)
  const maxExp = getMaxExpForDansu(dansuInfo.dansu)
  if (maxExp === 0) return null

  const hpResult = calculateRarForNeededExp(currentHP, maxExp, "hp", discountRate)
  const mpResult = calculateRarForNeededExp(currentMP, maxExp, "mp", discountRate)

  return {
    dansu: dansuInfo.dansu,
    maxExp,
    currentTotalExp,
    hp: hpResult,
    mp: mpResult,
    recommended: hpResult.rar <= mpResult.rar ? "hp" : "mp",
    minRar: Math.min(hpResult.rar, mpResult.rar),
  }
}

export function getMaxExpForDansu(dansu: number): number {
  const entry = maxExpTable.find((e) => e.dansu === dansu)
  return entry ? entry.maxExp : 0
}

// ── Formatting Helpers ──

export function formatCash(num: number): string {
  if (num >= 100_000_000) return (num / 100_000_000).toFixed(1) + "억원"
  if (num >= 10_000) return Math.round(num / 10_000).toLocaleString() + "만원"
  return Math.round(num).toLocaleString() + "원"
}

export function formatCurrency(num: number): string {
  if (num >= 100_000_000) return (num / 100_000_000).toFixed(2) + "억"
  if (num >= 10_000) return Math.round(num / 10_000).toLocaleString() + "만"
  return num.toLocaleString()
}
