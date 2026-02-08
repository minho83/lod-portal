import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { LogIn, Save, Trash2, Ban, ShieldAlert, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { JOB_CONFIG } from "@/components/game/ClassBadge"
import { fetchBlacklist, removeFromBlacklist } from "@/lib/blacklist"
import { getMyReports } from "@/lib/scam-reports"
import { NotificationSettings } from "@/components/settings/NotificationSettings"
import { REPORT_TYPE_LABELS } from "@/types"
import type { JobClass, BlacklistEntry, ScamReport } from "@/types"

const JOB_OPTIONS = Object.entries(JOB_CONFIG) as [JobClass, (typeof JOB_CONFIG)[JobClass]][]

const REPORT_STATUS_CONFIG = {
  pending: { label: "접수됨", icon: Clock, variant: "default" as const },
  reviewing: { label: "검토 중", icon: AlertCircle, variant: "secondary" as const },
  confirmed: { label: "사기 확인", icon: CheckCircle2, variant: "destructive" as const },
  dismissed: { label: "기각", icon: XCircle, variant: "outline" as const },
  resolved: { label: "처리 완료", icon: CheckCircle2, variant: "outline" as const },
}

export function ProfilePage() {
  const { user, profile, loading, signInWithDiscord, updateProfile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [nickname, setNickname] = useState("")
  const [gameClass, setGameClass] = useState<JobClass | "">("")
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // 블랙리스트
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([])
  const [blacklistLoading, setBlacklistLoading] = useState(false)

  // 신고 목록
  const [reports, setReports] = useState<ScamReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)

  const activeTab = searchParams.get("tab") || "profile"

  const loadBlacklist = useCallback(async () => {
    setBlacklistLoading(true)
    try {
      const data = await fetchBlacklist()
      setBlacklist(data)
    } catch {
      // ignore
    }
    setBlacklistLoading(false)
  }, [])

  const loadReports = useCallback(async () => {
    setReportsLoading(true)
    try {
      const data = await getMyReports()
      setReports(data)
    } catch {
      // ignore
    }
    setReportsLoading(false)
  }, [])

  // profile이 로드되면 폼 초기화
  useEffect(() => {
    if (profile && !initialized) {
      setNickname(profile.game_nickname ?? "")
      setGameClass(profile.game_class ?? "")
      setInitialized(true)
      loadBlacklist()
      loadReports()
    }
  }, [profile, initialized, loadBlacklist, loadReports])

  if (loading) {
    return (
      <div className="mx-auto max-w-lg space-y-6 p-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">로그인이 필요합니다</p>
            <Button onClick={signInWithDiscord}>
              <LogIn className="mr-2 h-4 w-4" />
              Discord로 로그인
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const discordName = user.user_metadata.full_name ?? user.user_metadata.name ?? "유저"
  const avatarUrl = user.user_metadata.avatar_url

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({
      game_nickname: nickname || null,
      game_class: (gameClass as JobClass) || null,
    })
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      <h2 className="text-xl font-bold">프로필</h2>

      <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">내 정보</TabsTrigger>
          <TabsTrigger value="notifications">알람 설정</TabsTrigger>
          <TabsTrigger value="blacklist">블랙리스트</TabsTrigger>
          <TabsTrigger value="reports">내 신고</TabsTrigger>
        </TabsList>

        {/* ═══ 내 정보 탭 ═══ */}
        <TabsContent value="profile" className="space-y-4">
          {/* Discord 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Discord 계정</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar size="lg">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={discordName} />
                ) : null}
                <AvatarFallback>{discordName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{discordName}</p>
                <p className="text-xs text-muted-foreground">
                  {user.email ?? "이메일 비공개"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 게임 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">게임 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="nickname" className="text-sm font-medium">
                  게임 닉네임
                </label>
                <Input
                  id="nickname"
                  placeholder="게임 내 닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="game-class" className="text-sm font-medium">
                  주 직업
                </label>
                <Select
                  value={gameClass}
                  onValueChange={(v) => setGameClass(v as JobClass)}
                >
                  <SelectTrigger id="game-class">
                    <SelectValue placeholder="직업 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_OPTIONS.map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className={config.textClass}>{config.kr}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "저장 중..." : "저장"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ 알람 설정 탭 ═══ */}
        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        {/* ═══ 블랙리스트 탭 ═══ */}
        <TabsContent value="blacklist">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Ban className="h-4 w-4" />
                블랙리스트
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {blacklistLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : blacklist.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  등록된 블랙리스트가 없습니다
                </p>
              ) : (
                blacklist.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {entry.blocked_user?.game_nickname ??
                          entry.blocked_user?.discord_username ??
                          "알 수 없는 유저"}
                      </p>
                      {entry.reason && (
                        <p className="text-xs text-muted-foreground">
                          {entry.reason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-destructive hover:text-destructive"
                      onClick={async () => {
                        if (!confirm("블랙리스트에서 해제하시겠습니까?")) return
                        await removeFromBlacklist(entry.id)
                        loadBlacklist()
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ 내 신고 탭 ═══ */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldAlert className="h-4 w-4" />
                내 신고 목록
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reportsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : reports.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  신고 내역이 없습니다
                </p>
              ) : (
                reports.map((report) => {
                  const statusConfig = REPORT_STATUS_CONFIG[report.status]
                  const StatusIcon = statusConfig.icon
                  return (
                    <div key={report.id} className="space-y-2 rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{report.title}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{REPORT_TYPE_LABELS[report.report_type]}</span>
                            <span>·</span>
                            <span>피신고자: {report.suspect_name}</span>
                          </div>
                        </div>
                        <Badge variant={statusConfig.variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {report.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        신고일: {new Date(report.created_at).toLocaleDateString("ko-KR")}
                      </p>
                      {report.admin_note && (
                        <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
                          <p className="font-medium text-muted-foreground">운영진 메모</p>
                          <p className="mt-1">{report.admin_note}</p>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
