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
  is_admin?: boolean
  notification_browser_enabled?: boolean
  notification_discord_enabled?: boolean
  discord_webhook_url?: string | null
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

export interface TradeMessage {
  id: string
  trade_id: string
  sender_id: string
  message: string
  read: boolean
  created_at: string
  // joined
  sender?: UserProfile
}

// 파티 모집
export type RecruitType = "party" | "guild_war" | "chaos_tower"
export type RecruitJoinMode = "approval" | "first_come"
export type RecruitStatus = "open" | "full" | "closed" | "cancelled"
export type MemberRole = "leader" | "member"
export type MemberStatus = "accepted" | "pending" | "rejected" | "left" | "kicked"

export type JobSlots = Record<JobClass, number>

export interface PartyRecruit {
  id: string
  author_id: string
  recruit_type: RecruitType
  title: string
  description: string | null
  location: string | null
  scheduled_at: string | null
  end_time: string | null
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

export interface PartyTemplate {
  id: string
  user_id: string
  template_name: string
  recruit_type: RecruitType
  location: string | null
  join_mode: RecruitJoinMode
  slots: JobSlots
  description: string | null
  created_at: string
  updated_at: string
}

// 블랙리스트
export interface BlacklistEntry {
  id: string
  user_id: string
  blocked_user_id: string
  reason: string | null
  created_at: string
  // joined
  blocked_user?: UserProfile
}

// 관리자 블랙리스트
export interface AdminBlacklist {
  id: string
  target_user_id: string | null
  target_character_name: string
  reason: string
  banned_by: string
  created_at: string
  // joined
  target_user?: UserProfile
  admin?: UserProfile
}

// 사기 신고
export type ReportType = "no_payment" | "no_item"
export type ReportStatus = "pending" | "reviewing" | "confirmed" | "dismissed" | "resolved"

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  no_payment: "돈을 안줬다",
  no_item: "아이템을 안줬다",
}

export interface ScamReport {
  id: string
  reporter_id: string
  reported_user_id: string | null
  suspect_name: string
  suspect_discord_id: string | null
  report_type: ReportType
  title: string
  description: string
  evidence_urls: string[] | null
  related_trade_id: string | null
  status: ReportStatus
  admin_note: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
  updated_at: string
  // joined
  reporter?: UserProfile
  reported_user?: UserProfile
  related_trade?: Trade
}

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | "party_application"   // 파티 신청
  | "party_accepted"      // 파티 승인
  | "party_rejected"      // 파티 거절
  | "party_kicked"        // 파티 추방
  | "trade_inquiry"       // 거래 문의
  | "trade_request"       // 거래 요청
  | "trade_reservation"   // 거래소 예약
  | "trade_comment"       // 거래소 댓글
  | "scam_report_result"  // 사기 신고 결과
  | "system_announcement" // 관리자 전체 공지

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}
