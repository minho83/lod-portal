import { useEffect, useState, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Search, Plus, Users, Swords, Castle, ChevronLeft, ChevronRight, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { fetchRecruits, fetchMyActiveRecruits, fetchMyMemberships, PAGE_SIZE, type RecruitFilters } from "@/lib/recruits"
import { RecruitCard, type ParticipationBadge } from "@/components/game/RecruitCard"
import { EmptyState } from "@/components/game/EmptyState"
import { Pagination } from "@/components/game/Pagination"
import { JOB_OPTIONS } from "@/lib/constants"
import type { PartyRecruit, PartyMember, RecruitType, RecruitJoinMode, RecruitStatus, JobClass } from "@/types"

export function RecruitListPage() {
  const { user } = useAuth()
  const [recruits, setRecruits] = useState<PartyRecruit[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // 내 모집글 & 참가 상태
  const [myRecruits, setMyRecruits] = useState<PartyRecruit[]>([])
  const [myMemberships, setMyMemberships] = useState<PartyMember[]>([])

  // 필터
  const [recruitType, setRecruitType] = useState<RecruitType | "">("")
  const [keyword, setKeyword] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [status, setStatus] = useState<RecruitStatus | "">("")
  const [joinMode, setJoinMode] = useState<RecruitJoinMode | "">("")
  const [jobClass, setJobClass] = useState<JobClass | "">("")
  const [dayOffset, setDayOffset] = useState(0) // 0: 오늘, 1: 내일, -1: 어제

  // 날짜 표시 함수
  const getDateLabel = (offset: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(today)
    targetDate.setDate(today.getDate() + offset)

    const month = targetDate.getMonth() + 1
    const day = targetDate.getDate()
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][targetDate.getDay()]

    if (offset === 0) return `${month}/${day} (${dayOfWeek}) 오늘`
    if (offset === 1) return `${month}/${day} (${dayOfWeek}) 내일`
    if (offset > 1) return `${month}/${day} (${dayOfWeek}) +${offset}일`
    return `${month}/${day} (${dayOfWeek})`
  }

  // 날짜 조정
  const adjustDate = (delta: number) => {
    setDayOffset((prev) => Math.max(-7, Math.min(30, prev + delta)))
    setPage(1)
  }

  // 필터 초기화
  const resetDateFilter = () => {
    setDayOffset(0)
    setPage(1)
  }

  const loadRecruits = useCallback(async () => {
    setLoading(true)
    try {
      const filters: RecruitFilters = {}
      if (recruitType) filters.recruitType = recruitType
      if (keyword) filters.keyword = keyword
      if (status) filters.status = status
      if (joinMode) filters.joinMode = joinMode
      if (jobClass) filters.jobClass = jobClass

      // dayOffset을 YYYY-MM-DD 형식으로 변환
      if (dayOffset !== 0 || recruitType || keyword || status || joinMode || jobClass) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const targetDate = new Date(today)
        targetDate.setDate(today.getDate() + dayOffset)
        filters.scheduledDate = targetDate.toISOString().split("T")[0]
      }

      const result = await fetchRecruits(filters, page)
      setRecruits(result.data)
      setTotalCount(result.count)
    } catch {
      setRecruits([])
      setTotalCount(0)
    }
    setLoading(false)
  }, [recruitType, keyword, status, joinMode, jobClass, dayOffset, page])

  // 참가 상태 맵: recruit_id → badge type
  const membershipMap = useMemo(() => {
    const map = new Map<string, ParticipationBadge>()
    if (user) {
      for (const r of myRecruits) {
        map.set(r.id, "author")
      }
      for (const m of myMemberships) {
        if (!map.has(m.recruit_id)) {
          map.set(m.recruit_id, m.status === "accepted" ? "accepted" : "pending")
        }
      }
    }
    return map
  }, [user, myRecruits, myMemberships])

  // 내 모집글 & 참가 데이터 로드
  const loadMyData = useCallback(async () => {
    if (!user) {
      setMyRecruits([])
      setMyMemberships([])
      return
    }
    try {
      const [recruitsRes, membershipsRes] = await Promise.all([
        fetchMyActiveRecruits(user.id),
        fetchMyMemberships(user.id),
      ])
      setMyRecruits(recruitsRes)
      setMyMemberships(membershipsRes)
    } catch {
      setMyRecruits([])
      setMyMemberships([])
    }
  }, [user])

  useEffect(() => {
    loadRecruits()
  }, [loadRecruits])

  useEffect(() => {
    loadMyData()
  }, [loadMyData])

  const handleSearch = () => {
    setKeyword(searchInput)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="space-y-6 p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">파티 모집</h2>
        {user && (
          <Button asChild size="sm">
            <Link to="/recruit/new">
              <Plus className="mr-1.5 h-4 w-4" />
              모집글 등록
            </Link>
          </Button>
        )}
      </div>

      {/* 모집 유형 탭 */}
      <Tabs
        value={recruitType || "all"}
        onValueChange={(v) => {
          setRecruitType(v === "all" ? "" : (v as RecruitType))
          setPage(1)
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
          <TabsTrigger value="party" className="flex-1">
            <Users className="mr-1.5 h-3.5 w-3.5" />
            파티 모집
          </TabsTrigger>
          <TabsTrigger value="guild_war" className="flex-1">
            <Swords className="mr-1.5 h-3.5 w-3.5" />
            길드대전
          </TabsTrigger>
          <TabsTrigger value="chaos_tower" className="flex-1">
            <Castle className="mr-1.5 h-3.5 w-3.5" />
            혼돈의탑
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 필터 바 */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex flex-1 items-center gap-2">
            <Input
              placeholder="제목 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="min-w-0 flex-1"
            />
            <Button variant="secondary" size="sm" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* 날짜 선택 */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => adjustDate(-1)}
              disabled={dayOffset <= -7}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-center text-sm font-medium">
              {getDateLabel(dayOffset)}
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => adjustDate(1)}
              disabled={dayOffset >= 30}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {dayOffset !== 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetDateFilter}
                className="ml-1"
              >
                초기화
              </Button>
            )}
          </div>

          <Select
            value={status || "all"}
            onValueChange={(v) => {
              setStatus(v === "all" ? "" : (v as RecruitStatus))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="open">모집중</SelectItem>
              <SelectItem value="full">모집완료</SelectItem>
              <SelectItem value="closed">마감</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={joinMode || "all"}
            onValueChange={(v) => {
              setJoinMode(v === "all" ? "" : (v as RecruitJoinMode))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="참여방식" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="first_come">선착순</SelectItem>
              <SelectItem value="approval">승인제</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={jobClass || "all"}
            onValueChange={(v) => {
              setJobClass(v === "all" ? "" : (v as JobClass))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="직업" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              {JOB_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 내 모집글 (로그인 + 활성 모집글 있을 때만) */}
      {user && myRecruits.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-yellow-400">내 모집글</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myRecruits.map((recruit) => (
              <RecruitCard key={recruit.id} recruit={recruit} participationBadge="author" />
            ))}
          </div>
          <hr className="border-border" />
        </div>
      )}

      {/* 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : recruits.length === 0 ? (
        <EmptyState icon={Users} title="등록된 모집글이 없습니다" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recruits.map((recruit) => (
            <RecruitCard
              key={recruit.id}
              recruit={recruit}
              participationBadge={membershipMap.get(recruit.id)}
            />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
