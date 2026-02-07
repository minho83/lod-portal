import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Separator className="mb-4" />
        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>LOD 포털 - 어둠의전설 종합 도우미</p>
          <p>제작자: 밀떡밀떡 | miltteok220@gmail.com</p>
        </div>
      </div>
    </footer>
  )
}
