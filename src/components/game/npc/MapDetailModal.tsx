import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { MapData, NpcData } from "@/lib/npc-data"
import { MapPin, Tag, ExternalLink } from "lucide-react"

interface MapDetailModalProps {
  map: MapData | null
  npcs: NpcData[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MapDetailModal({ map, npcs, open, onOpenChange }: MapDetailModalProps) {
  if (!map) return null

  const typeLabels = {
    town: "마을",
    hunting: "사냥터",
    dungeon: "던전",
    special: "특수",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {map.name}
          </DialogTitle>
          <DialogDescription className="flex gap-2">
            <Badge variant="secondary">
              {map.continent === "east" ? "동대륙" : "서대륙"}
            </Badge>
            <Badge variant="outline">{typeLabels[map.type]}</Badge>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {/* 맵 이미지 */}
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img
                src={`/maps/${map.image}`}
                alt={map.name}
                className="w-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23333' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='20'%3E맵 이미지 없음%3C/text%3E%3C/svg%3E"
                }}
              />
            </div>

            {/* NPC 목록 */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-bold text-foreground">
                <Tag className="h-4 w-4" />
                NPC 목록 ({npcs.length}개)
              </h3>
              {npcs.length > 0 ? (
                <div className="space-y-2">
                  {npcs.map((npc) => (
                    <div
                      key={npc.id}
                      className="rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: npc.color }}
                            />
                            <span className="font-medium text-foreground">{npc.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({npc.x.toFixed(1)}, {npc.y.toFixed(1)})
                            </span>
                          </div>
                          {npc.tags.length > 0 && (
                            <div className="mb-2 flex flex-wrap gap-1">
                              {npc.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {npc.description && (
                            <p className="whitespace-pre-line text-sm text-muted-foreground">
                              {npc.description}
                            </p>
                          )}
                          {npc.url && (
                            <a
                              href={npc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              자세히 보기
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  등록된 NPC가 없습니다
                </p>
              )}
            </div>

            {/* 광고 공간 */}
            <div className="rounded-lg border-2 border-dashed border-border bg-muted/30 p-4 text-center">
              <p className="text-xs text-muted-foreground">광고 영역</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
