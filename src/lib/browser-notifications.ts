/**
 * 브라우저 알람 (Web Notification API) 유틸리티
 */

export type NotificationPermission = "default" | "granted" | "denied"

/**
 * 브라우저 알람 권한 요청
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("이 브라우저는 알람을 지원하지 않습니다")
    return "denied"
  }

  if (Notification.permission === "granted") {
    return "granted"
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

/**
 * 브라우저 알람 표시
 */
export function showBrowserNotification(
  title: string,
  options?: NotificationOptions & { onClick?: () => void }
) {
  if (!("Notification" in window)) {
    console.warn("이 브라우저는 알람을 지원하지 않습니다")
    return null
  }

  if (Notification.permission !== "granted") {
    console.warn("알람 권한이 없습니다")
    return null
  }

  const { onClick, ...notificationOptions } = options || {}

  const notification = new Notification(title, {
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    ...notificationOptions,
  })

  if (onClick) {
    notification.onclick = () => {
      window.focus()
      onClick()
      notification.close()
    }
  }

  return notification
}

/**
 * 현재 브라우저 알람 권한 상태 확인
 */
export function getNotificationPermission(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied"
  }
  return Notification.permission
}

/**
 * 브라우저 알람 지원 여부 확인
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window
}
