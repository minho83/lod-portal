import gameData from "./npc-data.json"

export interface MapData {
  id: string
  name: string
  type: "town" | "hunting" | "dungeon" | "special"
  continent: "east" | "west"
  image: string
  worldX: number
  worldY: number
}

export interface NpcData {
  id: number
  name: string
  mapId: string
  x: number
  y: number
  tags: string[]
  description: string
  color: string
  url?: string
}

export interface GameData {
  maps: MapData[]
  npcs: NpcData[]
}

export const npcGameData = gameData as GameData

export function getMapById(mapId: string): MapData | undefined {
  return npcGameData.maps.find((map) => map.id === mapId)
}

export function getNpcsByMapId(mapId: string): NpcData[] {
  return npcGameData.npcs.filter((npc) => npc.mapId === mapId)
}

export function searchMaps(query: string): MapData[] {
  const lowerQuery = query.toLowerCase()
  return npcGameData.maps.filter((map) =>
    map.name.toLowerCase().includes(lowerQuery)
  )
}

export function searchNpcs(query: string): NpcData[] {
  const lowerQuery = query.toLowerCase()
  return npcGameData.npcs.filter(
    (npc) =>
      npc.name.toLowerCase().includes(lowerQuery) ||
      npc.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      npc.description.toLowerCase().includes(lowerQuery)
  )
}

export function filterMapsByContinent(continent: "east" | "west"): MapData[] {
  return npcGameData.maps.filter((map) => map.continent === continent)
}

export function filterMapsByType(type: MapData["type"]): MapData[] {
  return npcGameData.maps.filter((map) => map.type === type)
}
