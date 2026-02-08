import { supabase } from "./supabase"
import type { AdminBlacklist, ScamReport, Trade, PartyRecruit, UserProfile } from "@/types"

// ============================================
// 블랙리스트 관리
// ============================================

/**
 * 관리자 블랙리스트 조회
 */
export async function getAdminBlacklists() {
  const { data, error } = await supabase
    .from("admin_blacklist")
    .select(`
      *,
      target_user:user_profiles!admin_blacklist_target_user_id_fkey(*),
      admin:user_profiles!admin_blacklist_banned_by_fkey(*)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as AdminBlacklist[]
}

/**
 * 블랙리스트 추가
 */
export async function addToBlacklist(params: {
  target_user_id: string | null
  target_character_name: string
  reason: string
  banned_by: string
}) {
  const { data, error } = await supabase
    .from("admin_blacklist")
    .insert(params)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * 블랙리스트 해제
 */
export async function removeFromBlacklist(id: string) {
  const { error } = await supabase
    .from("admin_blacklist")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ============================================
// 사기 신고 관리
// ============================================

/**
 * 사기 신고 목록 조회 (관리자용 - 모든 상태)
 */
export async function getScamReportsAdmin() {
  const { data, error } = await supabase
    .from("scam_reports")
    .select(`
      *,
      reporter:user_profiles!scam_reports_reporter_id_fkey(*),
      reported_user:user_profiles!scam_reports_reported_user_id_fkey(*),
      related_trade:trades(*)
    `)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as ScamReport[]
}

/**
 * 사기 신고 상태 변경
 */
export async function updateScamReportStatus(
  id: string,
  status: ScamReport["status"],
  admin_note?: string,
  resolved_by?: string
) {
  const updates: Partial<ScamReport> = {
    status,
    admin_note,
    resolved_by,
  }

  if (status === "confirmed" || status === "dismissed" || status === "resolved") {
    updates.resolved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from("scam_reports")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// 사용자 관리
// ============================================

/**
 * 사용자 목록 조회 (페이지네이션)
 */
export async function getUsers(page = 1, limit = 50) {
  const start = (page - 1) * limit
  const end = start + limit - 1

  const { data, error, count } = await supabase
    .from("user_profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(start, end)

  if (error) throw error
  return { users: data as UserProfile[], total: count || 0 }
}

/**
 * 사용자 검색
 */
export async function searchUsers(query: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .or(`discord_username.ilike.%${query}%,game_nickname.ilike.%${query}%`)
    .limit(20)

  if (error) throw error
  return data as UserProfile[]
}

// ============================================
// 콘텐츠 관리
// ============================================

/**
 * 거래글 강제 삭제 (관리자)
 */
export async function deleteTradeAdmin(id: string) {
  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id)

  if (error) throw error
}

/**
 * 파티 모집글 강제 삭제 (관리자)
 */
export async function deleteRecruitAdmin(id: string) {
  const { error } = await supabase
    .from("party_recruits")
    .delete()
    .eq("id", id)

  if (error) throw error
}

/**
 * 최근 거래글 조회 (관리자)
 */
export async function getRecentTrades(limit = 20) {
  const { data, error } = await supabase
    .from("trades")
    .select(`
      *,
      seller:user_profiles!trades_seller_id_fkey(*)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Trade[]
}

/**
 * 최근 파티 모집글 조회 (관리자)
 */
export async function getRecentRecruits(limit = 20) {
  const { data, error } = await supabase
    .from("party_recruits")
    .select(`
      *,
      author:user_profiles!party_recruits_author_id_fkey(*)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as PartyRecruit[]
}

// ============================================
// 시스템 통계
// ============================================

export interface AdminStats {
  total_users: number
  total_trades: number
  total_recruits: number
  total_scam_reports: number
  pending_scam_reports: number
  blacklist_count: number
  recent_signups: number
}

/**
 * 시스템 통계 조회
 */
export async function getAdminStats(): Promise<AdminStats> {
  const [
    usersResult,
    tradesResult,
    recruitsResult,
    scamReportsResult,
    pendingScamReportsResult,
    blacklistResult,
    recentSignupsResult,
  ] = await Promise.all([
    supabase.from("user_profiles").select("*", { count: "exact", head: true }),
    supabase.from("trades").select("*", { count: "exact", head: true }),
    supabase.from("party_recruits").select("*", { count: "exact", head: true }),
    supabase.from("scam_reports").select("*", { count: "exact", head: true }),
    supabase.from("scam_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("admin_blacklist").select("*", { count: "exact", head: true }),
    supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  return {
    total_users: usersResult.count || 0,
    total_trades: tradesResult.count || 0,
    total_recruits: recruitsResult.count || 0,
    total_scam_reports: scamReportsResult.count || 0,
    pending_scam_reports: pendingScamReportsResult.count || 0,
    blacklist_count: blacklistResult.count || 0,
    recent_signups: recentSignupsResult.count || 0,
  }
}

/**
 * 관리자 권한 부여/제거
 */
export async function toggleAdminRole(userId: string, isAdmin: boolean) {
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId)

  if (error) throw error
}
