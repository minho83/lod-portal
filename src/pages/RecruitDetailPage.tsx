import { useEffect, useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Zap,
  Shield,
  Send,
  Pencil,
  X,
  Check,
  Minus,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import {
  fetchRecruitById,
  updateRecruit,
  updateRecruitStatus,
  applyToRecruit,
  handleApplication,
  leaveRecruit,
} from "@/lib/recruits"
import { checkBlacklisted, addToBlacklist } from "@/lib/blacklist"
import { timeAgo } from "@/lib/utils"
import { SlotDisplay } from "@/components/game/SlotDisplay"
import { MemberList } from "@/components/game/MemberList"
import { STATUS_CONFIG } from "@/components/game/RecruitCard"
import { JOB_OPTIONS } from "@/lib/constants"
import { Ban, Copy } from "lucide-react"
import type { PartyRecruit, JobClass, JobSlots, RecruitStatus } from "@/types"

export function RecruitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [recruit, setRecruit] = useState<PartyRecruit | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // 편집 모드
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editHour, setEditHour] = useState(0)
  const [editMinute, setEditMinute] = useState(0)
  const [editSlots, setEditSlots] = useState<JobSlots>({
    warrior: 0,
    rogue: 0,
    mage: 0,
    cleric: 0,
    taoist: 0,
  })
  const [editError, setEditError] = useState("")

  // 블랙리스트 상태
  const [isBlocked, setIsBlocked] = useState(false)

  // 신청 폼
  const [applyClass, setApplyClass] = useState<JobClass>("warrior")
  const [applyName, setApplyName] = useState(profile?.game_nickname ?? "")
  const [applyError, setApplyError] = useState("")
  const [applying, setApplying] = useState(false)

  const loadRecruit = useCallback(async () => {
    if (!id) return
    const data = await fetchRecruitById(id)
    setRecruit(data)
    // 블랙리스트 체크
    if (data && user && user.id !== data.author_id) {
      const blocked = await checkBlacklisted(data.author_id, user.id)
      setIsBlocked(blocked)
    }
    setLoading(false)
  }, [id, user])

  useEffect(() => {
    loadRecruit()
  }, [loadRecruit])

  useEffect(() => {
    if (profile?.game_nickname) setApplyName(profile.game_nickname)
    if (profile?.game_class) setApplyClass(profile.game_class)
  }, [profile])

  const startEditing = () => {
    if (!recruit) return
    setEditTitle(recruit.title)
    setEditDesc(recruit.description ?? "")
    setEditLocation(recruit.location ?? "")
    if (recruit.scheduled_at) {
      const d = new Date(recruit.scheduled_at)
      setEditHour(d.getHours())
      setEditMinute(d.getMinutes())
    } else {
      setEditHour(new Date().getHours())
      setEditMinute(0)
    }
    setEditSlots({ ...recruit.job_slots })
    setEditError("")
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setEditError("")
  }

  const saveEdit = async () => {
    if (!recruit) return
    setEditError("")

    if (!editTitle.trim()) return setEditError("제목을 입력해주세요")
    const totalSlots = Object.values(editSlots).reduce((a, b) => a + b, 0)
    if (totalSlots < 2) return setEditError("최소 2명 이상의 슬롯을 설정해주세요")

    const scheduled = new Date()
    scheduled.setHours(editHour, editMinute, 0, 0)

    setUpdating(true)
    try {
      await updateRecruit(recruit.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        location: editLocation.trim() || undefined,
        scheduled_at: scheduled.toISOString(),
        job_slots: editSlots,
      })
      await loadRecruit()
      setEditing(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "수정 실패")
    }
    setUpdating(false)
  }

  const updateEditSlot = (job: JobClass, value: string) => {
    const num = Math.max(0, Math.min(10, Number(value) || 0))
    setEditSlots((prev) => ({ ...prev, [job]: num }))
  }

  const handleStatusChange = async (status: RecruitStatus) => {
    if (!recruit) return
    setUpdating(true)
    try {
      await updateRecruitStatus(recruit.id, status)
      await loadRecruit()
    } catch {
      // ignore
    }
    setUpdating(false)
  }

  const handleApply = async () => {
    if (!recruit || !user) return
    setApplyError("")
    if (!applyName.trim()) return setApplyError("캐릭터명을 입력해주세요")

    setApplying(true)
    try {
      await applyToRecruit(recruit.id, applyClass, applyName.trim(), recruit.join_mode)
      await loadRecruit()
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "신청 실패")
    }
    setApplying(false)
  }

  const handleMemberAction = async (
    memberId: string,
    action: "accepted" | "rejected" | "kicked",
  ) => {
    setUpdating(true)
    try {
      await handleApplication(memberId, action)
      await loadRecruit()
    } catch {
      // ignore
    }
    setUpdating(false)
  }

  const handleLeave = async (memberId: string) => {
    setUpdating(true)
    try {
      await leaveRecruit(memberId)
      await loadRecruit()
    } catch {
      // ignore
    }
    setUpdating(false)
  }

  const handleBlacklist = async (userId: string) => {
    if (!confirm("이 유저를 블랙리스트에 추가하시겠습니까?\n추가 후 이 유저는 내 파티에 신청할 수 없습니다.")) return
    setUpdating(true)
    try {
      await addToBlacklist(userId)
      await loadRecruit()
    } catch (err) {
      alert(err instanceof Error ? err.message : "블랙리스트 추가 실패")
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

  if (!recruit) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <AlertCircle className="h-10 w-10" />
            <p>모집글을 찾을 수 없습니다</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/recruit")}
            >
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 복제 기능
  const handleClone = () => {
    navigate("/recruit/new", {
      state: {
        clone: {
          recruit_type: recruit.recruit_type,
          title: recruit.title,
          description: recruit.description,
          location: recruit.location,
          join_mode: recruit.join_mode,
          job_slots: recruit.job_slots,
        },
      },
    })
  }

  const isAuthor = user?.id === recruit.author_id
  const members = recruit.members ?? []
  const myMembership = members.find(
    (m) => m.user_id === user?.id && ["accepted", "pending"].includes(m.status),
  )
  const canApply =
    user &&
    !isAuthor &&
    !myMembership &&
    !isBlocked &&
    recruit.status === "open"

  const canEdit = isAuthor && ["open", "full"].includes(recruit.status)

  const statusInfo = STATUS_CONFIG[recruit.status]
  const authorName =
    recruit.author?.game_nickname ??
    recruit.author?.discord_username ??
    "알 수 없음"

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/recruit")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      {/* 모집글 상세 */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            <Badge variant="outline" className="text-xs">
              {recruit.join_mode === "first_come" ? (
                <>
                  <Zap className="mr-1 h-3 w-3" />
                  선착순
                </>
              ) : (
                <>
                  <Shield className="mr-1 h-3 w-3" />
                  승인제
                </>
              )}
            </Badge>
            {recruit.location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="mr-1 h-3 w-3" />
                {recruit.location}
              </Badge>
            )}
            {/* 편집 버튼 */}
            {canEdit && !editing && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 gap-1 px-2 text-xs"
                onClick={startEditing}
              >
                <Pencil className="h-3 w-3" />
                수정
              </Button>
            )}
          </div>
          <CardTitle className="text-xl">{recruit.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 편집 모드 */}
          {editing ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">제목 *</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">설명</label>
                <Textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">장소</label>
                  <Input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">예정 시간</label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() =>
                        setEditHour((p) => (p <= 0 ? 23 : p - 1))
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      max={23}
                      value={editHour}
                      onChange={(e) =>
                        setEditHour(
                          Math.max(0, Math.min(23, Number(e.target.value) || 0)),
                        )
                      }
                      className="h-8 w-12 text-center px-1"
                    />
                    <span className="text-sm font-medium">:</span>
                    <Input
                      type="number"
                      min={0}
                      max={59}
                      step={10}
                      value={String(editMinute).padStart(2, "0")}
                      onChange={(e) =>
                        setEditMinute(
                          Math.max(0, Math.min(59, Number(e.target.value) || 0)),
                        )
                      }
                      className="h-8 w-12 text-center px-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() =>
                        setEditMinute((p) => (p >= 50 ? 0 : p + 10))
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  직업별 모집 인원 (총{" "}
                  {Object.values(editSlots).reduce((a, b) => a + b, 0)}명)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {JOB_OPTIONS.map(({ value, label }) => (
                    <div key={value} className="space-y-1 text-center">
                      <span className="text-xs font-medium">{label}</span>
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={editSlots[value]}
                        onChange={(e) => updateEditSlot(value, e.target.value)}
                        className="text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
              {editError && (
                <p className="text-sm text-destructive">{editError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={updating}
                  onClick={saveEdit}
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  저장
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* 설명 */}
              {recruit.description && (
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {recruit.description}
                </p>
              )}

              {/* 슬롯 현황 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">모집 현황</h4>
                <SlotDisplay
                  jobSlots={recruit.job_slots}
                  members={members}
                />
              </div>

              {/* 작성자 정보 */}
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{authorName}</p>
                  <p className="text-xs text-muted-foreground">파티장</p>
                </div>
              </div>

              {/* 시간 정보 */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  등록: {timeAgo(recruit.created_at)}
                </span>
                {recruit.scheduled_at && (
                  <span>
                    예정:{" "}
                    {new Date(recruit.scheduled_at).toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                <span>
                  만료: {new Date(recruit.expires_at).toLocaleDateString("ko-KR")}
                </span>
              </div>
            </>
          )}

          {/* 복제 버튼 (작성자만) */}
          {!editing && isAuthor && (
            <div className="border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleClone}
              >
                <Copy className="mr-2 h-4 w-4" />
                이 파티 복제하기
              </Button>
            </div>
          )}

          {/* 작성자 액션 */}
          {!editing && isAuthor && recruit.status === "open" && (
            <div className="flex gap-2 border-t border-border pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                disabled={updating}
                onClick={() => handleStatusChange("closed")}
              >
                모집 마감
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

          {!editing && isAuthor && recruit.status === "full" && (
            <div className="flex gap-2 border-t border-border pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                disabled={updating}
                onClick={() => handleStatusChange("closed")}
              >
                모집 마감
              </Button>
            </div>
          )}

          {!editing && isAuthor && recruit.status === "closed" && (
            <div className="flex gap-2 border-t border-border pt-4">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                disabled={updating}
                onClick={() => handleStatusChange("open")}
              >
                다시 모집
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 멤버 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            파티원 ({recruit.member_count}/{recruit.max_members})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MemberList
            members={members}
            isLeader={isAuthor}
            onAccept={(id) => handleMemberAction(id, "accepted")}
            onReject={(id) => handleMemberAction(id, "rejected")}
            onKick={(id) => handleMemberAction(id, "kicked")}
            onBlacklist={handleBlacklist}
            disabled={updating}
          />
        </CardContent>
      </Card>

      {/* 내 참가 상태 */}
      {myMembership && !isAuthor && (
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">
                {myMembership.status === "accepted"
                  ? "참가중입니다"
                  : "신청 대기중입니다"}
              </p>
              <p className="text-xs text-muted-foreground">
                {myMembership.character_name} / {myMembership.job_class}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              disabled={updating}
              onClick={() => handleLeave(myMembership.id)}
            >
              {myMembership.status === "pending" ? "신청 취소" : "탈퇴"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 블랙리스트 차단 안내 */}
      {isBlocked && !isAuthor && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4 text-muted-foreground">
            <Ban className="h-5 w-5 text-orange-400 shrink-0" />
            <p className="text-sm">파티장의 블랙리스트에 등록되어 신청할 수 없습니다.</p>
          </CardContent>
        </Card>
      )}

      {/* 신청 폼 */}
      {canApply && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">파티 신청</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="캐릭터명 *"
                value={applyName}
                onChange={(e) => setApplyName(e.target.value)}
              />
              <Select
                value={applyClass}
                onValueChange={(v) => setApplyClass(v as JobClass)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              {recruit.join_mode === "first_come"
                ? "선착순 - 신청 즉시 참가됩니다"
                : "승인제 - 파티장의 수락이 필요합니다"}
            </p>
            {applyError && (
              <p className="text-sm text-destructive">{applyError}</p>
            )}
            <Button
              onClick={handleApply}
              disabled={applying}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {applying
                ? "신청 중..."
                : recruit.join_mode === "first_come"
                  ? "참가하기"
                  : "신청하기"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
