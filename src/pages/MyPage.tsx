import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import {
  User,
  Users,
  ShoppingBag,
  ArrowUpCircle,
  ArrowDownCircle,
  Handshake,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import {
  fetchMyApplications,
  fetchMyRecruits,
  fetchMySellingItems,
  fetchMyBuyingItems,
  fetchMyTradingItems,
} from "@/lib/my-activity"
import { EmptyState } from "@/components/game/EmptyState"
import { ErrorState } from "@/components/game/ErrorState"
import { cn } from "@/lib/utils"
import type { PartyRecruit, PartyMember, Trade } from "@/types"

// ── Sub-components ──

function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="space-y-3 py-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function PartyApplicationCard({
  application,
}: {
  application: PartyMember & { recruit: PartyRecruit }
}) {
  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    accepted: "bg-green-500/10 text-green-500 border-green-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    left: "bg-muted text-muted-foreground",
    kicked: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const statusLabels = {
    pending: "대기중",
    accepted: "승인됨",
    rejected: "거절됨",
    left: "탈퇴",
    kicked: "추방",
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Link
                to={`/recruit/${application.recruit_id}`}
                className="text-sm font-semibold hover:text-primary"
              >
                {application.recruit.title}
              </Link>
              <Badge
                variant="outline"
                className={cn("text-xs", statusColors[application.status])}
              >
                {statusLabels[application.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {application.recruit.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {application.recruit.location}
                </div>
              )}
              {application.recruit.scheduled_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(application.recruit.scheduled_at).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                신청: {new Date(application.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MyRecruitCard({ recruit }: { recruit: PartyRecruit }) {
  const statusColors = {
    open: "bg-primary/10 text-primary border-primary/20",
    full: "bg-green-500/10 text-green-500 border-green-500/20",
    closed: "bg-muted text-muted-foreground",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const statusLabels = {
    open: "모집중",
    full: "마감",
    closed: "종료",
    cancelled: "취소",
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Link
                to={`/recruit/${recruit.id}`}
                className="text-sm font-semibold hover:text-primary"
              >
                {recruit.title}
              </Link>
              <Badge
                variant="outline"
                className={cn("text-xs", statusColors[recruit.status])}
              >
                {statusLabels[recruit.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              {recruit.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {recruit.location}
                </div>
              )}
              {recruit.scheduled_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(recruit.scheduled_at).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {recruit.member_count}/{recruit.max_members}명
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(recruit.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to={`/recruit/${recruit.id}`}>관리</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TradeItemCard({ trade }: { trade: Trade }) {
  const statusColors = {
    active: "bg-primary/10 text-primary border-primary/20",
    reserved: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    sold: "bg-green-500/10 text-green-500 border-green-500/20",
    expired: "bg-muted text-muted-foreground",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const statusLabels = {
    active: "판매중",
    reserved: "예약중",
    sold: "거래완료",
    expired: "만료",
    cancelled: "취소",
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Link
                to={`/trade/${trade.id}`}
                className="text-sm font-semibold hover:text-primary"
              >
                {trade.item_name}
              </Link>
              <Badge
                variant="outline"
                className={cn("text-xs", statusColors[trade.status])}
              >
                {statusLabels[trade.status]}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {trade.price.toLocaleString()} {trade.price_unit}
              </div>
              <div className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" />
                {trade.quantity}개
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(trade.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to={`/trade/${trade.id}`}>상세</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Page ──

export function MyPage() {
  const { user } = useAuth()

  // 파티 관련 상태
  const [applications, setApplications] = useState<
    (PartyMember & { recruit: PartyRecruit })[]
  >([])
  const [myRecruits, setMyRecruits] = useState<PartyRecruit[]>([])
  const [loadingParty, setLoadingParty] = useState(false)
  const [errorParty, setErrorParty] = useState<string | null>(null)

  // 거래 관련 상태
  const [sellingItems, setSellingItems] = useState<Trade[]>([])
  const [buyingItems, setBuyingItems] = useState<Trade[]>([])
  const [tradingItems, setTradingItems] = useState<Trade[]>([])
  const [loadingTrade, setLoadingTrade] = useState(false)
  const [errorTrade, setErrorTrade] = useState<string | null>(null)

  // 파티 데이터 로드
  const loadPartyData = async () => {
    if (!user) return
    setLoadingParty(true)
    setErrorParty(null)
    try {
      const [apps, recruits] = await Promise.all([
        fetchMyApplications(user.id),
        fetchMyRecruits(user.id),
      ])
      setApplications(apps)
      setMyRecruits(recruits)
    } catch (err) {
      setErrorParty(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다")
    }
    setLoadingParty(false)
  }

  // 거래 데이터 로드
  const loadTradeData = async () => {
    if (!user) return
    setLoadingTrade(true)
    setErrorTrade(null)
    try {
      const [selling, buying, trading] = await Promise.all([
        fetchMySellingItems(user.id),
        fetchMyBuyingItems(user.id),
        fetchMyTradingItems(user.id),
      ])
      setSellingItems(selling)
      setBuyingItems(buying)
      setTradingItems(trading)
    } catch (err) {
      setErrorTrade(err instanceof Error ? err.message : "데이터를 불러올 수 없습니다")
    }
    setLoadingTrade(false)
  }

  useEffect(() => {
    if (user) {
      loadPartyData()
      loadTradeData()
    }
  }, [user])

  // 로그인 안 되어 있으면 로그인 페이지로 리다이렉트
  if (!user) {
    return <Navigate to="/profile" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">내 페이지</h2>
      </div>

      <Tabs defaultValue="party" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="party" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">내 파티 현황</span>
            <span className="sm:hidden">파티</span>
          </TabsTrigger>
          <TabsTrigger value="trade" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">내 거래</span>
            <span className="sm:hidden">거래</span>
          </TabsTrigger>
        </TabsList>

        {/* 파티 현황 탭 */}
        <TabsContent value="party" className="space-y-4">
          <Tabs defaultValue="applications" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="applications">내가 신청한 파티</TabsTrigger>
              <TabsTrigger value="recruits">내가 파티장인 파티</TabsTrigger>
            </TabsList>

            <TabsContent value="applications">
              {loadingParty ? (
                <LoadingSkeleton />
              ) : errorParty ? (
                <ErrorState message={errorParty} onRetry={loadPartyData} />
              ) : applications.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="신청한 파티가 없습니다"
                  description="파티 모집 게시판에서 파티에 참여해보세요"
                />
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <PartyApplicationCard key={app.id} application={app} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recruits">
              {loadingParty ? (
                <LoadingSkeleton />
              ) : errorParty ? (
                <ErrorState message={errorParty} onRetry={loadPartyData} />
              ) : myRecruits.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="개설한 파티가 없습니다"
                  description="파티를 만들어 함께 플레이할 동료를 모집해보세요"
                />
              ) : (
                <div className="space-y-3">
                  {myRecruits.map((recruit) => (
                    <MyRecruitCard key={recruit.id} recruit={recruit} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 거래 탭 */}
        <TabsContent value="trade" className="space-y-4">
          <Tabs defaultValue="selling" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="selling" className="flex items-center gap-1.5">
                <ArrowUpCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">파는 물품</span>
                <span className="sm:hidden">판매</span>
              </TabsTrigger>
              <TabsTrigger value="buying" className="flex items-center gap-1.5">
                <ArrowDownCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">사는 물품</span>
                <span className="sm:hidden">구매</span>
              </TabsTrigger>
              <TabsTrigger value="trading" className="flex items-center gap-1.5">
                <Handshake className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">거래중</span>
                <span className="sm:hidden">진행중</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="selling">
              {loadingTrade ? (
                <LoadingSkeleton />
              ) : errorTrade ? (
                <ErrorState message={errorTrade} onRetry={loadTradeData} />
              ) : sellingItems.length === 0 ? (
                <EmptyState
                  icon={ArrowUpCircle}
                  title="판매 중인 물품이 없습니다"
                  description="거래소에서 판매글을 등록해보세요"
                />
              ) : (
                <div className="space-y-3">
                  {sellingItems.map((trade) => (
                    <TradeItemCard key={trade.id} trade={trade} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="buying">
              {loadingTrade ? (
                <LoadingSkeleton />
              ) : errorTrade ? (
                <ErrorState message={errorTrade} onRetry={loadTradeData} />
              ) : buyingItems.length === 0 ? (
                <EmptyState
                  icon={ArrowDownCircle}
                  title="구매 요청 중인 물품이 없습니다"
                  description="거래소에서 구매글을 등록해보세요"
                />
              ) : (
                <div className="space-y-3">
                  {buyingItems.map((trade) => (
                    <TradeItemCard key={trade.id} trade={trade} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trading">
              {loadingTrade ? (
                <LoadingSkeleton />
              ) : errorTrade ? (
                <ErrorState message={errorTrade} onRetry={loadTradeData} />
              ) : tradingItems.length === 0 ? (
                <EmptyState
                  icon={Handshake}
                  title="거래 진행 중인 물품이 없습니다"
                  description="예약되거나 거래 완료된 물품이 여기에 표시됩니다"
                />
              ) : (
                <div className="space-y-3">
                  {tradingItems.map((trade) => (
                    <TradeItemCard key={trade.id} trade={trade} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
