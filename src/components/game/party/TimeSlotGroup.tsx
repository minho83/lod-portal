import { Badge } from "@/components/ui/badge"
import { PartyCard } from "@/components/game/party/PartyCard"
import type { Party } from "@/types"

export function TimeSlotGroup({
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
