import type { NotificationType } from "@/types"

interface DiscordEmbed {
  title: string
  description: string
  color: number
  timestamp: string
  url?: string
}

const NOTIFICATION_TYPE_COLORS: Record<NotificationType, number> = {
  party_application: 0x3498db, // 파란색
  party_accepted: 0x2ecc71, // 초록색
  party_rejected: 0xe74c3c, // 빨간색
  party_kicked: 0xe67e22, // 주황색
  trade_reservation: 0x9b59b6, // 보라색
  trade_comment: 0x1abc9c, // 청록색
  scam_report_result: 0xf1c40f, // 노란색
}

const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  party_application: "👥",
  party_accepted: "✅",
  party_rejected: "❌",
  party_kicked: "🚫",
  trade_reservation: "💰",
  trade_comment: "💬",
  scam_report_result: "⚠️",
}

/**
 * 디스코드 웹훅으로 알람 전송
 */
export async function sendDiscordNotification(
  webhookUrl: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
): Promise<boolean> {
  if (!webhookUrl) {
    console.warn("Discord webhook URL이 설정되지 않았습니다")
    return false
  }

  const icon = NOTIFICATION_TYPE_ICONS[type]
  const color = NOTIFICATION_TYPE_COLORS[type]

  const embed: DiscordEmbed = {
    title: `${icon} ${title}`,
    description: message,
    color,
    timestamp: new Date().toISOString(),
  }

  if (link) {
    embed.url = `${window.location.origin}${link}`
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    })

    if (!response.ok) {
      console.error("Discord webhook failed:", response.statusText)
      return false
    }

    return true
  } catch (error) {
    console.error("Discord webhook error:", error)
    return false
  }
}

/**
 * 디스코드 웹훅 설정 가져오기
 */
export function getDiscordWebhookSettings() {
  const enabled = localStorage.getItem("notification_discord_enabled") === "true"
  const webhookUrl = localStorage.getItem("notification_discord_webhook") || ""

  return { enabled, webhookUrl }
}

/**
 * 브라우저 알람 설정 가져오기
 */
export function getBrowserNotificationSettings() {
  const enabled = localStorage.getItem("notification_browser_enabled") === "true"
  return { enabled }
}
