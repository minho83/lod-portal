import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function DateNav({
  dateDisplay,
  onPrev,
  onNext,
}: {
  dateDisplay: string
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
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
