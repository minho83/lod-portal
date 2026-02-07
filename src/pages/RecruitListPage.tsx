import { useEffect, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { Search, Plus, Users, Swords, Castle, Calendar } from "lucide-react"
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
import { fetchRecruits, PAGE_SIZE, type RecruitFilters } from "@/lib/recruits"
import { RecruitCard } from "@/components/game/RecruitCard"
import { EmptyState } from "@/components/game/EmptyState"
import { Pagination } from "@/components/game/Pagination"
import { JOB_OPTIONS } from "@/lib/constants"
import type { PartyRecruit, RecruitType, RecruitJoinMode, RecruitStatus, JobClass } from "@/types"

export function RecruitListPage() {
  const { user } = useAuth()
  const [recruits, setRecruits] = useState<PartyRecruit[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // 필터
  const [recruitType, setRecruitType] = useState<RecruitType | "">("")
  const [keyword, setKeyword] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [status, setStatus] = useState<RecruitStatus | "">("")
  const [joinMode, setJoinMode] = useState<RecruitJoinMode | "">("")
  const [jobClass, setJobClass] = useState<JobClass | "">("")
  const [selectedDate, setSelectedDate] = useState<string>("")

  const loadRecruits = useCallback(async () => {
    setLoading(true)
    try {
      const filters: RecruitFilters = {}
      if (recruitType) filters.recruitType = recruitType
      if (keyword) filters.keyword = keyword
      if (status) filters.status = status
      if (joinMode) filters.joinMode = joinMode
      if (jobClass) filters.jobClass = jobClass
      if (selectedDate) filters.scheduledDate = selectedDate
      const result = await fetchRecruits(filters, page)
      setRecruits(result.data)
      setTotalCount(result.count)
    } catch {
      setRecruits([])
      setTotalCount(0)
    }
    setLoading(false)
  }, [recruitType, keyword, status, joinMode, jobClass, selectedDate, page])

  useEffect(() => {
    loadRecruits()
  }, [loadRecruits])

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

          {/* 날짜 선택기 */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setPage(1)
              }}
              className="w-40"
            />
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDate("")
                  setPage(1)
                }}
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
            <RecruitCard key={recruit.id} recruit={recruit} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
