import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ClassBadge, JOB_CONFIG } from "@/components/game/ClassBadge"
import { cn } from "@/lib/utils"
import { usePartyData } from "@/hooks/usePartyData"
import type { JobClass, Party } from "@/types"
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
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
  type LucideIcon,
} from "lucide-react"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const JOB_CLASSES: JobClass[] = ["warrior", "rogue", "mage", "cleric", "taoist"]

const JOB_FILTER_OPTIONS: { value: JobClass | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "warrior", label: "전사" },
  { value: "rogue", label: "도적" },
  { value: "mage", label: "법사" },
  { value: "cleric", label: "직자" },
  { value: "taoist", label: "도가" },
]

const LOCATION_ICONS: Record<string, LucideIcon> = {
  성: Castle,
  궁: Building2,
  산: Mountain,
  설: Snowflake,
  숲: Trees,
  탑: TowerControl,
  광: Gem,
}

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

function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? "default" : "outline"}
          size="xs"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}

function StatsBar({ parties }: { parties: Party[] }) {
  const stats = useMemo(() => {
    const vacantParties = parties.filter((p) => !p.is_complete)
    const totalVacancies = vacantParties.reduce(
      (sum, p) => sum + p.vacancies.total,
      0,
    )
    const perClass = JOB_CLASSES.reduce(
      (acc, job) => {
        acc[job] = vacantParties.reduce(
          (sum, p) => sum + p.vacancies[job],
          0,
        )
        return acc
      },
      {} as Record<JobClass, number>,
    )

    return {
      total: parties.length,
      vacant: vacantParties.length,
      totalVacancies,
      perClass,
    }
  }, [parties])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">전체</span>
            <span className="text-sm font-semibold">{stats.total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-warning">빈자리</span>
            <span className="text-sm font-semibold">{stats.vacant}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">총 공석</span>
            <span className="text-sm font-semibold">{stats.totalVacancies}</span>
          </div>
          <div className="hidden h-4 w-px bg-border sm:block" />
          <div className="flex flex-wrap items-center gap-2">
            {JOB_CLASSES.map((job) =>
              stats.perClass[job] > 0 ? (
                <ClassBadge key={job} job={job} count={stats.perClass[job]} />
              ) : null,
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SlotRow({
  job,
  slots,
  vacancyCount,
}: {
  job: JobClass
  slots: string[]
  vacancyCount: number
}) {
  if (slots.length === 0 && vacancyCount === 0) return null

  const config = JOB_CONFIG[job]
  const totalSlots = slots.length + vacancyCount

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
        {slots.map((name, i) => (
          <Badge key={`${job}-filled-${i}`} variant="secondary" className="text-xs">
            {name}
          </Badge>
        ))}
        {Array.from({ length: vacancyCount }).map((_, i) => (
          <Badge
            key={`${job}-empty-${i}`}
            variant="outline"
            className={cn("border-dashed text-xs", config.textClass)}
          >
            공석
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

function PartyCard({ party }: { party: Party }) {
  const LocationIcon = getLocationIcon(party.location)
  const hasVacancy = !party.is_complete

  return (
    <Card className={cn(party.is_complete && "opacity-50")}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <LocationIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">{party.party_name || party.organizer}</CardTitle>
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
                <ClassBadge key={job} job={job} count={party.vacancies[job]} />
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
            />
          ))}
        </div>

        {/* Requirements */}
        <RequirementsSection requirements={party.requirements} />
      </CardContent>
    </Card>
  )
}

function TimeSlotGroup({
  timeSlot,
  parties,
}: {
  timeSlot: string
  parties: Party[]
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{timeSlot}</h3>
        <Badge variant="secondary" className="text-xs">
          {parties.length}
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {parties.map((party, idx) => (
          <PartyCard key={`${party.party_name}-${party.organizer}-${idx}`} party={party} />
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

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Inbox className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold">빈자리 없음</h3>
        <p className="text-sm text-muted-foreground">
          조건에 맞는 파티가 없습니다.
        </p>
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
  } = usePartyData()

  const [jobFilter, setJobFilter] = useState<JobClass | "all">("all")
  const [timeSlotFilter, setTimeSlotFilter] = useState("all")

  // Derive time slot options from data
  const timeSlotOptions = useMemo(() => {
    const slots = Array.from(new Set(allParties.map((p) => p.time_slot)))
      .sort()
      .map((slot) => ({ value: slot, label: slot }))
    return [{ value: "all", label: "전체" }, ...slots]
  }, [allParties])

  // Reset time slot filter when parties change
  const filteredParties = useMemo(() => {
    return allParties.filter((party) => {
      if (jobFilter !== "all" && party.vacancies[jobFilter] <= 0) {
        return false
      }
      if (timeSlotFilter !== "all" && party.time_slot !== timeSlotFilter) {
        return false
      }
      return true
    })
  }, [allParties, jobFilter, timeSlotFilter])

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

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <Card>
        <CardContent className="space-y-4 p-4">
          {/* Top row: date nav + refresh countdown + complete toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4">
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
                <span className="text-sm">완비 포함</span>
              </label>
            </div>
          </div>

          {/* Job filter */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              직업 필터
            </span>
            <FilterChips
              options={JOB_FILTER_OPTIONS}
              value={jobFilter}
              onChange={setJobFilter}
            />
          </div>

          {/* Time slot filter */}
          {timeSlotOptions.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                시간대 필터
              </span>
              <FilterChips
                options={timeSlotOptions}
                value={timeSlotFilter}
                onChange={setTimeSlotFilter}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats bar */}
      {!loading && !error && filteredParties.length > 0 && (
        <StatsBar parties={filteredParties} />
      )}

      {/* Content area */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filteredParties.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          {groupedByTimeSlot.map(([timeSlot, parties]) => (
            <TimeSlotGroup
              key={timeSlot}
              timeSlot={timeSlot}
              parties={parties}
            />
          ))}
        </div>
      )}
    </div>
  )
}
