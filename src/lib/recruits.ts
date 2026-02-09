import { supabase } from "@/lib/supabase"
import type {
  PartyRecruit,
  PartyMember,
  RecruitType,
  RecruitJoinMode,
  RecruitStatus,
  MemberStatus,
  JobClass,
  JobSlots,
} from "@/types"

export interface RecruitFilters {
  keyword?: string
  recruitType?: RecruitType
  status?: RecruitStatus
  joinMode?: RecruitJoinMode
  jobClass?: JobClass
  location?: string
  scheduledDate?: string // YYYY-MM-DD 형식
}

export interface RecruitListResult {
  data: PartyRecruit[]
  count: number
}

const PAGE_SIZE = 12

const RECRUIT_SELECT = "*, author:profiles!party_recruits_author_profile_fkey(*)"

export async function fetchRecruits(
  filters: RecruitFilters = {},
  page = 1,
): Promise<RecruitListResult> {
  let query = supabase
    .from("party_recruits")
    .select(RECRUIT_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })

  if (filters.recruitType) {
    query = query.eq("recruit_type", filters.recruitType)
  }

  if (filters.status) {
    query = query.eq("status", filters.status)
  } else {
    query = query.in("status", ["open", "full"])
  }

  if (filters.joinMode) {
    query = query.eq("join_mode", filters.joinMode)
  }

  if (filters.keyword) {
    query = query.ilike("title", `%${filters.keyword}%`)
  }

  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`)
  }

  if (filters.jobClass) {
    query = query.gt(`job_slots->>${filters.jobClass}`, 0)
  }

  if (filters.scheduledDate) {
    // 선택한 날짜의 00:00:00 ~ 23:59:59 범위로 필터링
    const startOfDay = `${filters.scheduledDate}T00:00:00.000Z`
    const endOfDay = `${filters.scheduledDate}T23:59:59.999Z`
    query = query.gte("scheduled_at", startOfDay).lte("scheduled_at", endOfDay)
  }

  const offset = (page - 1) * PAGE_SIZE
  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data, count, error } = await query

  if (error) throw error

  return {
    data: (data as PartyRecruit[]) ?? [],
    count: count ?? 0,
  }
}

const RECRUIT_DETAIL_SELECT =
  "*, author:profiles!party_recruits_author_profile_fkey(*), members:party_members(*, user:profiles!party_members_user_profile_fkey(*))"

export async function fetchRecruitById(id: string): Promise<PartyRecruit | null> {
  const { data, error } = await supabase
    .from("party_recruits")
    .select(RECRUIT_DETAIL_SELECT)
    .eq("id", id)
    .single()

  if (error) return null
  return data as PartyRecruit
}

export interface CreateRecruitInput {
  title: string
  description?: string
  location?: string
  scheduled_at?: string
  end_time?: string
  join_mode: RecruitJoinMode
  job_slots: JobSlots
  recruit_type?: RecruitType
}

export async function createRecruit(
  input: CreateRecruitInput,
  leader?: { name: string; jobClass: JobClass },
): Promise<PartyRecruit> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error("로그인이 필요합니다.")

  const maxMembers = Object.values(input.job_slots).reduce((a, b) => a + b, 0)

  // 1. 모집글 생성
  const { data: recruit, error: recruitError } = await supabase
    .from("party_recruits")
    .insert({
      author_id: session.user.id,
      title: input.title,
      description: input.description || null,
      location: input.location || null,
      scheduled_at: input.scheduled_at || null,
      end_time: input.end_time || null,
      join_mode: input.join_mode,
      job_slots: input.job_slots,
      max_members: maxMembers,
      recruit_type: input.recruit_type || "party",
    })
    .select(RECRUIT_SELECT)
    .single()

  if (recruitError) throw recruitError

  // 2. 리더가 파티에 참여하는 경우 멤버로 등록
  if (leader) {
    const { error: memberError } = await supabase.from("party_members").insert({
      recruit_id: recruit.id,
      user_id: session.user.id,
      role: "leader",
      job_class: leader.jobClass,
      status: "accepted",
      character_name: leader.name,
    })

    if (memberError) throw memberError
  }

  return recruit as PartyRecruit
}

export type UpdateRecruitInput = Partial<
  Pick<CreateRecruitInput, "title" | "description" | "location" | "scheduled_at" | "end_time" | "join_mode" | "job_slots">
>

export async function updateRecruit(
  id: string,
  input: UpdateRecruitInput,
): Promise<void> {
  const update: Record<string, unknown> = { ...input }

  // job_slots 변경 시 max_members도 재계산
  if (input.job_slots) {
    update.max_members = Object.values(input.job_slots).reduce((a, b) => a + b, 0)
  }

  const { error } = await supabase
    .from("party_recruits")
    .update(update)
    .eq("id", id)

  if (error) throw error
}

export async function updateRecruitStatus(
  id: string,
  status: RecruitStatus,
): Promise<void> {
  const { error } = await supabase
    .from("party_recruits")
    .update({ status })
    .eq("id", id)

  if (error) throw error
}

export async function applyToRecruit(
  recruitId: string,
  jobClass: JobClass,
  characterName: string,
  joinMode: RecruitJoinMode,
): Promise<PartyMember> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error("로그인이 필요합니다.")

  const status: MemberStatus = joinMode === "first_come" ? "accepted" : "pending"

  const { data, error } = await supabase
    .from("party_members")
    .insert({
      recruit_id: recruitId,
      user_id: session.user.id,
      role: "member",
      job_class: jobClass,
      status,
      character_name: characterName,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 신청한 파티입니다.")
    }
    if (error.code === "P0001" || error.message?.includes("블랙리스트")) {
      throw new Error("파티장의 블랙리스트에 등록되어 신청할 수 없습니다.")
    }
    throw error
  }

  return data as PartyMember
}

export async function handleApplication(
  memberId: string,
  status: "accepted" | "rejected" | "kicked",
): Promise<void> {
  const { error } = await supabase
    .from("party_members")
    .update({ status })
    .eq("id", memberId)

  if (error) throw error
}

export async function leaveRecruit(memberId: string): Promise<void> {
  const { error } = await supabase
    .from("party_members")
    .update({ status: "left" as MemberStatus })
    .eq("id", memberId)

  if (error) throw error
}

/**
 * 마지막 파티모집 등록 시간 조회 (도배 방지)
 */
export async function getLastRecruitTime(): Promise<Date | null> {
  const { data, error } = await supabase
    .from("party_recruits")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return new Date(data.created_at)
}

/**
 * 내 모집글 목록 조회 (모집 목록 상단 고정용)
 */
export async function fetchMyActiveRecruits(userId: string): Promise<PartyRecruit[]> {
  const { data, error } = await supabase
    .from("party_recruits")
    .select(RECRUIT_SELECT)
    .eq("author_id", userId)
    .in("status", ["open", "full"])
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as PartyRecruit[]) ?? []
}

/**
 * 내 파티 참여 목록 조회 (참가 상태 뱃지용)
 */
export async function fetchMyMemberships(userId: string): Promise<PartyMember[]> {
  const { data, error } = await supabase
    .from("party_members")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["accepted", "pending"])

  if (error) throw error
  return (data as PartyMember[]) ?? []
}

export { PAGE_SIZE }
