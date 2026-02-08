import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Tag, Handshake, Clock, User, AlertCircle, Layers, ShieldAlert, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { fetchTradeById, updateTradeStatus, fetchMarketPrices } from "@/lib/trades"
import { TradeBadge } from "@/components/game/TradeBadge"
import { ReportDialog } from "@/components/market/ReportDialog"
import { formatPrice, formatPriceDelta, timeAgo } from "@/lib/utils"
import { linkifySafe } from "@/lib/linkify"
import type { Trade, TradeStatus, MarketPrice } from "@/types"

const SELL_STATUS_LABELS: Record<TradeStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "판매중", variant: "default" },
  reserved: { label: "예약중", variant: "secondary" },
  sold: { label: "판매완료", variant: "outline" },
  expired: { label: "만료", variant: "destructive" },
  cancelled: { label: "취소", variant: "destructive" },
}

const BUY_STATUS_LABELS: Record<TradeStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "구매중", variant: "default" },
  reserved: { label: "예약중", variant: "secondary" },
  sold: { label: "거래완료", variant: "outline" },
  expired: { label: "만료", variant: "destructive" },
  cancelled: { label: "취소", variant: "destructive" },
}

export function TradeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [priceMap, setPriceMap] = useState<Map<string, MarketPrice>>(new Map())
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    fetchTradeById(id).then((data) => {
      setTrade(data)
      setLoading(false)
      if (data) {
        // 묶음이면 개별 아이템 시세, 아니면 단일 아이템 시세
        const itemNames = data.items && data.items.length > 0
          ? data.items.map((i) => i.item_name)
          : [data.item_name]

        fetchMarketPrices(itemNames)
          .then((prices) => {
            const map = new Map<string, MarketPrice>()
            for (const p of prices) map.set(p.item_name, p)
            setPriceMap(map)
          })
          .catch(() => {})
      }
    })
  }, [id])

  const handleStatusChange = async (status: TradeStatus) => {
    if (!trade) return
    setUpdating(true)
    try {
      await updateTradeStatus(trade.id, status)
      setTrade({ ...trade, status })
    } catch {
      // ignore
    }
    setUpdating(false)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-4 p-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (!trade) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <AlertCircle className="h-10 w-10" />
            <p>매물을 찾을 수 없습니다</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/market")}>
              거래소로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isOwner = user?.id === trade.seller_id
  const isBuy = trade.trade_type === "buy"
  const isBundle = trade.items && trade.items.length > 0
  const sellerName =
    trade.seller?.game_nickname ?? trade.seller?.discord_username ?? "알 수 없음"
  const statusLabels = isBuy ? BUY_STATUS_LABELS : SELL_STATUS_LABELS
  const statusInfo = statusLabels[trade.status]

  // 단일 아이템 시세
  const singlePrice = !isBundle ? priceMap.get(trade.item_name) : undefined

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/market")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        거래소로 돌아가기
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <TradeBadge tradeType={trade.trade_type} />
            {isBundle ? (
              <Badge variant="secondary">
                <Layers className="mr-1 h-3 w-3" />
                묶음 {trade.items!.length}건
              </Badge>
            ) : (
              <Badge variant="secondary">{trade.item_category}</Badge>
            )}
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {trade.is_negotiable && (
              <Badge variant="outline" className="text-xs">
                <Handshake className="mr-1 h-3 w-3" />
                협상가능
              </Badge>
            )}
          </div>
          <CardTitle className="text-xl">{trade.item_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBundle ? (
            /* ─── 묶음 아이템 목록 ─── */
            <>
              <div className="space-y-2">
                {trade.items!.map((item, i) => {
                  const mp = priceMap.get(item.item_name)
                  const delta = mp ? formatPriceDelta(item.price, mp.median_price) : null
                  return (
                    <div key={i} className="rounded-md border border-border p-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{item.item_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.item_category}
                            {item.quantity > 1 && ` · ${item.quantity}개`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">{formatPrice(item.price)}</p>
                          {delta?.text && (
                            <p className={`text-xs ${delta.color}`}>{delta.text}</p>
                          )}
                        </div>
                      </div>
                      {mp && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          시세 {formatPrice(mp.median_price)} ({mp.trade_count}건, {mp.window_days}일)
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* 총 가격 */}
              <div className="flex items-baseline gap-2 rounded-lg bg-muted/50 p-3">
                <Tag className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">총 가격</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(trade.price)}
                </span>
                <span className="text-sm text-muted-foreground">{trade.price_unit}</span>
              </div>
            </>
          ) : (
            /* ─── 단일 아이템 가격 ─── */
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">{isBuy ? "희망가" : "판매가"}</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(trade.price)}
                </span>
                <span className="text-sm text-muted-foreground">{trade.price_unit}</span>
                {trade.quantity > 1 && (
                  <span className="text-sm text-muted-foreground">x{trade.quantity}개</span>
                )}
                {singlePrice && (() => {
                  const delta = formatPriceDelta(trade.price, singlePrice.median_price)
                  return delta.text ? <span className={`text-sm ${delta.color}`}>{delta.text}</span> : null
                })()}
              </div>
              {singlePrice && (
                <p className="pl-7 text-xs text-muted-foreground">
                  시세: {formatPrice(singlePrice.median_price)} ({singlePrice.trade_count}건 기준, {singlePrice.window_days}일)
                </p>
              )}
            </div>
          )}

          {/* 상세 설명 */}
          {trade.item_description && (
            <div className="space-y-1">
              <p className="text-sm font-medium">상세 설명</p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {linkifySafe(trade.item_description)}
              </p>
            </div>
          )}

          {/* 등록자 정보 */}
          <div className="space-y-2 rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{sellerName}</p>
                <p className="text-xs text-muted-foreground">{isBuy ? "구매자" : "판매자"}</p>
              </div>
            </div>
            {trade.seller?.discord_username && (
              <div className="flex items-center gap-2 pl-8">
                <MessageCircle className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Discord</p>
                  <p className="text-sm font-medium text-primary">
                    {trade.seller.discord_username}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 시간 정보 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>등록: {timeAgo(trade.created_at)}</span>
            <span>·</span>
            <span>
              만료: {new Date(trade.expires_at).toLocaleDateString("ko-KR")}
            </span>
          </div>

          {/* 소유자 액션 */}
          {isOwner && trade.status === "active" && (
            <div className="flex gap-2 border-t border-border pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                disabled={updating}
                onClick={() => handleStatusChange("reserved")}
              >
                예약중으로 변경
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={updating}
                onClick={() => handleStatusChange("sold")}
              >
                {isBuy ? "거래완료" : "판매완료"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={updating}
                onClick={() => handleStatusChange("cancelled")}
              >
                취소
              </Button>
            </div>
          )}

          {isOwner && trade.status === "reserved" && (
            <div className="flex gap-2 border-t border-border pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                disabled={updating}
                onClick={() => handleStatusChange("active")}
              >
                {isBuy ? "다시 구매중" : "다시 판매중"}
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={updating}
                onClick={() => handleStatusChange("sold")}
              >
                {isBuy ? "거래완료" : "판매완료"}
              </Button>
            </div>
          )}

          {/* 구매자 액션 (본인 글이 아닐 때) */}
          {!isOwner && user && (trade.status === "active" || trade.status === "reserved") && (
            <div className="space-y-2 border-t border-border pt-4">
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  if (trade.seller?.discord_username) {
                    navigator.clipboard.writeText(trade.seller.discord_username)
                    toast.success(`Discord ID가 복사되었습니다!\n${trade.seller.discord_username}`)
                  } else {
                    toast.info("판매자의 Discord 정보가 없습니다")
                  }
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                거래 문의하기
              </Button>
              {trade.status === "reserved" && (
                <p className="text-center text-xs text-muted-foreground">
                  ⏳ 현재 예약중인 물품입니다
                </p>
              )}
            </div>
          )}

          {/* 신고 버튼 (본인 글이 아닐 때만) */}
          {!isOwner && user && (
            <div className={`${(trade.status === "active" || trade.status === "reserved") ? "" : "border-t border-border pt-4"}`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setReportDialogOpen(true)}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                사기 신고하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 신고 다이얼로그 */}
      {trade && (
        <ReportDialog
          open={reportDialogOpen}
          onOpenChange={setReportDialogOpen}
          trade={trade}
        />
      )}
    </div>
  )
}
