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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  updateRecruitStatus,
  applyToRecruit,
  handleApplication,
  leaveRecruit,
} from "@/lib/recruits"
import { timeAgo } from "@/lib/utils"
import { SlotDisplay } from "@/components/game/SlotDisplay"
import { MemberList } from "@/components/game/MemberList"
import { STATUS_CONFIG } from "@/components/game/RecruitCard"
import { JOB_OPTIONS } from "@/lib/constants"
import type { PartyRecruit, JobClass, RecruitStatus } from "@/types"

export function RecruitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [recruit, setRecruit] = useState<PartyRecruit | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // 신청 폼
  const [applyClass, setApplyClass] = useState<JobClass>("warrior")
  const [applyName, setApplyName] = useState(profile?.game_nickname ?? "")
  const [applyError, setApplyError] = useState("")
  const [applying, setApplying] = useState(false)

  const loadRecruit = useCallback(async () => {
    if (!id) return
    const data = await fetchRecruitById(id)
    setRecruit(data)
    setLoading(false)
  }, [id])

  useEffect(() => {
    loadRecruit()
  }, [loadRecruit])

  // 프로필 변경 시 기본값 업데이트
  useEffect(() => {
    if (profile?.game_nickname) setApplyName(profile.game_nickname)
    if (profile?.game_class) setApplyClass(profile.game_class)
  }, [profile])

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

  const isAuthor = user?.id === recruit.author_id
  const members = recruit.members ?? []
  const myMembership = members.find(
    (m) => m.user_id === user?.id && ["accepted", "pending"].includes(m.status),
  )
  const canApply =
    user &&
    !isAuthor &&
    !myMembership &&
    recruit.status === "open"

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
          </div>
          <CardTitle className="text-xl">{recruit.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* 작성자 액션 */}
          {isAuthor && recruit.status === "open" && (
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

          {isAuthor && recruit.status === "full" && (
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

          {isAuthor && recruit.status === "closed" && (
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
              탈퇴
            </Button>
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
