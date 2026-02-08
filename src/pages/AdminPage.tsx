import { useState, useEffect } from "react"
import { Shield, Users, AlertTriangle, FileText, BarChart, Plus, Trash2, Search, CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import {
  getAdminBlacklists,
  addToBlacklist,
  removeFromBlacklist,
  getScamReportsAdmin,
  updateScamReportStatus,
  getUsers,
  searchUsers,
  getRecentTrades,
  getRecentRecruits,
  deleteTradeAdmin,
  deleteRecruitAdmin,
  getAdminStats,
} from "@/lib/admin"
import type { AdminBlacklist, ScamReport, UserProfile, Trade, PartyRecruit, AdminStats } from "@/types"
import { REPORT_TYPE_LABELS } from "@/types"

export default function AdminPage() {
  const { user } = useAuth()

  // 관리자 권한 확인 (실제로는 DB에서 is_admin 체크 필요)
  // 임시로 로그인 여부만 체크
  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>권한 없음</CardTitle>
            <CardDescription>관리자 권한이 필요합니다</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">관리자 페이지</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          시스템 관리 및 사용자 콘텐츠 모니터링
        </p>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stats">
            <BarChart className="w-4 h-4 mr-2" />
            통계
          </TabsTrigger>
          <TabsTrigger value="blacklist">
            <Shield className="w-4 h-4 mr-2" />
            블랙리스트
          </TabsTrigger>
          <TabsTrigger value="reports">
            <AlertTriangle className="w-4 h-4 mr-2" />
            사기 신고
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            사용자
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="w-4 h-4 mr-2" />
            콘텐츠
          </TabsTrigger>
        </TabsList>

        {/* 통계 탭 */}
        <TabsContent value="stats">
          <StatsTab />
        </TabsContent>

        {/* 블랙리스트 탭 */}
        <TabsContent value="blacklist">
          <BlacklistTab userId={user.id} />
        </TabsContent>

        {/* 사기 신고 탭 */}
        <TabsContent value="reports">
          <ReportsTab userId={user.id} />
        </TabsContent>

        {/* 사용자 탭 */}
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        {/* 콘텐츠 탭 */}
        <TabsContent value="content">
          <ContentTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// 통계 탭
// ============================================

function StatsTab() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getAdminStats()
      setStats(data)
    } catch (error) {
      console.error("Failed to load stats:", error)
      toast.error("통계 로드 실패")
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard icon={Users} label="총 사용자" value={stats.total_users} />
      <StatCard icon={FileText} label="총 거래글" value={stats.total_trades} />
      <StatCard icon={Users} label="총 파티 모집" value={stats.total_recruits} />
      <StatCard icon={AlertTriangle} label="사기 신고" value={stats.total_scam_reports} />
      <StatCard icon={Clock} label="대기 중 신고" value={stats.pending_scam_reports} color="text-warning" />
      <StatCard icon={Shield} label="블랙리스트" value={stats.blacklist_count} color="text-destructive" />
      <StatCard icon={Users} label="최근 가입 (7일)" value={stats.recent_signups} color="text-success" />
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color = "text-primary" }: {
  icon: any
  label: string
  value: number
  color?: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Icon className={`w-8 h-8 ${color}`} />
          <div>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 블랙리스트 탭
// ============================================

function BlacklistTab({ userId }: { userId: string }) {
  const [blacklists, setBlacklists] = useState<AdminBlacklist[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  useEffect(() => {
    loadBlacklists()
  }, [])

  const loadBlacklists = async () => {
    try {
      setLoading(true)
      const data = await getAdminBlacklists()
      setBlacklists(data)
    } catch (error) {
      console.error("Failed to load blacklists:", error)
      toast.error("블랙리스트 로드 실패")
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("정말 블랙리스트에서 해제하시겠습니까?")) return

    try {
      await removeFromBlacklist(id)
      toast.success("블랙리스트에서 해제되었습니다")
      loadBlacklists()
    } catch (error) {
      console.error("Failed to remove from blacklist:", error)
      toast.error("해제 실패")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">블랙리스트 관리</h2>
          <p className="text-sm text-muted-foreground">사기 유저 및 캐릭터 목록</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <AddBlacklistDialog
              userId={userId}
              onSuccess={() => {
                setAddDialogOpen(false)
                loadBlacklists()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : blacklists.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            블랙리스트가 비어있습니다
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {blacklists.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{item.target_character_name}</span>
                      {item.target_user && (
                        <Badge variant="outline">{item.target_user.discord_username}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">{item.reason}</div>
                    <div className="text-xs text-muted-foreground">
                      등록: {new Date(item.created_at).toLocaleString()}
                      {item.admin && ` · 관리자: ${item.admin.game_nickname || item.admin.discord_username}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AddBlacklistDialog({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const [characterName, setCharacterName] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!characterName.trim()) {
      toast.error("캐릭터명을 입력하세요")
      return
    }

    if (!reason.trim()) {
      toast.error("사유를 입력하세요")
      return
    }

    try {
      setLoading(true)
      await addToBlacklist({
        target_user_id: null, // 나중에 검색 기능 추가 시 연결
        target_character_name: characterName.trim(),
        reason: reason.trim(),
        banned_by: userId,
      })
      toast.success("블랙리스트에 추가되었습니다")
      onSuccess()
    } catch (error) {
      console.error("Failed to add to blacklist:", error)
      toast.error("추가 실패")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>블랙리스트 추가</DialogTitle>
        <DialogDescription>사기 유저 또는 캐릭터를 블랙리스트에 등록합니다</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="character-name">캐릭터명 *</Label>
          <Input
            id="character-name"
            placeholder="사기 유저의 캐릭터명"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reason">사유 *</Label>
          <Textarea
            id="reason"
            placeholder="블랙리스트 등록 사유를 입력하세요"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading ? "추가 중..." : "추가"}
        </Button>
      </DialogFooter>
    </form>
  )
}

// ============================================
// 사기 신고 탭
// ============================================

function ReportsTab({ userId }: { userId: string }) {
  const [reports, setReports] = useState<ScamReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ScamReport["status"] | "all">("all")

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await getScamReportsAdmin()
      setReports(data)
    } catch (error) {
      console.error("Failed to load reports:", error)
      toast.error("신고 목록 로드 실패")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: ScamReport["status"], note?: string) => {
    try {
      await updateScamReportStatus(id, status, note, userId)
      toast.success("상태가 변경되었습니다")
      loadReports()
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("상태 변경 실패")
    }
  }

  const filteredReports = filter === "all" ? reports : reports.filter((r) => r.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">사기 신고 관리</h2>
          <p className="text-sm text-muted-foreground">사용자 신고 처리</p>
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기중</SelectItem>
            <SelectItem value="reviewing">검토중</SelectItem>
            <SelectItem value="confirmed">확정</SelectItem>
            <SelectItem value="dismissed">기각</SelectItem>
            <SelectItem value="resolved">해결</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            신고 내역이 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReportCard({
  report,
  onStatusChange,
}: {
  report: ScamReport
  onStatusChange: (id: string, status: ScamReport["status"], note?: string) => void
}) {
  const [note, setNote] = useState(report.admin_note || "")

  const statusColors: Record<ScamReport["status"], string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    confirmed: "bg-red-500/10 text-red-500 border-red-500/20",
    dismissed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{report.title}</span>
                <Badge className={statusColors[report.status]}>{report.status}</Badge>
                <Badge variant="outline">{REPORT_TYPE_LABELS[report.report_type]}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                신고자: {report.reporter?.game_nickname || report.reporter?.discord_username} →
                피신고자: {report.suspect_name}
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-sm">{report.description}</div>

          {report.evidence_urls && report.evidence_urls.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">증거:</span>{" "}
              {report.evidence_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mr-2"
                >
                  링크 {i + 1}
                </a>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            신고일: {new Date(report.created_at).toLocaleString()}
          </div>

          {report.status === "pending" || report.status === "reviewing" ? (
            <div className="space-y-2">
              <Textarea
                placeholder="관리자 메모"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(report.id, "reviewing", note)}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  검토중
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onStatusChange(report.id, "confirmed", note)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  확정
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(report.id, "dismissed", note)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  기각
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(report.id, "resolved", note)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  해결
                </Button>
              </div>
            </div>
          ) : (
            report.admin_note && (
              <div className="text-sm bg-muted p-3 rounded-md">
                <span className="font-medium">관리자 메모:</span> {report.admin_note}
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// 사용자 탭
// ============================================

function UsersTab() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("검색어를 입력하세요")
      return
    }

    try {
      setLoading(true)
      const data = await searchUsers(searchQuery.trim())
      setUsers(data)
    } catch (error) {
      console.error("Failed to search users:", error)
      toast.error("검색 실패")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">사용자 관리</h2>
        <p className="text-sm text-muted-foreground">사용자 검색 및 조회</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Discord 이름 또는 게임 닉네임 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          검색
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">검색 중...</div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            검색 결과가 없습니다
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-semibold">{user.game_nickname || user.discord_username}</div>
                    <div className="text-sm text-muted-foreground">
                      Discord: {user.discord_username} · 가입: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {user.game_class && <Badge variant="outline">{user.game_class}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// 콘텐츠 탭
// ============================================

function ContentTab() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [recruits, setRecruits] = useState<PartyRecruit[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"trades" | "recruits">("trades")

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const [tradesData, recruitsData] = await Promise.all([
        getRecentTrades(20),
        getRecentRecruits(20),
      ])
      setTrades(tradesData)
      setRecruits(recruitsData)
    } catch (error) {
      console.error("Failed to load content:", error)
      toast.error("콘텐츠 로드 실패")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTrade = async (id: string) => {
    if (!confirm("정말 이 거래글을 삭제하시겠습니까?")) return

    try {
      await deleteTradeAdmin(id)
      toast.success("거래글이 삭제되었습니다")
      loadContent()
    } catch (error) {
      console.error("Failed to delete trade:", error)
      toast.error("삭제 실패")
    }
  }

  const handleDeleteRecruit = async (id: string) => {
    if (!confirm("정말 이 모집글을 삭제하시겠습니까?")) return

    try {
      await deleteRecruitAdmin(id)
      toast.success("모집글이 삭제되었습니다")
      loadContent()
    } catch (error) {
      console.error("Failed to delete recruit:", error)
      toast.error("삭제 실패")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">콘텐츠 관리</h2>
          <p className="text-sm text-muted-foreground">거래글 및 파티 모집글 관리</p>
        </div>
        <Select value={view} onValueChange={(v) => setView(v as typeof view)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trades">거래글</SelectItem>
            <SelectItem value="recruits">파티 모집글</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
      ) : view === "trades" ? (
        <div className="space-y-3">
          {trades.map((trade) => (
            <Card key={trade.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{trade.item_name}</span>
                      <Badge variant="outline">{trade.item_category}</Badge>
                      <Badge>{trade.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trade.price.toLocaleString()} {trade.price_unit} · {trade.seller?.game_nickname || "알 수 없음"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      등록: {new Date(trade.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTrade(trade.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {recruits.map((recruit) => (
            <Card key={recruit.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{recruit.title}</span>
                      <Badge variant="outline">{recruit.recruit_type}</Badge>
                      <Badge>{recruit.status}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {recruit.author?.game_nickname || "알 수 없음"} · {recruit.member_count}/{recruit.max_members}명
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      등록: {new Date(recruit.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRecruit(recruit.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
