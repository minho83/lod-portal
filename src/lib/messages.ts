import { supabase } from "./supabase"
import type { TradeMessage } from "@/types"

/**
 * 거래 메시지 목록 조회
 */
export async function fetchTradeMessages(tradeId: string): Promise<TradeMessage[]> {
  const { data, error } = await supabase
    .from("trade_messages")
    .select(`
      *,
      sender:sender_id(id, discord_username, game_nickname, discord_avatar)
    `)
    .eq("trade_id", tradeId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data || []) as TradeMessage[]
}

/**
 * 메시지 전송
 */
export async function sendTradeMessage(tradeId: string, message: string): Promise<TradeMessage> {
  // 현재 사용자 가져오기
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다")

  const { data, error } = await supabase
    .from("trade_messages")
    .insert([{
      trade_id: tradeId,
      sender_id: user.id,  // 명시적으로 sender_id 설정
      message
    }])
    .select(`
      *,
      sender:sender_id(id, discord_username, game_nickname, discord_avatar)
    `)
    .single()

  if (error) {
    console.error("메시지 저장 실패:", error)
    throw error
  }

  return data as TradeMessage
}

/**
 * 메시지 읽음 처리
 */
export async function markMessagesAsRead(tradeId: string): Promise<void> {
  const { error } = await supabase
    .from("trade_messages")
    .update({ read: true })
    .eq("trade_id", tradeId)
    .neq("sender_id", (await supabase.auth.getUser()).data.user?.id || "")

  if (error) throw error
}

/**
 * 읽지 않은 메시지 개수 조회
 */
export async function getUnreadMessageCount(tradeId: string): Promise<number> {
  const { count, error } = await supabase
    .from("trade_messages")
    .select("*", { count: "exact", head: true })
    .eq("trade_id", tradeId)
    .eq("read", false)
    .neq("sender_id", (await supabase.auth.getUser()).data.user?.id || "")

  if (error) throw error
  return count || 0
}
