import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Send, Minus, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { createRecruit } from "@/lib/recruits"
import { JOB_OPTIONS, RECRUIT_TYPE_CONFIG, RECRUIT_TYPES } from "@/lib/constants"
import type { JobClass, JobSlots, RecruitJoinMode, RecruitType } from "@/types"

function getDefaultHour(): number {
  const now = new Date()
  return Math.min(now.getHours() + 1, 23)
}

export function NewRecruitPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [recruitType, setRecruitType] = useState<RecruitType>("party")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [joinMode, setJoinMode] = useState<RecruitJoinMode>("approval")

  // 예정 시간: 오늘 날짜 기본, 시/분만 조작
  const [hour, setHour] = useState(getDefaultHour)
  const [minute, setMinute] = useState(0)

  // 직업 슬롯
  const [slots, setSlots] = useState<JobSlots>({
    warrior: 1,
    rogue: 1,
    mage: 1,
    cleric: 1,
    taoist: 1,
  })

  // 리더 참여 여부
  const [leaderJoins, setLeaderJoins] = useState(true)
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

  const adjustHour = (delta: number) => {
    setHour((prev) => {
      const next = prev + delta
      if (next < 0) return 23
      if (next > 23) return 0
      return next
    })
  }

  const adjustMinute = (delta: number) => {
    setMinute((prev) => {
      const next = prev + delta
      if (next < 0) return 50
      if (next >= 60) return 0
      return next
    })
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
    if (leaderJoins && !leaderName.trim())
      return setError("리더 캐릭터명을 입력해주세요")

    // 오늘 날짜 + 선택한 시:분으로 ISO string 생성
    const scheduled = new Date()
    scheduled.setHours(hour, minute, 0, 0)

    setSubmitting(true)
    try {
      const recruit = await createRecruit(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          scheduled_at: scheduled.toISOString(),
          join_mode: joinMode,
          job_slots: slots,
          recruit_type: recruitType,
        },
        leaderJoins
          ? { name: leaderName.trim(), jobClass: leaderClass }
          : undefined,
      )
      navigate(`/recruit/${recruit.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(`등록 실패: ${msg}`)
      setSubmitting(false)
    }
  }

  const todayStr = new Date().toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/recruit")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>모집글 등록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 모집 유형 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">모집 유형</label>
            <div className="grid grid-cols-3 gap-2">
              {RECRUIT_TYPES.map((type) => {
                const cfg = RECRUIT_TYPE_CONFIG[type]
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={recruitType === type ? "default" : "outline"}
                    onClick={() => setRecruitType(type)}
                    className="w-full text-xs"
                  >
                    {cfg.label}
                  </Button>
                )
              })}
            </div>
          </div>

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

          {/* 장소 + 예정 시간 */}
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
              <label className="text-sm font-medium">예정 시간</label>
              <p className="text-xs text-muted-foreground">{todayStr}</p>
              <div className="flex items-center gap-1">
                {/* 시 */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => adjustHour(-1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={hour}
                  onChange={(e) => setHour(Math.max(0, Math.min(23, Number(e.target.value) || 0)))}
                  className="h-8 w-12 text-center px-1"
                />
                <span className="text-sm font-medium">:</span>
                {/* 분 */}
                <Input
                  type="number"
                  min={0}
                  max={59}
                  step={10}
                  value={String(minute).padStart(2, "0")}
                  onChange={(e) => setMinute(Math.max(0, Math.min(59, Number(e.target.value) || 0)))}
                  className="h-8 w-12 text-center px-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => adjustMinute(10)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
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

          {/* 리더 참여 체크박스 + 정보 */}
          <div className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="leaderJoins"
                checked={leaderJoins}
                onCheckedChange={(checked) => setLeaderJoins(checked === true)}
              />
              <label htmlFor="leaderJoins" className="text-sm font-medium cursor-pointer">
                파티장도 파티에 참여
              </label>
            </div>
            {leaderJoins && (
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
            )}
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
