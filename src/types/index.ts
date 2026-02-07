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
  location: string | null
  party_name: string | null
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

export interface UserProfile {
  id: string
  discord_id: string
  discord_username: string
  discord_avatar: string | null
  game_nickname: string | null
  game_class: JobClass | null
  created_at: string
  updated_at: string
}

// 거래소
export type TradeType = "buy" | "sell"
export type TradeStatus = "active" | "reserved" | "sold" | "expired" | "cancelled"

export const TRADE_CATEGORIES = ["무기", "방어구", "장신구", "소비", "재료", "기타"] as const
export type TradeCategory = (typeof TRADE_CATEGORIES)[number]

export interface TradeItem {
  item_name: string
  item_category: TradeCategory
  price: number
  quantity: number
}

export interface Trade {
  id: string
  seller_id: string
  trade_type: TradeType
  item_name: string
  item_category: TradeCategory
  item_description: string | null
  price: number
  price_unit: string
  quantity: number
  is_negotiable: boolean
  status: TradeStatus
  buyer_id: string | null
  items: TradeItem[] | null
  created_at: string
  updated_at: string
  expires_at: string
  // joined
  seller?: UserProfile
}

export interface MarketPrice {
  item_name: string
  item_category: string
  median_price: number
  avg_price: number
  min_price: number
  max_price: number
  trade_count: number
  window_days: number
}

// 파티 모집
export type RecruitJoinMode = "approval" | "first_come"
export type RecruitStatus = "open" | "full" | "closed" | "cancelled"
export type MemberRole = "leader" | "member"
export type MemberStatus = "accepted" | "pending" | "rejected" | "left" | "kicked"

export type JobSlots = Record<JobClass, number>

export interface PartyRecruit {
  id: string
  author_id: string
  title: string
  description: string | null
  location: string | null
  scheduled_at: string | null
  join_mode: RecruitJoinMode
  status: RecruitStatus
  job_slots: JobSlots
  max_members: number
  member_count: number
  created_at: string
  updated_at: string
  expires_at: string
  // joined
  author?: UserProfile
  members?: PartyMember[]
}

export interface PartyMember {
  id: string
  recruit_id: string
  user_id: string
  role: MemberRole
  job_class: JobClass
  status: MemberStatus
  character_name: string
  created_at: string
  updated_at: string
  // joined
  user?: UserProfile
}
