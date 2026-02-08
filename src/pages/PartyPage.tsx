import { useCallback, useMemo, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { JOB_CONFIG } from "@/components/game/ClassBadge"
import { EmptyState } from "@/components/game/EmptyState"
import { ErrorState } from "@/components/game/ErrorState"
import { DateNav } from "@/components/game/party/DateNav"
import { CopyButton } from "@/components/game/party/CopyButton"
import { TimeSlotGroup } from "@/components/game/party/TimeSlotGroup"
import { LoadingSkeleton } from "@/components/game/party/LoadingSkeleton"
import { BLANK_TEMPLATE } from "@/lib/party-utils"
import { JOB_CLASSES, getPartySlots } from "@/lib/constants"
import { usePartyData } from "@/hooks/usePartyData"
import type { JobClass, Party } from "@/types"
import { RefreshCw, Copy, Search, X } from "lucide-react"

export function PartyPage() {
  const {
    allParties,
    dateDisplay,
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
          const slots = getPartySlots(party, job)
          return slots.some((s) => s && s.toLowerCase().includes(name))
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
            <span className="text-xs font-semibold text-muted-foreground">직업</span>
            <Select value={jobFilter || "__all__"} onValueChange={(v) => setJobFilter(v === "__all__" ? "" : v as JobClass)}>
              <SelectTrigger className="h-8 w-auto min-w-24 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {jobFilterOptions.map((opt) => (
                  <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-xs font-semibold text-muted-foreground">시간</span>
            <Select value={timeSlotFilter || "__all__"} onValueChange={(v) => setTimeSlotFilter(v === "__all__" ? "" : v)}>
              <SelectTrigger className="h-8 w-auto min-w-24 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeSlotOptions.map((opt) => (
                  <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
      {loading && allParties.length === 0 ? (
        <LoadingSkeleton />
      ) : error && allParties.length === 0 ? (
        <ErrorState message={error} onRetry={retry} />
      ) : filteredParties.length === 0 ? (
        <EmptyState
          title="파티 없음"
          description={activeSearch ? `"${activeSearch}" 님이 참여중인 파티가 없습니다.` : "조건에 맞는 파티가 없습니다."}
        />
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
