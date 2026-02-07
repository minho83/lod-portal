import { supabase } from "@/lib/supabase"
import type { BlacklistEntry } from "@/types"

export async function fetchBlacklist(): Promise<BlacklistEntry[]> {
  const { data, error } = await supabase
    .from("user_blacklist")
    .select("*, blocked_user:profiles!user_blacklist_blocked_user_id_fkey(*)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as BlacklistEntry[]) ?? []
}

export async function addToBlacklist(
  blockedUserId: string,
  reason?: string,
): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error("로그인이 필요합니다.")

  const { error } = await supabase.from("user_blacklist").insert({
    user_id: session.user.id,
    blocked_user_id: blockedUserId,
    reason: reason || null,
  })

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 블랙리스트에 등록된 유저입니다.")
    }
    throw error
  }
}

export async function removeFromBlacklist(entryId: string): Promise<void> {
  const { error } = await supabase
    .from("user_blacklist")
    .delete()
    .eq("id", entryId)

  if (error) throw error
}

export async function checkBlacklisted(
  authorId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_blacklisted", {
    p_author_id: authorId,
    p_user_id: userId,
  })

  if (error) return false
  return data as boolean
}
