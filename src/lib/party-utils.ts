import { JOB_CONFIG } from "@/components/game/ClassBadge"
import { JOB_CLASSES, getPartySlots } from "@/lib/constants"
import type { Party } from "@/types"
import {
  Castle,
  Building2,
  Mountain,
  Snowflake,
  Trees,
  TowerControl,
  Gem,
  MapPin,
  type LucideIcon,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const LOCATION_ICONS: Record<string, LucideIcon> = {
  성: Castle,
  궁: Building2,
  산: Mountain,
  설: Snowflake,
  숲: Trees,
  탑: TowerControl,
  광: Gem,
}

export const BLANK_TEMPLATE = [
  "★장소 파티명★",
  "#데빌 조건입력",
  "#도적 조건입력",
  "#도가 조건입력",
  "#법사 조건입력",
  "#직자 조건입력",
  "",
  "날짜(요일) #00:00~00:00 (장소)",
  "전사 : [][]",
  "도적 : [][]",
  "도가 : [][]",
  "법사 : [][]",
  "직자 : [][][]",
  "",
  "@아이디",
].join("\n")

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getLocationIcon(location: string | null): LucideIcon {
  if (!location) return MapPin
  for (const [key, icon] of Object.entries(LOCATION_ICONS)) {
    if (location.includes(key)) return icon
  }
  return MapPin
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.cssText = "position:fixed;opacity:0"
    document.body.appendChild(ta)
    ta.select()
    document.execCommand("copy")
    document.body.removeChild(ta)
    return true
  }
}

export function generatePartyTemplate(party: Party, currentDate: Date): string {
  const loc = party.location || ""
  const time = party.time_slot || ""

  const month = currentDate.getMonth() + 1
  const day = currentDate.getDate()
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"]
  const dateStr = `${month}/${day}(${dayNames[currentDate.getDay()]})`

  const lines: string[] = []

  const titleParts = [loc, party.party_name].filter(Boolean).join(" ")
  if (titleParts) lines.push(`★${titleParts}★`)

  const reqs = party.requirements || {}
  if (Object.keys(reqs).length > 0) {
    for (const [job, req] of Object.entries(reqs)) {
      lines.push(`#${job} ${req}`)
    }
  }

  if (lines.length > 0) lines.push("")
  const timePart = time ? ` #${time}` : ""
  const locPart = loc ? ` (${loc})` : ""
  lines.push(`${dateStr}${timePart}${locPart}`)

  for (const job of JOB_CLASSES) {
    const slots = getPartySlots(party, job)
    if (slots.length === 0) continue
    const jobKr = JOB_CONFIG[job].kr
    const slotStr = slots.map((s) => (s === "" ? "[]" : `[${s}]`)).join("")
    lines.push(`${jobKr} : ${slotStr}`)
  }

  const organizer =
    party.organizer || (party.sender_name ? party.sender_name.split("/")[0] : "")
  lines.push("")
  lines.push(`@${organizer || "아이디"}`)

  return lines.join("\n")
}
