import { JOB_CONFIG } from "@/components/game/ClassBadge"
import type { JobClass, Party } from "@/types"

/** 5개 직업 클래스 순서 배열 */
export const JOB_CLASSES: JobClass[] = ["warrior", "rogue", "mage", "cleric", "taoist"]

/** 드롭다운/Select용 직업 옵션 배열 */
export const JOB_OPTIONS = JOB_CLASSES.map((job) => ({
  value: job,
  label: JOB_CONFIG[job].kr,
}))

/** 파티 슬롯 타입 안전 접근 헬퍼 */
export function getPartySlots(party: Party, job: JobClass): string[] {
  const key = `${job}_slots` as keyof Party
  const slots = party[key]
  return Array.isArray(slots) ? slots : []
}
