import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { createRecruit } from "@/lib/recruits"
import { JOB_OPTIONS } from "@/lib/constants"
import type { JobClass, JobSlots, RecruitJoinMode } from "@/types"

export function NewRecruitPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [joinMode, setJoinMode] = useState<RecruitJoinMode>("approval")

  // 직업 슬롯
  const [slots, setSlots] = useState<JobSlots>({
    warrior: 1,
    rogue: 1,
    mage: 1,
    cleric: 1,
    taoist: 1,
  })

  // 리더 정보
  const [leaderName, setLeaderName] = useState(profile?.game_nickname ?? "")
  const [leaderClass, setLeaderClass] = useState<JobClass>(
    profile?.game_class ?? "warrior",
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const totalSlots = Object.values(slots).reduce((a, b) => a + b, 0)

  const updateSlot = (job: JobClass, value: string) => {
    const num = Math.max(0, Math.min(10, Number(value) || 0))
    setSlots((prev) => ({ ...prev, [job]: num }))
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            로그인이 필요합니다
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async () => {
    setError("")

    if (!title.trim()) return setError("제목을 입력해주세요")
    if (totalSlots < 2) return setError("최소 2명 이상의 슬롯을 설정해주세요")
    if (!leaderName.trim()) return setError("리더 캐릭터명을 입력해주세요")

    setSubmitting(true)
    try {
      const recruit = await createRecruit(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          scheduled_at: scheduledAt || undefined,
          join_mode: joinMode,
          job_slots: slots,
        },
        leaderName.trim(),
        leaderClass,
      )
      navigate(`/recruit/${recruit.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`등록 실패: ${msg}`)
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/recruit")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>파티 모집글 등록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 제목 */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              제목 *
            </label>
            <Input
              id="title"
              placeholder="파티 모집 제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* 설명 */}
          <div className="space-y-2">
            <label htmlFor="desc" className="text-sm font-medium">
              설명
            </label>
            <Textarea
              id="desc"
              placeholder="파티 설명, 조건 등"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 장소 + 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                장소
              </label>
              <Input
                id="location"
                placeholder="예: 토벌대, 에반"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="scheduled" className="text-sm font-medium">
                예정 시간
              </label>
              <Input
                id="scheduled"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          </div>

          {/* 참여 방식 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">참여 방식</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={joinMode === "approval" ? "default" : "outline"}
                onClick={() => setJoinMode("approval")}
                className="w-full"
              >
                승인제
              </Button>
              <Button
                type="button"
                variant={joinMode === "first_come" ? "default" : "outline"}
                onClick={() => setJoinMode("first_come")}
                className="w-full"
              >
                선착순
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {joinMode === "approval"
                ? "신청 후 리더가 수락/거절합니다"
                : "신청 즉시 참가됩니다"}
            </p>
          </div>

          {/* 직업 슬롯 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              직업별 모집 인원 (총 {totalSlots}명)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {JOB_OPTIONS.map(({ value, label }) => (
                <div key={value} className="space-y-1 text-center">
                  <span className="text-xs font-medium">{label}</span>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={slots[value]}
                    onChange={(e) => updateSlot(value, e.target.value)}
                    className="text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 리더 정보 */}
          <div className="space-y-2 rounded-lg border border-border p-3">
            <label className="text-sm font-medium">리더 정보 (본인)</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="캐릭터명 *"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
              />
              <Select
                value={leaderClass}
                onValueChange={(v) => setLeaderClass(v as JobClass)}
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
          </div>

          {/* 에러 */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* 등록 버튼 */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "등록 중..." : "모집글 등록"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
