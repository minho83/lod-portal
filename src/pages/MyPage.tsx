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
  Trash2,
  List,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import {
  fetchMyApplications,
  fetchMyRecruits,
  fetchMySellingItems,
  fetchMyBuyingItems,
  fetchMyTradingItems,
  deletePartyApplication,
  deletePartyApplications,
  deletePartyRecruit,
  deletePartyRecruits,
  deleteTrade,
  deleteTrades,
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
  selectable,
  selected,
  onSelect,
  onDelete,
}: {
  application: PartyMember & { recruit: PartyRecruit }
  selectable?: boolean
  selected?: boolean
  onSelect?: (id: string, checked: boolean) => void
  onDelete?: (id: string) => void
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
        <div className="flex items-start gap-3">
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) =>
                onSelect?.(application.id, checked as boolean)
              }
              className="mt-0.5"
            />
          )}
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
          {onDelete && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onDelete(application.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MyRecruitCard({
  recruit,
  selectable,
  selected,
  onSelect,
  onDelete,
}: {
  recruit: PartyRecruit
  selectable?: boolean
  selected?: boolean
  onSelect?: (id: string, checked: boolean) => void
  onDelete?: (id: string) => void
}) {
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
        <div className="flex items-start gap-3">
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) =>
                onSelect?.(recruit.id, checked as boolean)
              }
              className="mt-0.5"
            />
          )}
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
          {onDelete && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onDelete(recruit.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TradeItemCard({
  trade,
  selectable,
  selected,
  onSelect,
  onDelete,
}: {
  trade: Trade
  selectable?: boolean
  selected?: boolean
  onSelect?: (id: string, checked: boolean) => void
  onDelete?: (id: string) => void
}) {
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
        <div className="flex items-start gap-3">
          {selectable && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) =>
                onSelect?.(trade.id, checked as boolean)
              }
              className="mt-0.5"
            />
          )}
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
          {onDelete && (
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onDelete(trade.id)}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
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

  // 파티 필터 & 선택 상태
  const [partyFilter, setPartyFilter] = useState({
    applications: true,
    recruits: true,
  })
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(
    new Set()
  )
  const [selectedRecruits, setSelectedRecruits] = useState<Set<string>>(new Set())

  // 거래 관련 상태
  const [sellingItems, setSellingItems] = useState<Trade[]>([])
  const [buyingItems, setBuyingItems] = useState<Trade[]>([])
  const [tradingItems, setTradingItems] = useState<Trade[]>([])
  const [loadingTrade, setLoadingTrade] = useState(false)
  const [errorTrade, setErrorTrade] = useState<string | null>(null)

  // 거래 필터 & 선택 상태
  const [tradeFilter, setTradeFilter] = useState({
    selling: true,
    buying: true,
    trading: true,
  })
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set())

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

  // 파티 신청 선택 핸들러
  const handleSelectApplication = (id: string, checked: boolean) => {
    const newSet = new Set(selectedApplications)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedApplications(newSet)
  }

  // 파티 모집 선택 핸들러
  const handleSelectRecruit = (id: string, checked: boolean) => {
    const newSet = new Set(selectedRecruits)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedRecruits(newSet)
  }

  // 거래 선택 핸들러
  const handleSelectTrade = (id: string, checked: boolean) => {
    const newSet = new Set(selectedTrades)
    if (checked) {
      newSet.add(id)
    } else {
      newSet.delete(id)
    }
    setSelectedTrades(newSet)
  }

  // 파티 전체 선택/해제
  const handleSelectAllParty = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(
        new Set(
          partyFilter.applications ? applications.map((a) => a.id) : []
        )
      )
      setSelectedRecruits(
        new Set(partyFilter.recruits ? myRecruits.map((r) => r.id) : [])
      )
    } else {
      setSelectedApplications(new Set())
      setSelectedRecruits(new Set())
    }
  }

  // 거래 전체 선택/해제
  const handleSelectAllTrade = (checked: boolean) => {
    if (checked) {
      const allIds = new Set([
        ...(tradeFilter.selling ? sellingItems.map((t) => t.id) : []),
        ...(tradeFilter.buying ? buyingItems.map((t) => t.id) : []),
        ...(tradeFilter.trading ? tradingItems.map((t) => t.id) : []),
      ])
      setSelectedTrades(allIds)
    } else {
      setSelectedTrades(new Set())
    }
  }

  // 파티 전체 선택 상태 계산
  const partySelectAllState = (() => {
    const totalVisible =
      (partyFilter.applications ? applications.length : 0) +
      (partyFilter.recruits ? myRecruits.length : 0)
    const totalSelected = selectedApplications.size + selectedRecruits.size
    if (totalVisible === 0) return { checked: false, indeterminate: false }
    if (totalSelected === 0) return { checked: false, indeterminate: false }
    if (totalSelected === totalVisible)
      return { checked: true, indeterminate: false }
    return { checked: false, indeterminate: true }
  })()

  // 거래 전체 선택 상태 계산
  const tradeSelectAllState = (() => {
    const totalVisible =
      (tradeFilter.selling ? sellingItems.length : 0) +
      (tradeFilter.buying ? buyingItems.length : 0) +
      (tradeFilter.trading ? tradingItems.length : 0)
    const totalSelected = selectedTrades.size
    if (totalVisible === 0) return { checked: false, indeterminate: false }
    if (totalSelected === 0) return { checked: false, indeterminate: false }
    if (totalSelected === totalVisible)
      return { checked: true, indeterminate: false }
    return { checked: false, indeterminate: true }
  })()

  // 파티 신청 개별 삭제
  const handleDeleteApplication = async (id: string) => {
    if (!confirm("파티 신청을 취소하시겠습니까?")) return
    try {
      await deletePartyApplication(id)
      await loadPartyData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다")
    }
  }

  // 파티 신청 전체 삭제
  const handleDeleteSelectedApplications = async () => {
    if (selectedApplications.size === 0) {
      alert("삭제할 항목을 선택해주세요")
      return
    }
    if (!confirm(`선택한 ${selectedApplications.size}개의 파티 신청을 취소하시겠습니까?`))
      return
    try {
      await deletePartyApplications(Array.from(selectedApplications))
      setSelectedApplications(new Set())
      await loadPartyData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다")
    }
  }

  // 파티 모집 개별 삭제
  const handleDeleteRecruit = async (id: string) => {
    if (!confirm("파티 모집을 취소하시겠습니까?")) return
    try {
      await deletePartyRecruit(id)
      await loadPartyData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다")
    }
  }

  // 파티 모집 전체 삭제
  const handleDeleteSelectedRecruits = async () => {
    if (selectedRecruits.size === 0) {
      alert("삭제할 항목을 선택해주세요")
      return
    }
    if (!confirm(`선택한 ${selectedRecruits.size}개의 파티 모집을 취소하시겠습니까?`))
      return
    try {
      await deletePartyRecruits(Array.from(selectedRecruits))
      setSelectedRecruits(new Set())
      await loadPartyData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다")
    }
  }

  // 거래 개별 삭제
  const handleDeleteTrade = async (id: string) => {
    if (!confirm("거래를 취소하시겠습니까?")) return
    try {
      await deleteTrade(id)
      await loadTradeData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다")
    }
  }

  // 거래 전체 삭제
  const handleDeleteSelectedTrades = async () => {
    if (selectedTrades.size === 0) {
      alert("삭제할 항목을 선택해주세요")
      return
    }
    if (!confirm(`선택한 ${selectedTrades.size}개의 거래를 취소하시겠습니까?`)) return
    try {
      await deleteTrades(Array.from(selectedTrades))
      setSelectedTrades(new Set())
      await loadTradeData()
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제에 실패했습니다")
    }
  }

  // 필터링된 파티 목록
  const filteredPartyItems = [
    ...(partyFilter.applications ? applications : []),
    ...(partyFilter.recruits ? myRecruits : []),
  ]

  // 필터링된 거래 목록
  const filteredTradeItems = [
    ...(tradeFilter.selling ? sellingItems : []),
    ...(tradeFilter.buying ? buyingItems : []),
    ...(tradeFilter.trading ? tradingItems : []),
  ]

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
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-1.5">
                <List className="h-3.5 w-3.5" />
                <span>종합</span>
              </TabsTrigger>
              <TabsTrigger value="applications">신청한 파티</TabsTrigger>
              <TabsTrigger value="recruits">내가 파티장</TabsTrigger>
            </TabsList>

            {/* 종합 탭 */}
            <TabsContent value="overview">
              {loadingParty ? (
                <LoadingSkeleton />
              ) : errorParty ? (
                <ErrorState message={errorParty} onRetry={loadPartyData} />
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={partyFilter.applications}
                            onCheckedChange={(checked) =>
                              setPartyFilter((prev) => ({
                                ...prev,
                                applications: checked as boolean,
                              }))
                            }
                          />
                          신청한 파티
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={partyFilter.recruits}
                            onCheckedChange={(checked) =>
                              setPartyFilter((prev) => ({
                                ...prev,
                                recruits: checked as boolean,
                              }))
                            }
                          />
                          내가 파티장인 파티
                        </label>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          handleDeleteSelectedApplications()
                          handleDeleteSelectedRecruits()
                        }}
                        disabled={
                          selectedApplications.size === 0 && selectedRecruits.size === 0
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        선택 삭제 (
                        {selectedApplications.size + selectedRecruits.size})
                      </Button>
                    </div>

                    {filteredPartyItems.length > 0 && (
                      <div className="flex items-center gap-2 text-sm border-b pb-2">
                        <Checkbox
                          checked={partySelectAllState.checked}
                          onCheckedChange={handleSelectAllParty}
                          {...(partySelectAllState.indeterminate && {
                            "data-state": "indeterminate" as any,
                          })}
                        />
                        <span className="text-muted-foreground">전체 선택</span>
                      </div>
                    )}
                  </div>

                  {filteredPartyItems.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="표시할 파티가 없습니다"
                      description="필터를 조정하거나 파티를 추가해보세요"
                    />
                  ) : (
                    <div className="space-y-3">
                      {partyFilter.applications &&
                        applications.map((app) => (
                          <PartyApplicationCard
                            key={app.id}
                            application={app}
                            selectable
                            selected={selectedApplications.has(app.id)}
                            onSelect={handleSelectApplication}
                            onDelete={handleDeleteApplication}
                          />
                        ))}
                      {partyFilter.recruits &&
                        myRecruits.map((recruit) => (
                          <MyRecruitCard
                            key={recruit.id}
                            recruit={recruit}
                            selectable
                            selected={selectedRecruits.has(recruit.id)}
                            onSelect={handleSelectRecruit}
                            onDelete={handleDeleteRecruit}
                          />
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* 신청한 파티 탭 */}
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
                    <PartyApplicationCard
                      key={app.id}
                      application={app}
                      onDelete={handleDeleteApplication}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 내가 파티장 탭 */}
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
                    <MyRecruitCard
                      key={recruit.id}
                      recruit={recruit}
                      onDelete={handleDeleteRecruit}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* 거래 탭 */}
        <TabsContent value="trade" className="space-y-4">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-1.5">
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">종합</span>
                <span className="sm:hidden">전체</span>
              </TabsTrigger>
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

            {/* 종합 탭 */}
            <TabsContent value="overview">
              {loadingTrade ? (
                <LoadingSkeleton />
              ) : errorTrade ? (
                <ErrorState message={errorTrade} onRetry={loadTradeData} />
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={tradeFilter.selling}
                            onCheckedChange={(checked) =>
                              setTradeFilter((prev) => ({
                                ...prev,
                                selling: checked as boolean,
                              }))
                            }
                          />
                          파는 물품
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={tradeFilter.buying}
                            onCheckedChange={(checked) =>
                              setTradeFilter((prev) => ({
                                ...prev,
                                buying: checked as boolean,
                              }))
                            }
                          />
                          사는 물품
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={tradeFilter.trading}
                            onCheckedChange={(checked) =>
                              setTradeFilter((prev) => ({
                                ...prev,
                                trading: checked as boolean,
                              }))
                            }
                          />
                          거래중
                        </label>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDeleteSelectedTrades}
                        disabled={selectedTrades.size === 0}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        선택 삭제 ({selectedTrades.size})
                      </Button>
                    </div>

                    {filteredTradeItems.length > 0 && (
                      <div className="flex items-center gap-2 text-sm border-b pb-2">
                        <Checkbox
                          checked={tradeSelectAllState.checked}
                          onCheckedChange={handleSelectAllTrade}
                          {...(tradeSelectAllState.indeterminate && {
                            "data-state": "indeterminate" as any,
                          })}
                        />
                        <span className="text-muted-foreground">전체 선택</span>
                      </div>
                    )}
                  </div>

                  {filteredTradeItems.length === 0 ? (
                    <EmptyState
                      icon={ShoppingBag}
                      title="표시할 거래가 없습니다"
                      description="필터를 조정하거나 거래를 추가해보세요"
                    />
                  ) : (
                    <div className="space-y-3">
                      {tradeFilter.selling &&
                        sellingItems.map((trade) => (
                          <TradeItemCard
                            key={trade.id}
                            trade={trade}
                            selectable
                            selected={selectedTrades.has(trade.id)}
                            onSelect={handleSelectTrade}
                            onDelete={handleDeleteTrade}
                          />
                        ))}
                      {tradeFilter.buying &&
                        buyingItems.map((trade) => (
                          <TradeItemCard
                            key={trade.id}
                            trade={trade}
                            selectable
                            selected={selectedTrades.has(trade.id)}
                            onSelect={handleSelectTrade}
                            onDelete={handleDeleteTrade}
                          />
                        ))}
                      {tradeFilter.trading &&
                        tradingItems.map((trade) => (
                          <TradeItemCard
                            key={trade.id}
                            trade={trade}
                            selectable
                            selected={selectedTrades.has(trade.id)}
                            onSelect={handleSelectTrade}
                            onDelete={handleDeleteTrade}
                          />
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* 파는 물품 탭 */}
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
                    <TradeItemCard
                      key={trade.id}
                      trade={trade}
                      onDelete={handleDeleteTrade}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 사는 물품 탭 */}
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
                    <TradeItemCard
                      key={trade.id}
                      trade={trade}
                      onDelete={handleDeleteTrade}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 거래중 탭 */}
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
                    <TradeItemCard
                      key={trade.id}
                      trade={trade}
                      onDelete={handleDeleteTrade}
                    />
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
