export type JobClass = "warrior" | "rogue" | "mage" | "cleric" | "taoist"

export interface PartyVacancies {
  warrior: number
  rogue: number
  mage: number
  cleric: number
  taoist: number
  total: number
}

export interface Party {
  location: string
  party_name: string
  organizer: string
  sender_name: string
  time_slot: string
  is_complete: boolean
  updated_at: string
  vacancies: PartyVacancies
  warrior_slots: string[]
  rogue_slots: string[]
  mage_slots: string[]
  cleric_slots: string[]
  taoist_slots: string[]
  requirements: Record<string, string>
}

export interface SearchResult {
  category: "item" | "skill" | "spell"
  displayName: string
  categoryName: string
  job: string
  level: string
  str: string
  dex: string
  int: string
  wis: string
  con: string
  hp: string
  mp: string
  ac: string
  magicDefense: string
  smallDamage: string
  largeDamage: string
  costMana: string
  needLevel: string
  description: string
}

export interface WikiCategory {
  name: string
  icon: string
  items: WikiItem[]
}

export interface WikiItem {
  id: string
  title: string
  icon?: string
  star?: boolean
  blocks?: WikiBlock[]
  children?: WikiItem[]
}

export interface WikiBlock {
  type: string
  content: string
  children?: WikiBlock[]
}

export interface DansuEntry {
  dansu: number
  exp: number
}
