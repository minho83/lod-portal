import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapCard } from "@/components/game/npc/MapCard"
import { MapDetailModal } from "@/components/game/npc/MapDetailModal"
import {
  npcGameData,
  getNpcsByMapId,
  searchMaps,
  searchNpcs,
  type MapData,
} from "@/lib/npc-data"
import { Search, Map as MapIcon, Filter } from "lucide-react"

type ContinentFilter = "all" | "east" | "west"
type TypeFilter = "all" | "town" | "hunting" | "dungeon" | "special"

export function NpcMapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [continentFilter, setContinentFilter] = useState<ContinentFilter>("all")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [selectedMap, setSelectedMap] = useState<MapData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // 필터링된 맵 목록
  const filteredMaps = useMemo(() => {
    let maps = npcGameData.maps

    // 검색어로 필터링 (맵 이름 + NPC 검색)
    if (searchQuery.trim()) {
      const matchedMaps = searchMaps(searchQuery)
      const matchedNpcs = searchNpcs(searchQuery)
      const npcMapIds = new Set(matchedNpcs.map((npc) => npc.mapId))

      maps = maps.filter(
        (map) => matchedMaps.some((m) => m.id === map.id) || npcMapIds.has(map.id)
      )
    }

    // 대륙 필터
    if (continentFilter !== "all") {
      maps = maps.filter((map) => map.continent === continentFilter)
    }

    // 타입 필터
    if (typeFilter !== "all") {
      maps = maps.filter((map) => map.type === typeFilter)
    }

    return maps
  }, [searchQuery, continentFilter, typeFilter])

  const handleMapClick = (map: MapData) => {
    setSelectedMap(map)
    setModalOpen(true)
  }

  const selectedMapNpcs = selectedMap ? getNpcsByMapId(selectedMap.id) : []

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <MapIcon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">NPC&맵찾기</h2>
      </div>

      {/* 검색 & 필터 */}
      <div className="space-y-4">
        {/* 검색 바 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="맵 이름, NPC 이름, 태그로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 필터 버튼 */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>필터:</span>
          </div>

          {/* 대륙 필터 */}
          <div className="flex gap-1">
            <Button
              variant={continentFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setContinentFilter("all")}
            >
              전체
            </Button>
            <Button
              variant={continentFilter === "east" ? "default" : "outline"}
              size="sm"
              onClick={() => setContinentFilter("east")}
              className={continentFilter === "east" ? "bg-mage" : ""}
            >
              동대륙
            </Button>
            <Button
              variant={continentFilter === "west" ? "default" : "outline"}
              size="sm"
              onClick={() => setContinentFilter("west")}
              className={continentFilter === "west" ? "bg-warrior" : ""}
            >
              서대륙
            </Button>
          </div>

          {/* 타입 필터 */}
          <div className="flex gap-1">
            <Button
              variant={typeFilter === "town" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(typeFilter === "town" ? "all" : "town")}
            >
              마을
            </Button>
            <Button
              variant={typeFilter === "hunting" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(typeFilter === "hunting" ? "all" : "hunting")}
            >
              사냥터
            </Button>
          </div>
        </div>
      </div>

      {/* 결과 개수 */}
      <div className="text-sm text-muted-foreground">
        {filteredMaps.length}개의 맵
        {searchQuery && ` (검색: "${searchQuery}")`}
      </div>

      {/* 맵 그리드 - 반응형 */}
      {filteredMaps.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMaps.map((map) => (
            <MapCard key={map.id} map={map} onClick={() => handleMapClick(map)} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">검색 결과가 없습니다</p>
        </div>
      )}

      {/* 맵 상세 모달 */}
      <MapDetailModal
        map={selectedMap}
        npcs={selectedMapNpcs}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}
