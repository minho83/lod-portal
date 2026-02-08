import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Send, Minus, Plus, Save, Trash2, FolderOpen } from "lucide-react"
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
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { createRecruit, getLastRecruitTime } from "@/lib/recruits"
import { getMyTemplates, createTemplate, deleteTemplate } from "@/lib/templates"
import { JOB_OPTIONS, RECRUIT_TYPE_CONFIG, RECRUIT_TYPES } from "@/lib/constants"
import type { JobClass, JobSlots, RecruitJoinMode, RecruitType, PartyTemplate } from "@/types"

function getDefaultHour(): number {
  const now = new Date()
  return Math.min(now.getHours() + 1, 23)
}

export function NewRecruitPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [recruitType, setRecruitType] = useState<RecruitType>("party")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [partyLocation, setPartyLocation] = useState("")
  const [joinMode, setJoinMode] = useState<RecruitJoinMode>("approval")

  // 예정 시간: 날짜 + 시/분
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0] // YYYY-MM-DD
  })
  const [hour, setHour] = useState(getDefaultHour)
  const [minute, setMinute] = useState(0)

  // 템플릿
  const [templates, setTemplates] = useState<PartyTemplate[]>([])
  const [templateName, setTemplateName] = useState("")
  const [saving, setSaving] = useState(false)

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

  // 도배 방지 쿨타임 (5분 = 300초)
  const COOLDOWN_SECONDS = 300
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [loadingCooldown, setLoadingCooldown] = useState(true)

  const totalSlots = Object.values(slots).reduce((a, b) => a + b, 0)
  const canSubmit = remainingSeconds === null || remainingSeconds <= 0

  // 템플릿 목록 로드
  useEffect(() => {
    if (user) {
      getMyTemplates().then(setTemplates).catch(console.error)
    }
  }, [user])

  // 도배 방지: 마지막 등록 시간 확인 및 쿨타임 계산
  useEffect(() => {
    if (!user) {
      setLoadingCooldown(false)
      return
    }

    const checkCooldown = async () => {
      try {
        const lastTime = await getLastRecruitTime()
        if (!lastTime) {
          setRemainingSeconds(null) // 등록 가능
          setLoadingCooldown(false)
          return
        }

        const elapsed = Math.floor((Date.now() - lastTime.getTime()) / 1000)
        const remaining = COOLDOWN_SECONDS - elapsed

        if (remaining > 0) {
          setRemainingSeconds(remaining)
        } else {
          setRemainingSeconds(null) // 등록 가능
        }
        setLoadingCooldown(false)
      } catch (error) {
        console.error("Failed to check cooldown:", error)
        setRemainingSeconds(null) // 에러 시 등록 가능하게 처리
        setLoadingCooldown(false)
      }
    }

    checkCooldown()
  }, [user])

  // 1초마다 남은 시간 업데이트
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return null // 쿨타임 종료
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [remainingSeconds])

  // 복제 기능: location.state에서 데이터 가져오기
  useEffect(() => {
    const cloneData = location.state?.clone as Partial<typeof slots> | undefined
    if (cloneData) {
      setRecruitType((cloneData as any).recruit_type || "party")
      setTitle((cloneData as any).title || "")
      setDescription((cloneData as any).description || "")
      setPartyLocation((cloneData as any).location || "")
      setJoinMode((cloneData as any).join_mode || "approval")
      if ((cloneData as any).job_slots) {
        setSlots((cloneData as any).job_slots)
      }
      toast.success("파티 정보를 복제했습니다. 시간을 수정하고 등록하세요.")
    }
  }, [location.state])

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

  // 템플릿 저장
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("템플릿 이름을 입력하세요")
      return
    }

    setSaving(true)
    try {
      await createTemplate({
        template_name: templateName,
        recruit_type: recruitType,
        location: partyLocation || null,
        join_mode: joinMode,
        slots,
        description: description || null,
      })

      toast.success(`템플릿 "${templateName}" 저장 완료!`)
      setTemplateName("")

      // 목록 새로고침
      const updated = await getMyTemplates()
      setTemplates(updated)
    } catch (error) {
      console.error("Failed to save template:", error)
      toast.error("템플릿 저장 실패")
    } finally {
      setSaving(false)
    }
  }

  // 템플릿 불러오기
  const handleLoadTemplate = (template: PartyTemplate) => {
    setRecruitType(template.recruit_type)
    setPartyLocation(template.location || "")
    setJoinMode(template.join_mode)
    setSlots(template.slots)
    setDescription(template.description || "")
    toast.success(`템플릿 "${template.template_name}" 불러오기 완료!`)
  }

  // 템플릿 삭제
  const handleDeleteTemplate = async (id: string, name: string) => {
    if (!confirm(`템플릿 "${name}"을(를) 삭제하시겠습니까?`)) return

    try {
      await deleteTemplate(id)
      toast.success("템플릿 삭제 완료")

      // 목록 새로고침
      const updated = await getMyTemplates()
      setTemplates(updated)
    } catch (error) {
      console.error("Failed to delete template:", error)
      toast.error("템플릿 삭제 실패")
    }
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

    // 쿨타임 체크
    if (!canSubmit) {
      const minutes = Math.floor(remainingSeconds! / 60)
      const seconds = remainingSeconds! % 60
      return setError(`도배 방지: ${minutes}분 ${seconds}초 후 등록 가능합니다`)
    }

    if (!title.trim()) return setError("제목을 입력해주세요")
    if (totalSlots < 2) return setError("최소 2명 이상의 슬롯을 설정해주세요")
    if (leaderJoins && !leaderName.trim())
      return setError("리더 캐릭터명을 입력해주세요")

    // 선택한 날짜 + 시:분으로 ISO string 생성
    const scheduled = new Date(date)
    scheduled.setHours(hour, minute, 0, 0)

    setSubmitting(true)
    try {
      const recruit = await createRecruit(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          location: partyLocation.trim() || undefined,
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

  // 직업 슬롯을 간단하게 표시하는 함수
  const formatSlots = (slots: JobSlots) => {
    const jobLabels: Record<JobClass, string> = {
      warrior: "전",
      rogue: "도",
      mage: "법",
      cleric: "직",
      taoist: "도가",
    }
    return Object.entries(slots)
      .filter(([_, count]) => count > 0)
      .map(([job, count]) => `${jobLabels[job as JobClass]}${count}`)
      .join(" ")
  }

  return (
    <div className="p-4">
      <div className="mx-auto mb-4 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/recruit")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          목록으로 돌아가기
        </Button>
      </div>

      {/* 데스크톱: 2열 레이아웃, 모바일: 1열 */}
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1fr_320px]">
        {/* 왼쪽: 메인 폼 */}
        <Card className="h-fit">
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
                value={partyLocation}
                onChange={(e) => setPartyLocation(e.target.value)}
              />
            </div>
          </div>

          {/* 예정 시간 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">예정 시간</label>
            <div className="grid grid-cols-2 gap-2">
              {/* 날짜 선택 */}
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              {/* 시간 선택 */}
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

          {/* 도배 방지 쿨타임 상태 */}
          {loadingCooldown ? (
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-center text-sm text-muted-foreground">
              쿨타임 확인 중...
            </div>
          ) : canSubmit ? (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-center">
              <p className="text-sm font-medium text-green-500">✅ 등록 가능</p>
            </div>
          ) : (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center">
              <p className="text-sm font-medium text-red-500">
                ⏳ 도배 방지: {Math.floor(remainingSeconds! / 60)}분 {remainingSeconds! % 60}초 후 등록 가능
              </p>
            </div>
          )}

          {/* 에러 */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* 등록 버튼 */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "등록 중..." : "모집글 등록"}
          </Button>
        </CardContent>
      </Card>

        {/* 오른쪽: 템플릿 관리 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">템플릿 관리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 템플릿 저장 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">현재 설정 저장</label>
                  <span className="text-xs text-muted-foreground">
                    {templates.length}/5
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="템플릿 이름"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    disabled={templates.length >= 5}
                    className="text-sm"
                  />
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={saving || templates.length >= 5}
                    size="sm"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
                {templates.length >= 5 && (
                  <p className="text-xs text-warning">
                    ⚠️ 최대 5개까지 저장 가능
                  </p>
                )}
              </div>

              {/* 템플릿 목록 */}
              {templates.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">저장된 템플릿</label>
                  <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
                    {templates.map((template) => {
                      const typeConfig = RECRUIT_TYPE_CONFIG[template.recruit_type]
                      return (
                        <div
                          key={template.id}
                          className="group rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                        >
                          <div className="mb-2 flex items-start justify-between gap-2">
                            <button
                              onClick={() => handleLoadTemplate(template)}
                              className="flex-1 text-left"
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                                <span className="text-sm font-medium">{template.template_name}</span>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{typeConfig.label}</span>
                                  {template.location && (
                                    <>
                                      <span>·</span>
                                      <span>{template.location}</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">인원:</span>
                                  <span>{formatSlots(template.slots)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">방식:</span>
                                  <span>{template.join_mode === "approval" ? "승인제" : "선착순"}</span>
                                </div>
                                {template.description && (
                                  <div className="mt-1 line-clamp-2 text-xs">
                                    {template.description}
                                  </div>
                                )}
                              </div>
                            </button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="shrink-0 text-destructive opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                              onClick={() => handleDeleteTemplate(template.id, template.template_name)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {templates.length === 0 && (
                <div className="rounded-lg border border-dashed p-6 text-center">
                  <FolderOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    저장된 템플릿이 없습니다
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    자주 사용하는 설정을 저장해보세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
