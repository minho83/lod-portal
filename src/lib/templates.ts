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
 * 템플릿 생성
 */
export async function createTemplate(template: {
  template_name: string
  recruit_type: RecruitType
  location: string | null
  join_mode: RecruitJoinMode
  slots: JobSlots
  description: string | null
}): Promise<PartyTemplate> {
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
