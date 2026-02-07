import { supabase } from "@/lib/supabase"
import type { Trade, TradeCategory, TradeItem, TradeStatus, TradeType, MarketPrice } from "@/types"

export interface TradeFilters {
  keyword?: string
  category?: TradeCategory
  status?: TradeStatus
  tradeType?: TradeType
  minPrice?: number
  maxPrice?: number
}

export interface TradeListResult {
  data: Trade[]
  count: number
}

const PAGE_SIZE = 12

const TRADE_SELECT = "*, seller:profiles!trades_seller_id_fkey(*)"

export async function fetchTrades(
  filters: TradeFilters = {},
  page = 1,
): Promise<TradeListResult> {
  let query = supabase
    .from("trades")
    .select(TRADE_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })

  if (filters.status) {
    query = query.eq("status", filters.status)
  } else {
    query = query.eq("status", "active")
  }

  if (filters.tradeType) {
    query = query.eq("trade_type", filters.tradeType)
  }

  if (filters.keyword) {
    query = query.ilike("item_name", `%${filters.keyword}%`)
  }

  if (filters.category) {
    query = query.eq("item_category", filters.category)
  }

  if (filters.minPrice) {
    query = query.gte("price", filters.minPrice)
  }

  if (filters.maxPrice) {
    query = query.lte("price", filters.maxPrice)
  }

  const offset = (page - 1) * PAGE_SIZE
  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data, count, error } = await query

  if (error) throw error

  return {
    data: (data as Trade[]) ?? [],
    count: count ?? 0,
  }
}

export async function fetchTradeById(id: string): Promise<Trade | null> {
  const { data, error } = await supabase
    .from("trades")
    .select(TRADE_SELECT)
    .eq("id", id)
    .single()

  if (error) return null
  return data as Trade
}

export interface CreateTradeInput {
  seller_id: string
  trade_type: TradeType
  item_name: string
  item_category: TradeCategory
  item_description?: string
  price: number
  quantity?: number
  is_negotiable?: boolean
  items?: TradeItem[]
}

export async function createTrade(input: CreateTradeInput): Promise<Trade> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("로그인 세션이 만료되었습니다. 다시 로그인해주세요.")

  const { data, error } = await supabase
    .from("trades")
    .insert(input)
    .select(TRADE_SELECT)
    .single()

  if (error) throw error
  return data as Trade
}

export async function updateTradeStatus(
  id: string,
  status: TradeStatus,
): Promise<void> {
  const { error } = await supabase
    .from("trades")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}

export async function fetchMarketPrices(
  itemNames?: string[],
  windowDays = 7,
  minSamples = 3,
): Promise<MarketPrice[]> {
  const { data, error } = await supabase.rpc("get_market_prices", {
    p_item_names: itemNames ?? null,
    p_window_days: windowDays,
    p_min_samples: minSamples,
  })

  if (error) throw error
  return (data as MarketPrice[]) ?? []
}

export async function fetchMarketPriceMap(
  itemNames: string[],
): Promise<Map<string, MarketPrice>> {
  if (itemNames.length === 0) return new Map()

  const prices = await fetchMarketPrices(itemNames)
  const map = new Map<string, MarketPrice>()
  for (const p of prices) {
    map.set(p.item_name, p)
  }
  return map
}

export function extractItemNames(trades: Trade[]): string[] {
  const names = new Set<string>()
  for (const trade of trades) {
    if (trade.items && trade.items.length > 0) {
      for (const item of trade.items) {
        names.add(item.item_name)
      }
    } else {
      names.add(trade.item_name)
    }
  }
  return [...names]
}

export { PAGE_SIZE }
