import { supabase } from "@/lib/supabase"
import type {
  PartyRecruit,
  PartyMember,
  RecruitJoinMode,
  RecruitStatus,
  MemberStatus,
  JobClass,
  JobSlots,
} from "@/types"

export interface RecruitFilters {
  keyword?: string
  status?: RecruitStatus
  joinMode?: RecruitJoinMode
  jobClass?: JobClass
  location?: string
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
  join_mode: RecruitJoinMode
  job_slots: JobSlots
}

export async function createRecruit(
  input: CreateRecruitInput,
  leaderName: string,
  leaderClass: JobClass,
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
      join_mode: input.join_mode,
      job_slots: input.job_slots,
      max_members: maxMembers,
    })
    .select(RECRUIT_SELECT)
    .single()

  if (recruitError) throw recruitError

  // 2. 리더를 멤버로 자동 등록
  const { error: memberError } = await supabase.from("party_members").insert({
    recruit_id: recruit.id,
    user_id: session.user.id,
    role: "leader",
    job_class: leaderClass,
    status: "accepted",
    character_name: leaderName,
  })

  if (memberError) throw memberError

  return recruit as PartyRecruit
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

export { PAGE_SIZE }
