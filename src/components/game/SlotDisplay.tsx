import { cn } from "@/lib/utils"
import { JOB_CONFIG } from "@/components/game/ClassBadge"
import type { JobClass, JobSlots, PartyMember } from "@/types"

const JOB_ORDER: JobClass[] = ["warrior", "rogue", "mage", "cleric", "taoist"]

interface SlotDisplayProps {
  jobSlots: JobSlots
  members?: PartyMember[]
  compact?: boolean
  className?: string
}

export function SlotDisplay({ jobSlots, members = [], compact = false, className }: SlotDisplayProps) {
  const acceptedMembers = members.filter((m) => m.status === "accepted")

  return (
    <div className={cn("space-y-1.5", className)}>
      {JOB_ORDER.map((job) => {
        const total = jobSlots[job]
        if (total <= 0) return null

        const filled = acceptedMembers.filter((m) => m.job_class === job)
        const vacancies = total - filled.length

        const config = JOB_CONFIG[job]

        return (
          <div key={job} className="flex items-center gap-2">
            <span
              className={cn(
                "w-7 shrink-0 text-xs font-semibold",
                config.textClass,
              )}
            >
              {config.kr}
            </span>
            <div className="flex flex-wrap gap-1">
              {filled.map((m) => (
                <span
                  key={m.id}
                  className="rounded-md bg-secondary px-2 py-0.5 text-xs"
                >
                  {m.character_name}
                </span>
              ))}
              {Array.from({ length: vacancies }).map((_, i) => (
                <span
                  key={`v-${i}`}
                  className={cn(
                    "rounded-md border border-dashed px-2 py-0.5 text-xs",
                    config.textClass,
                    "border-current opacity-60",
                  )}
                >
                  {compact ? "?" : "모집중"}
                </span>
              ))}
            </div>
            <span className="ml-auto text-xs text-muted-foreground">
              {filled.length}/{total}
            </span>
          </div>
        )
      })}
    </div>
  )
}
