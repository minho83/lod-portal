import { useMemo } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { JOB_CONFIG } from "@/components/game/ClassBadge"
import { SlotRow, RequirementsSection } from "@/components/game/party/SlotRow"
import { CopyButton } from "@/components/game/party/CopyButton"
import { getLocationIcon, generatePartyTemplate } from "@/lib/party-utils"
import { cn, timeAgo } from "@/lib/utils"
import { JOB_CLASSES, getPartySlots } from "@/lib/constants"
import type { Party } from "@/types"
import { Clock, User, ClipboardCopy } from "lucide-react"

export function PartyCard({
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
      const slots = getPartySlots(party, job)
      return slots.some((s) => s && s.toLowerCase().includes(search))
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
      <CardHeader className="p-2 pb-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <LocationIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">
                  {party.party_name || party.organizer}
                </CardTitle>
                {isMyParty && (
                  <Badge variant="outline" className="text-primary text-sm px-1.5 py-0">
                    참여중
                  </Badge>
                )}
              </div>
              {party.location && (
                <span className="text-sm text-muted-foreground">
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
      <CardContent className="space-y-1.5 p-2 pt-1.5">
        {/* Organizer & time */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {party.organizer}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
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
                    "text-sm",
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
        <div className="space-y-0.5">
          {JOB_CLASSES.map((job) => (
            <SlotRow
              key={job}
              job={job}
              slots={getPartySlots(party, job)}
              searchName={searchName}
            />
          ))}
        </div>

        {/* Requirements */}
        <RequirementsSection requirements={party.requirements} />

        {/* Copy button */}
        <div className="flex items-center gap-2 border-t border-border pt-1.5">
          <CopyButton
            text={templateText}
            label="구인글 복사"
            icon={ClipboardCopy}
            variant="outline"
            size="xs"
          />
          <span className="text-sm text-muted-foreground opacity-60">
            카카오톡에 붙여넣기
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
