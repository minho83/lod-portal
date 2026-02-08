import { supabase } from "@/lib/supabase"
import type { Notification, NotificationType } from "@/types"

export interface CreateNotificationInput {
  user_id: string
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * 알람 생성
 */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: input.user_id,
    type: input.type,
    title: input.title,
    message: input.message,
    link: input.link || null,
  })

  if (error) throw error
}

/**
 * 내 알람 목록 조회
 */
export async function getNotifications(limit = 20): Promise<Notification[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data as Notification[]) || []
}

/**
 * 읽지 않은 알람 개수
 */
export async function getUnreadCount(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false)

  if (error) throw error
  return count || 0
}

/**
 * 알람 읽음 처리
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)

  if (error) throw error
}

/**
 * 모든 알람 읽음 처리
 */
export async function markAllAsRead(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false)

  if (error) throw error
}

/**
 * 알람 삭제
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)

  if (error) throw error
}

/**
 * 모든 알람 삭제
 */
export async function deleteAllNotifications(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("user_id", user.id)

  if (error) throw error
}
