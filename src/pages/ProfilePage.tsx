import { useEffect, useState } from "react"
import { LogIn, Save } from "lucide-react"
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { JOB_CONFIG } from "@/components/game/ClassBadge"
import type { JobClass } from "@/types"

const JOB_OPTIONS = Object.entries(JOB_CONFIG) as [JobClass, (typeof JOB_CONFIG)[JobClass]][]

export function ProfilePage() {
  const { user, profile, loading, signInWithDiscord, updateProfile } = useAuth()

  const [nickname, setNickname] = useState("")
  const [gameClass, setGameClass] = useState<JobClass | "">("")
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // profile이 로드되면 폼 초기화
  useEffect(() => {
    if (profile && !initialized) {
      setNickname(profile.game_nickname ?? "")
      setGameClass(profile.game_class ?? "")
      setInitialized(true)
    }
  }, [profile, initialized])

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
    </div>
  )
}
