import { useCallback, useMemo, useRef, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { JOB_CONFIG } from "@/components/game/ClassBadge"
import { cn } from "@/lib/utils"
import { usePartyData } from "@/hooks/usePartyData"
import type { JobClass, Party } from "@/types"
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Inbox,
  Castle,
  Building2,
  Mountain,
  Snowflake,
  Trees,
  TowerControl,
  Gem,
  MapPin,
  Clock,
  User,
  Copy,
  Check,
  ClipboardCopy,
  Search,
  X,
  type LucideIcon,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const JOB_CLASSES: JobClass[] = ["warrior", "rogue", "mage", "cleric", "taoist"]

const LOCATION_ICONS: Record<string, LucideIcon> = {
  성: Castle,
  궁: Building2,
  산: Mountain,
  설: Snowflake,
  숲: Trees,
  탑: TowerControl,
  광: Gem,
}

const BLANK_TEMPLATE = [
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

function getLocationIcon(location: string | null): LucideIcon {
  if (!location) return MapPin
  for (const [key, icon] of Object.entries(LOCATION_ICONS)) {
    if (location.includes(key)) return icon
  }
  return MapPin
}

// ---------------------------------------------------------------------------
// Time-ago utility
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }),
  )
  const updated = new Date(dateStr)
  const diffMs = now.getTime() - updated.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return "방금 전"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay}일 전`
}

// ---------------------------------------------------------------------------
// Copy helper
// ---------------------------------------------------------------------------

async function copyToClipboard(text: string): Promise<boolean> {
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

function generatePartyTemplate(party: Party, currentDate: Date): string {
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
    const slots = party[`${job}_slots`] as string[]
    if (!slots || slots.length === 0) continue
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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DateNav({
  dateDisplay,
  isToday,
  onPrev,
  onNext,
}: {
  dateDisplay: string
  isToday: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon-sm" onClick={onPrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-28 text-center text-sm font-semibold">
        {dateDisplay}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={onNext}
        disabled={isToday}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function CopyButton({
  text,
  label,
  copiedLabel,
  variant = "outline",
  size = "xs",
  className,
  icon: Icon = Copy,
}: {
  text: string
  label: string
  copiedLabel?: string
  variant?: "outline" | "secondary" | "default"
  size?: "xs" | "sm"
  className?: string
  icon?: LucideIcon
}) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant={copied ? "default" : variant}
      size={size}
      onClick={handleCopy}
      className={cn(copied && "bg-success text-success-foreground hover:bg-success", className)}
    >
      {copied ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
      {copied ? (copiedLabel ?? "복사됨!") : label}
    </Button>
  )
}

function SlotRow({
  job,
  slots,
  vacancyCount,
  searchName,
}: {
  job: JobClass
  slots: string[]
  vacancyCount: number
  searchName: string
}) {
  if (slots.length === 0 && vacancyCount === 0) return null

  const config = JOB_CONFIG[job]
  const totalSlots = slots.length + vacancyCount
  const search = searchName.toLowerCase()

  return (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          "mt-0.5 w-8 shrink-0 text-xs font-semibold",
          config.textClass,
        )}
      >
        {config.kr}
      </span>
      <div className="flex flex-wrap gap-1">
        {slots.map((name, i) => {
          const isMySlot = search && name.toLowerCase().includes(search)
          return (
            <Badge
              key={`${job}-filled-${i}`}
              variant="secondary"
              className={cn(
                "text-xs",
                isMySlot && "border-primary bg-primary/20 font-bold text-primary",
              )}
            >
              {name}
            </Badge>
          )
        })}
        {Array.from({ length: vacancyCount }).map((_, i) => (
          <Badge
            key={`${job}-empty-${i}`}
            variant="outline"
            className={cn("border-dashed text-xs", config.textClass)}
          >
            모집중
          </Badge>
        ))}
        <span className="ml-1 self-center text-xs text-muted-foreground">
          {slots.length}/{totalSlots}
        </span>
      </div>
    </div>
  )
}

function RequirementsSection({
  requirements,
}: {
  requirements: Record<string, string>
}) {
  const entries = Object.entries(requirements)
  if (entries.length === 0) return null

  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-muted-foreground">요구사항</span>
      <div className="flex flex-wrap gap-1.5">
        {entries.map(([key, value]) => (
          <Badge key={key} variant="secondary" className="text-xs">
            {key}: {value}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function PartyCard({
  party,
  searchName,
  currentDate,
}: {
  party: Party
  searchName: string
  currentDate: Date
}) {
  const LocationIcon = getLocationIcon(party.location)
  const hasVacancy = !party.is_complete
  const search = searchName.toLowerCase()

  const isMyParty = useMemo(() => {
    if (!search) return false
    return JOB_CLASSES.some((job) => {
      const slots = party[`${job}_slots`] as string[]
      return slots?.some((s) => s && s.toLowerCase().includes(search))
    })
  }, [party, search])

  const templateText = useMemo(
    () => generatePartyTemplate(party, currentDate),
    [party, currentDate],
  )

  return (
    <Card
      className={cn(
        party.is_complete && "opacity-50",
        isMyParty && "border-primary shadow-[0_0_0_1px_var(--color-primary)]",
      )}
    >
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <LocationIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">
                  {party.party_name || party.organizer}
                </CardTitle>
                {isMyParty && (
                  <Badge variant="outline" className="text-primary text-[10px] px-1.5 py-0">
                    참여중
                  </Badge>
                )}
              </div>
              {party.location && (
                <span className="text-xs text-muted-foreground">
                  {party.location}
                </span>
              )}
            </div>
          </div>
          {hasVacancy ? (
            <Badge variant="outline" className="text-warning shrink-0">
              {party.vacancies.total}자리
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-success shrink-0">
              완비
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-3">
        {/* Organizer & time */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {party.organizer}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(party.updated_at)}
          </span>
        </div>

        {/* Vacancy class badges */}
        {hasVacancy && (
          <div className="flex flex-wrap gap-1.5">
            {JOB_CLASSES.map((job) =>
              party.vacancies[job] > 0 ? (
                <Badge
                  key={job}
                  className={cn(
                    "text-xs",
                    JOB_CONFIG[job].bgClass,
                    JOB_CONFIG[job].textClass,
                  )}
                >
                  {JOB_CONFIG[job].kr} {party.vacancies[job]}자리
                </Badge>
              ) : null,
            )}
          </div>
        )}

        {/* Slot rows */}
        <div className="space-y-1.5">
          {JOB_CLASSES.map((job) => (
            <SlotRow
              key={job}
              job={job}
              slots={party[`${job}_slots` as keyof Party] as string[]}
              vacancyCount={party.vacancies[job]}
              searchName={searchName}
            />
          ))}
        </div>

        {/* Requirements */}
        <RequirementsSection requirements={party.requirements} />

        {/* Copy button */}
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <CopyButton
            text={templateText}
            label="구인글 복사"
            icon={ClipboardCopy}
            variant="outline"
            size="xs"
          />
          <span className="text-[11px] text-muted-foreground opacity-60">
            카카오톡에 붙여넣기
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function TimeSlotGroup({
  timeSlot,
  parties,
  searchName,
  currentDate,
}: {
  timeSlot: string
  parties: Party[]
  searchName: string
  currentDate: Date
}) {
  const vacantCount = parties.filter((p) => (p.vacancies?.total || 0) > 0).length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-border pb-2">
        <Badge className="bg-gradient-to-r from-primary to-purple-500 text-sm font-bold text-white">
          {timeSlot}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {parties.length}개 파티
          {vacantCount > 0 && ` · ${vacantCount}개 빈자리`}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parties.map((party, idx) => (
          <PartyCard
            key={`${party.party_name}-${party.organizer}-${idx}`}
            party={party}
            searchName={searchName}
            currentDate={currentDate}
          />
        ))}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-3 w-24" />
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ searchName }: { searchName: string }) {
  const message = searchName
    ? `"${searchName}" 님이 참여중인 파티가 없습니다.`
    : "조건에 맞는 파티가 없습니다."

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Inbox className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold">파티 없음</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
        <AlertCircle className="h-12 w-12 text-destructive/50" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">오류 발생</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </Button>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export function PartyPage() {
  const {
    allParties,
    dateDisplay,
    isToday,
    loading,
    error,
    countdown,
    includeComplete,
    setIncludeComplete,
    changeDate,
    retry,
    currentDate,
  } = usePartyData()

  const [jobFilter, setJobFilter] = useState<JobClass | "">("")
  const [timeSlotFilter, setTimeSlotFilter] = useState("")
  const [searchName, setSearchName] = useState(
    () => localStorage.getItem("myCharName") || "",
  )
  const [activeSearch, setActiveSearch] = useState(
    () => localStorage.getItem("myCharName") || "",
  )
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Job filter options with counts
  const jobFilterOptions = useMemo(() => {
    const totalVacant = allParties.filter((p) => (p.vacancies?.total || 0) > 0).length
    const options: { value: string; label: string }[] = [
      { value: "", label: `전체 (${totalVacant})` },
    ]
    for (const job of JOB_CLASSES) {
      const count = allParties.reduce((sum, p) => sum + (p.vacancies?.[job] || 0), 0)
      const countStr = count > 0 ? ` (${count})` : ""
      options.push({ value: job, label: `${JOB_CONFIG[job].kr}${countStr}` })
    }
    return options
  }, [allParties])

  // Time slot options with counts
  const timeSlotOptions = useMemo(() => {
    const slots = Array.from(new Set(allParties.map((p) => p.time_slot))).sort()
    const options: { value: string; label: string }[] = [
      { value: "", label: "전체 시간" },
    ]
    for (const t of slots) {
      const timeParties = allParties.filter((p) => p.time_slot === t)
      const vacantCount = timeParties.reduce((sum, p) => sum + (p.vacancies?.total || 0), 0)
      const countStr = vacantCount > 0 ? ` (${vacantCount})` : ""
      options.push({ value: t, label: `${t}${countStr}` })
    }
    return options
  }, [allParties])

  // Filter
  const filteredParties = useMemo(() => {
    return allParties.filter((party) => {
      if (jobFilter && party.vacancies[jobFilter as JobClass] <= 0) return false
      if (timeSlotFilter && party.time_slot !== timeSlotFilter) return false
      if (activeSearch) {
        const name = activeSearch.toLowerCase()
        const found = JOB_CLASSES.some((job) => {
          const slots = party[`${job}_slots`] as string[]
          return slots?.some((s) => s && s.toLowerCase().includes(name))
        })
        if (!found) return false
      }
      return true
    })
  }, [allParties, jobFilter, timeSlotFilter, activeSearch])

  // Group by time slot
  const groupedByTimeSlot = useMemo(() => {
    const groups: Record<string, Party[]> = {}
    for (const party of filteredParties) {
      const slot = party.time_slot
      if (!groups[slot]) groups[slot] = []
      groups[slot].push(party)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredParties])

  const handleSearch = useCallback(() => {
    const name = searchName.trim()
    if (!name) return
    setActiveSearch(name)
    localStorage.setItem("myCharName", name)
  }, [searchName])

  const handleClearSearch = useCallback(() => {
    setSearchName("")
    setActiveSearch("")
    localStorage.removeItem("myCharName")
    searchInputRef.current?.focus()
  }, [])

  // Enter key on search input
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch()
    },
    [handleSearch],
  )

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <Card>
        <CardContent className="space-y-3 p-4">
          {/* Top row: date nav + refresh + complete toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <DateNav
              dateDisplay={dateDisplay}
              isToday={isToday}
              onPrev={() => changeDate(-1)}
              onNext={() => changeDate(1)}
            />
            <div className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground">
                <RefreshCw className="mr-1 inline-block h-3 w-3" />
                {countdown}초
              </span>
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={includeComplete}
                  onCheckedChange={(checked) =>
                    setIncludeComplete(checked === true)
                  }
                />
                <span className="text-sm">완비</span>
              </label>
            </div>
          </div>

          {/* Filter row: dropdowns + search + template */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground">직업</span>
            <select
              className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none transition-colors hover:border-primary focus:border-primary"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value as JobClass | "")}
            >
              {jobFilterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <span className="text-[11px] font-semibold text-muted-foreground">시간</span>
            <select
              className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none transition-colors hover:border-primary focus:border-primary"
              value={timeSlotFilter}
              onChange={(e) => setTimeSlotFilter(e.target.value)}
            >
              {timeSlotOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="flex-1" />

            {/* My party search */}
            <div className="flex items-center gap-1">
              <Input
                ref={searchInputRef}
                className="h-8 w-24 text-xs sm:w-28"
                placeholder="캐릭터명"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={handleSearchKeyDown}
              />
              <Button size="xs" onClick={handleSearch}>
                <Search className="h-3 w-3" />
                내파티
              </Button>
              {activeSearch && (
                <Button size="icon-xs" variant="ghost" onClick={handleClearSearch}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Blank template copy */}
            <CopyButton
              text={BLANK_TEMPLATE}
              label="기본양식"
              icon={Copy}
              variant="default"
              size="xs"
              className="bg-gradient-to-r from-primary to-purple-500 text-white hover:opacity-90"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content area */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filteredParties.length === 0 ? (
        <EmptyState searchName={activeSearch} />
      ) : (
        <div className="space-y-6">
          {groupedByTimeSlot.map(([timeSlot, parties]) => (
            <TimeSlotGroup
              key={timeSlot}
              timeSlot={timeSlot}
              parties={parties}
              searchName={activeSearch}
              currentDate={currentDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
