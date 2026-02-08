import { useState, useEffect } from "react"
import { Bell, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import {
  requestNotificationPermission,
  getNotificationPermission,
  showBrowserNotification,
  isNotificationSupported,
} from "@/lib/browser-notifications"

export function NotificationSettings() {
  const { profile, updateProfile } = useAuth()
  const [browserPermission, setBrowserPermission] = useState(getNotificationPermission())
  const [browserEnabled, setBrowserEnabled] = useState(false)
  const [discordWebhook, setDiscordWebhook] = useState("")
  const [discordEnabled, setDiscordEnabled] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      // DB에서 설정 불러오기
      setBrowserEnabled(profile.notification_browser_enabled ?? false)
      setDiscordEnabled(profile.notification_discord_enabled ?? false)
      setDiscordWebhook(profile.discord_webhook_url ?? "")
    }
  }, [profile])

  const handleBrowserToggle = async (checked: boolean) => {
    if (checked) {
      const permission = await requestNotificationPermission()
      setBrowserPermission(permission)

      if (permission === "granted") {
        setBrowserEnabled(true)
        await updateProfile({ notification_browser_enabled: true })

        // 테스트 알람
        showBrowserNotification("알람이 활성화되었습니다", {
          body: "이제 브라우저 알람을 받을 수 있습니다",
        })
        toast.success("브라우저 알람이 활성화되었습니다")
      } else {
        setBrowserEnabled(false)
        await updateProfile({ notification_browser_enabled: false })
        toast.error("알람 권한이 거부되었습니다")
      }
    } else {
      setBrowserEnabled(false)
      await updateProfile({ notification_browser_enabled: false })
      toast.success("브라우저 알람이 비활성화되었습니다")
    }
  }

  const handleDiscordToggle = async (checked: boolean) => {
    setDiscordEnabled(checked)
    await updateProfile({ notification_discord_enabled: checked })
    toast.success(checked ? "Discord 알람이 활성화되었습니다" : "Discord 알람이 비활성화되었습니다")
  }

  const handleDiscordWebhookSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ discord_webhook_url: discordWebhook })
      toast.success("Discord 웹훅 URL이 저장되었습니다")
    } catch (error) {
      console.error("Failed to save webhook:", error)
      toast.error("저장 실패")
    } finally {
      setSaving(false)
    }
  }

  const handleTestDiscordWebhook = async () => {
    if (!discordWebhook) {
      alert("웹훅 URL을 입력해주세요")
      return
    }

    try {
      const response = await fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "🔔 테스트 알람",
              description: "디스코드 웹훅이 정상적으로 작동합니다!",
              color: 0x3498db,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      })

      if (response.ok) {
        alert("테스트 알람이 디스코드로 전송되었습니다!")
      } else {
        alert("웹훅 전송 실패. URL을 확인해주세요.")
      }
    } catch (error) {
      console.error("Discord webhook error:", error)
      alert("웹훅 전송 중 오류가 발생했습니다")
    }
  }

  return (
    <div className="space-y-6">
      {/* 브라우저 알람 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>브라우저 알람</CardTitle>
          </div>
          <CardDescription>
            브라우저 푸시 알람을 통해 실시간 알림을 받습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isNotificationSupported() && (
            <p className="text-sm text-destructive">
              이 브라우저는 알람을 지원하지 않습니다
            </p>
          )}

          {isNotificationSupported() && (
            <>
              <div className="flex items-center justify-between">
                <Label htmlFor="browser-notifications">브라우저 알람 활성화</Label>
                <Switch
                  id="browser-notifications"
                  checked={browserEnabled}
                  onCheckedChange={handleBrowserToggle}
                />
              </div>

              {browserPermission === "denied" && (
                <p className="text-sm text-destructive">
                  알람 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.
                </p>
              )}

              {browserPermission === "granted" && browserEnabled && (
                <p className="text-sm text-muted-foreground">
                  ✅ 브라우저 알람이 활성화되었습니다
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 디스코드 웹훅 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            <CardTitle>디스코드 웹훅</CardTitle>
          </div>
          <CardDescription>
            디스코드 채널로 알람을 전송합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="discord-notifications">디스코드 알람 활성화</Label>
            <Switch
              id="discord-notifications"
              checked={discordEnabled}
              onCheckedChange={handleDiscordToggle}
            />
          </div>

          {discordEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="discord-webhook">웹훅 URL</Label>
                <Input
                  id="discord-webhook"
                  type="url"
                  placeholder="https://discord.com/api/webhooks/..."
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  디스코드 채널 설정 → 연동 → 웹훅 만들기에서 URL을 복사하세요
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDiscordWebhookSave} variant="outline" disabled={saving}>
                  {saving ? "저장 중..." : "저장"}
                </Button>
                <Button onClick={handleTestDiscordWebhook} variant="secondary">
                  테스트 전송
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
