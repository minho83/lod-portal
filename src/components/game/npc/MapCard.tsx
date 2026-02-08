import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { MapData } from "@/lib/npc-data"
import { MapPin } from "lucide-react"

interface MapCardProps {
  map: MapData
  onClick: () => void
}

export function MapCard({ map, onClick }: MapCardProps) {
  const typeLabels = {
    town: "마을",
    hunting: "사냥터",
    dungeon: "던전",
    special: "특수",
  }

  const continentColors = {
    east: "bg-mage-bg text-mage",
    west: "bg-warrior-bg text-warrior",
  }

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={`/maps/${map.image}`}
          alt={map.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23333' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='14'%3E이미지 없음%3C/text%3E%3C/svg%3E"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 flex gap-1">
          <Badge variant="secondary" className={continentColors[map.continent]}>
            {map.continent === "east" ? "동대륙" : "서대륙"}
          </Badge>
          <Badge variant="outline" className="bg-background/80">
            {typeLabels[map.type]}
          </Badge>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-foreground">{map.name}</h3>
          <MapPin className="h-4 w-4 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}
