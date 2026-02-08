/**
 * 파티모집 템플릿 관리
 */

import { supabase } from "./supabase"
import type { PartyTemplate, JobSlots, RecruitType, RecruitJoinMode } from "@/types"

/**
 * 내 템플릿 목록 조회
 */
export async function getMyTemplates(): Promise<PartyTemplate[]> {
  const { data, error } = await supabase
    .from("party_templates")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as PartyTemplate[]
}

/**
 * 템플릿 생성 (최대 5개 제한)
 */
export async function createTemplate(template: {
  template_name: string
  recruit_type: RecruitType
  location: string | null
  join_mode: RecruitJoinMode
  slots: JobSlots
  description: string | null
}): Promise<PartyTemplate> {
  // 5개 제한 확인
  const { count, error: countError } = await supabase
    .from("party_templates")
    .select("*", { count: "exact", head: true })

  if (countError) throw countError

  if (count !== null && count >= 5) {
    throw new Error("템플릿은 최대 5개까지만 저장할 수 있습니다. 기존 템플릿을 삭제 후 다시 시도하세요.")
  }

  // 템플릿 생성
  const { data, error } = await supabase
    .from("party_templates")
    .insert([template])
    .select()
    .single()

  if (error) throw error
  return data as PartyTemplate
}

/**
 * 템플릿 수정
 */
export async function updateTemplate(
  id: string,
  updates: Partial<Omit<PartyTemplate, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<PartyTemplate> {
  const { data, error } = await supabase
    .from("party_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as PartyTemplate
}

/**
 * 템플릿 삭제
 */
export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from("party_templates").delete().eq("id", id)

  if (error) throw error
}
