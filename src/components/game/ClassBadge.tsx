import { cn } from "@/lib/utils"
import type { JobClass } from "@/types"

const JOB_CONFIG: Record<JobClass, { kr: string; textClass: string; bgClass: string }> = {
  warrior: { kr: "전사", textClass: "text-warrior", bgClass: "bg-warrior-bg" },
  rogue: { kr: "도적", textClass: "text-rogue", bgClass: "bg-rogue-bg" },
  mage: { kr: "법사", textClass: "text-mage", bgClass: "bg-mage-bg" },
  cleric: { kr: "직자", textClass: "text-cleric", bgClass: "bg-cleric-bg" },
  taoist: { kr: "도가", textClass: "text-taoist", bgClass: "bg-taoist-bg" },
}

interface ClassBadgeProps {
  job: JobClass
  count?: number
  className?: string
}

export function ClassBadge({ job, count, className }: ClassBadgeProps) {
  const config = JOB_CONFIG[job]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        config.bgClass,
        config.textClass,
        className,
      )}
    >
      {config.kr}
      {count !== undefined && count > 0 && ` ${count}자리`}
    </span>
  )
}

export { JOB_CONFIG }
