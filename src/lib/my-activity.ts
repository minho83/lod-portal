import { supabase } from "./supabase"
import type { PartyMember, PartyRecruit, Trade } from "@/types"

// ============================================
// 파티 관련 함수
// ============================================

/**
 * 내가 신청한 파티 목록 조회
 */
export async function fetchMyApplications(userId: string) {
  const { data, error } = await supabase
    .from("party_members")
    .select(`
      *,
      recruit:party_recruits!party_members_recruit_id_fkey(
        *,
        author:profiles!party_recruits_author_profile_fkey(*)
      )
    `)
    .eq("user_id", userId)
    .in("status", ["pending", "accepted"])
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as (PartyMember & { recruit: PartyRecruit })[]
}

/**
 * 내가 파티장인 파티 목록 조회
 */
export async function fetchMyRecruits(userId: string) {
  const { data, error } = await supabase
    .from("party_recruits")
    .select(`
      *,
      author:profiles!party_recruits_author_profile_fkey(*),
      members:party_members(*)
    `)
    .eq("author_id", userId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as PartyRecruit[]
}

// ============================================
// 거래 관련 함수
// ============================================

/**
 * 내가 파는 물품 목록 조회
 */
export async function fetchMySellingItems(userId: string) {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("seller_id", userId)
    .eq("trade_type", "sell")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Trade[]
}

/**
 * 내가 사는 물품 목록 조회
 */
export async function fetchMyBuyingItems(userId: string) {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("seller_id", userId)
    .eq("trade_type", "buy")
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Trade[]
}

/**
 * 거래중인 물품 목록 조회
 */
export async function fetchMyTradingItems(userId: string) {
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("seller_id", userId)
    .in("status", ["reserved", "sold"])
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Trade[]
}

// ============================================
// 삭제 관련 함수
// ============================================

/**
 * 파티 신청 삭제 (탈퇴)
 */
export async function deletePartyApplication(applicationId: string) {
  const { error } = await supabase
    .from("party_members")
    .update({ status: "left" })
    .eq("id", applicationId)

  if (error) throw error
}

/**
 * 파티 신청 여러 개 삭제
 */
export async function deletePartyApplications(applicationIds: string[]) {
  const { error } = await supabase
    .from("party_members")
    .update({ status: "left" })
    .in("id", applicationIds)

  if (error) throw error
}

/**
 * 파티 모집 삭제 (취소)
 */
export async function deletePartyRecruit(recruitId: string) {
  const { error } = await supabase
    .from("party_recruits")
    .update({ status: "cancelled" })
    .eq("id", recruitId)

  if (error) throw error
}

/**
 * 파티 모집 여러 개 삭제
 */
export async function deletePartyRecruits(recruitIds: string[]) {
  const { error } = await supabase
    .from("party_recruits")
    .update({ status: "cancelled" })
    .in("id", recruitIds)

  if (error) throw error
}

/**
 * 거래 삭제 (취소)
 */
export async function deleteTrade(tradeId: string) {
  const { error } = await supabase
    .from("trades")
    .update({ status: "cancelled" })
    .eq("id", tradeId)

  if (error) throw error
}

/**
 * 거래 여러 개 삭제
 */
export async function deleteTrades(tradeIds: string[]) {
  const { error } = await supabase
    .from("trades")
    .update({ status: "cancelled" })
    .in("id", tradeIds)

  if (error) throw error
}
