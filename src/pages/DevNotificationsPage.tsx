import { useState } from "react"
import { Bell, Send, TestTube } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useAuth } from "@/contexts/AuthContext"
import { createNotification } from "@/lib/notifications"
import { showBrowserNotification, requestNotificationPermission, getNotificationPermission } from "@/lib/browser-notifications"
import { sendDiscordNotification, getDiscordWebhookSettings } from "@/lib/discord-webhook"
import type { NotificationType } from "@/types"

interface NotificationTest {
  type: NotificationType
  title: string
  message: string
  link?: string
  icon: string
  color: string
}

const NOTIFICATION_TESTS: NotificationTest[] = [
  {
    type: "party_application",
    title: "파티 신청",
    message: "테스트유저님이 '혼돈의 탑 파티'에 참가 신청했습니다",
    link: "/recruit",
    icon: "👥",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    type: "party_accepted",
    title: "파티 승인",
    message: "테스트유저님이 '혼돈의 탑 파티' 참가를 승인했습니다",
    link: "/recruit",
    icon: "✅",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  {
    type: "party_rejected",
    title: "파티 거절",
    message: "테스트유저님이 '혼돈의 탑 파티' 참가를 거절했습니다",
    link: "/recruit",
    icon: "❌",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  {
    type: "party_kicked",
    title: "파티 추방",
    message: "'혼돈의 탑 파티'에서 추방되었습니다",
    link: "/recruit",
    icon: "🚫",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  {
    type: "trade_reservation",
    title: "거래 예약",
    message: "테스트유저님이 '신성의 검+9' 거래를 예약했습니다",
    link: "/market",
    icon: "💰",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  {
    type: "trade_comment",
    title: "거래 댓글",
    message: "테스트유저님이 거래글에 댓글을 남겼습니다",
    link: "/market",
    icon: "💬",
    color: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  },
  {
    type: "scam_report_result",
    title: "사기 신고 결과",
    message: "신고하신 사기 건이 확인되었습니다",
    link: "/profile",
    icon: "⚠️",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
]

export default function DevNotificationsPage() {
  const { user } = useAuth()
  const [testing, setTesting] = useState<string | null>(null)
  const [browserPermission, setBrowserPermission] = useState(getNotificationPermission())

  const handleTestNotification = async (test: NotificationTest) => {
    if (!user) {
      toast.error("로그인이 필요합니다")
      return
    }

    setTesting(test.type)

    try {
      // 1. DB에 알람 생성
      await createNotification({
        user_id: user.id,
        type: test.type,
        title: test.title,
        message: test.message,
        link: test.link,
      })

      toast.success(`${test.icon} DB 알람 생성 완료`)

      // 2. 브라우저 푸시 알림 (권한 있으면)
      if (browserPermission === "granted") {
        showBrowserNotification(test.title, {
          body: test.message,
          tag: test.type,
          onClick: () => {
            if (test.link) {
              window.location.hash = test.link
            }
          },
        })
        toast.success(`${test.icon} 브라우저 푸시 전송 완료`)
      }

      // 3. Discord 웹훅 (설정되어 있으면)
      const discordSettings = getDiscordWebhookSettings()
      if (discordSettings.enabled && discordSettings.webhookUrl) {
        const success = await sendDiscordNotification(
          discordSettings.webhookUrl,
          test.type,
          test.title,
          test.message,
          test.link
        )
        if (success) {
          toast.success(`${test.icon} Discord 웹훅 전송 완료`)
        } else {
          toast.error("Discord 웹훅 전송 실패")
        }
      }

      toast.success("✅ 모든 알람 테스트 완료!", {
        description: "알람벨을 확인해보세요",
      })
    } catch (error) {
      console.error("Notification test error:", error)
      toast.error("알람 테스트 실패", {
        description: error instanceof Error ? error.message : "알 수 없는 오류",
      })
    } finally {
      setTesting(null)
    }
  }

  const handleRequestBrowserPermission = async () => {
    const permission = await requestNotificationPermission()
    setBrowserPermission(permission)

    if (permission === "granted") {
      toast.success("브라우저 알림 권한 허용됨")
    } else if (permission === "denied") {
      toast.error("브라우저 알림 권한 거부됨")
    }
  }

  const handleTestBrowserNotification = () => {
    if (browserPermission !== "granted") {
      toast.error("브라우저 알림 권한이 없습니다")
      return
    }

    showBrowserNotification("테스트 알림", {
      body: "브라우저 푸시 알림이 정상 작동합니다!",
      icon: "/favicon.ico",
    })

    toast.success("브라우저 알림 전송 완료")
  }

  const handleTestDiscordWebhook = async () => {
    const discordSettings = getDiscordWebhookSettings()

    if (!discordSettings.enabled || !discordSettings.webhookUrl) {
      toast.error("Discord 웹훅이 설정되지 않았습니다", {
        description: "프로필 > 알림 설정에서 Discord 웹훅을 설정하세요",
      })
      return
    }

    const success = await sendDiscordNotification(
      discordSettings.webhookUrl,
      "party_application",
      "Discord 웹훅 테스트",
      "Discord 웹훅이 정상 작동합니다!",
      "/dev/notifications"
    )

    if (success) {
      toast.success("Discord 웹훅 전송 완료", {
        description: "Discord 채널을 확인해보세요",
      })
    } else {
      toast.error("Discord 웹훅 전송 실패")
    }
  }

  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>로그인 필요</CardTitle>
            <CardDescription>알림 테스트를 하려면 로그인이 필요합니다</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <TestTube className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">알림 시스템 테스트</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          개발자 전용 페이지입니다. 각 버튼을 클릭하여 알림이 정상 작동하는지 테스트하세요.
        </p>
      </div>

      {/* 브라우저 & Discord 테스트 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림 채널 테스트
          </CardTitle>
          <CardDescription>브라우저 푸시 알림 및 Discord 웹훅을 테스트합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 브라우저 알림 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">브라우저 푸시 알림</div>
              <div className="text-sm text-muted-foreground">
                권한 상태:{" "}
                {browserPermission === "granted" && <span className="text-green-500">✅ 허용됨</span>}
                {browserPermission === "denied" && <span className="text-red-500">❌ 거부됨</span>}
                {browserPermission === "default" && <span className="text-yellow-500">⚠️ 미설정</span>}
              </div>
            </div>
            <div className="flex gap-2">
              {browserPermission !== "granted" && (
                <Button onClick={handleRequestBrowserPermission} size="sm">
                  권한 요청
                </Button>
              )}
              {browserPermission === "granted" && (
                <Button onClick={handleTestBrowserNotification} size="sm" variant="outline">
                  테스트
                </Button>
              )}
            </div>
          </div>

          {/* Discord 웹훅 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Discord 웹훅</div>
              <div className="text-sm text-muted-foreground">
                {getDiscordWebhookSettings().enabled
                  ? "✅ 설정됨"
                  : "⚠️ 미설정 (프로필 > 알림 설정에서 설정)"}
              </div>
            </div>
            <Button onClick={handleTestDiscordWebhook} size="sm" variant="outline">
              <Send className="w-4 h-4 mr-2" />
              테스트
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* 알림 타입별 테스트 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 타입별 테스트</CardTitle>
          <CardDescription>
            각 알림 타입을 테스트합니다. DB 생성 + 브라우저 푸시 + Discord 웹훅이 모두 실행됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {NOTIFICATION_TESTS.map((test) => (
              <div
                key={test.type}
                className={`flex items-center justify-between p-4 border rounded-lg ${test.color}`}
              >
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <span className="text-2xl">{test.icon}</span>
                    {test.title}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{test.message}</div>
                  {test.link && (
                    <div className="text-xs text-muted-foreground mt-1">링크: {test.link}</div>
                  )}
                </div>
                <Button
                  onClick={() => handleTestNotification(test)}
                  disabled={testing === test.type}
                  size="sm"
                >
                  {testing === test.type ? "테스트 중..." : "테스트"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 안내 */}
      <Card className="mt-6 bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2">
            <p className="font-medium">💡 테스트 방법:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>먼저 브라우저 알림 권한을 허용하세요</li>
              <li>Discord 웹훅을 테스트하려면 프로필에서 웹훅 URL을 설정하세요</li>
              <li>각 알림 타입 테스트 버튼을 클릭하세요</li>
              <li>우측 상단 알림벨 아이콘에서 알림이 도착했는지 확인하세요</li>
              <li>브라우저 알림과 Discord 채널도 확인하세요</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
