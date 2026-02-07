import { JOB_CONFIG } from "@/components/game/ClassBadge"
import type { JobClass, Party, RecruitType } from "@/types"

/** 5개 직업 클래스 순서 배열 */
export const JOB_CLASSES: JobClass[] = ["warrior", "rogue", "mage", "cleric", "taoist"]

/** 드롭다운/Select용 직업 옵션 배열 */
export const JOB_OPTIONS = JOB_CLASSES.map((job) => ({
  value: job,
  label: JOB_CONFIG[job].kr,
}))

/** 모집 유형 설정 */
export const RECRUIT_TYPE_CONFIG: Record<RecruitType, { label: string; icon: string; description: string }> = {
  party: { label: "파티 모집", icon: "Users", description: "일반 파티 모집" },
  guild_war: { label: "길드대전", icon: "Swords", description: "길드대전 참가 인원 모집" },
  chaos_tower: { label: "혼돈의탑", icon: "Castle", description: "혼돈의탑 공략 인원 모집" },
}

export const RECRUIT_TYPES: RecruitType[] = ["party", "guild_war", "chaos_tower"]

/** 파티 슬롯 타입 안전 접근 헬퍼 */
export function getPartySlots(party: Party, job: JobClass): string[] {
  const key = `${job}_slots` as keyof Party
  const slots = party[key]
  return Array.isArray(slots) ? slots : []
}
