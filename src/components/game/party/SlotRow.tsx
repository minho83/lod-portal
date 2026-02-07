import { Badge } from "@/components/ui/badge"
import { JOB_CONFIG } from "@/components/game/ClassBadge"
import { cn } from "@/lib/utils"
import type { JobClass } from "@/types"

export function SlotRow({
  job,
  slots,
  searchName,
}: {
  job: JobClass
  slots: string[]
  searchName: string
}) {
  if (!slots || slots.length === 0) return null

  const config = JOB_CONFIG[job]
  const search = searchName.toLowerCase()
  const filledCount = slots.filter((s) => s !== "").length

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
          if (name === "") {
            return (
              <Badge
                key={`${job}-empty-${i}`}
                variant="outline"
                className={cn("border-dashed text-xs", config.textClass)}
              >
                모집중
              </Badge>
            )
          }
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
        <span className="ml-1 self-center text-xs text-muted-foreground">
          {filledCount}/{slots.length}
        </span>
      </div>
    </div>
  )
}

export function RequirementsSection({
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
