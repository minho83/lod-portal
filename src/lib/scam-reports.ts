import { supabase } from "./supabase"
import type { ScamReport, ReportType } from "@/types"

export interface CreateScamReportInput {
  reported_user_id?: string
  suspect_name: string
  suspect_discord_id?: string
  report_type: ReportType
  title: string
  description: string
  evidence_urls?: string[]
  related_trade_id?: string
}

/**
 * 사기 신고 생성
 */
export async function createScamReport(input: CreateScamReportInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("로그인이 필요합니다")
  }

  const { data, error } = await supabase
    .from("scam_reports")
    .insert({
      reporter_id: user.id,
      reported_user_id: input.reported_user_id || null,
      suspect_name: input.suspect_name,
      suspect_discord_id: input.suspect_discord_id || null,
      report_type: input.report_type,
      title: input.title,
      description: input.description,
      evidence_urls: input.evidence_urls || null,
      related_trade_id: input.related_trade_id || null,
    })
    .select()
    .single()

  if (error) throw error
  return data as ScamReport
}

/**
 * 내 신고 목록 조회
 */
export async function getMyReports() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("로그인이 필요합니다")
  }

  const { data, error } = await supabase
    .from("scam_reports")
    .select(
      `
      *,
      reporter:profiles!reporter_id(*),
      reported_user:profiles!reported_user_id(*),
      related_trade:trades(*)
    `
    )
    .eq("reporter_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as ScamReport[]
}

/**
 * 신고 상세 조회
 */
export async function getReportById(reportId: string) {
  const { data, error } = await supabase
    .from("scam_reports")
    .select(
      `
      *,
      reporter:profiles!reporter_id(*),
      reported_user:profiles!reported_user_id(*),
      related_trade:trades(*)
    `
    )
    .eq("id", reportId)
    .single()

  if (error) throw error
  return data as ScamReport
}

/**
 * 신고 수정 (pending 상태일 때만)
 */
export async function updateScamReport(
  reportId: string,
  updates: Partial<CreateScamReportInput>
) {
  const { data, error } = await supabase
    .from("scam_reports")
    .update(updates)
    .eq("id", reportId)
    .eq("status", "pending")
    .select()
    .single()

  if (error) throw error
  return data as ScamReport
}

/**
 * 신고 삭제 (pending 상태일 때만)
 */
export async function deleteScamReport(reportId: string) {
  const { error } = await supabase
    .from("scam_reports")
    .delete()
    .eq("id", reportId)
    .eq("status", "pending")

  if (error) throw error
}

/**
 * 사용자가 차단되었는지 확인
 */
export async function isUserBanned(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("id", userId)
    .single()

  if (error) return false
  return data?.is_banned || false
}

/**
 * 현재 사용자가 차단되었는지 확인
 */
export async function checkCurrentUserBanned(): Promise<{
  isBanned: boolean
  banReason?: string
  bannedAt?: string
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { isBanned: false }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("is_banned, ban_reason, banned_at")
    .eq("id", user.id)
    .single()

  if (error || !data) {
    return { isBanned: false }
  }

  return {
    isBanned: data.is_banned || false,
    banReason: data.ban_reason || undefined,
    bannedAt: data.banned_at || undefined,
  }
}
