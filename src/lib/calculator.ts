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
