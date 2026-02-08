import { useEffect } from "react"
import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { useAuth } from "@/contexts/AuthContext"
import { requestNotificationPermission, getNotificationPermission } from "@/lib/browser-notifications"

export function Layout() {
  const { profile } = useAuth()

  // 브라우저 알림 자동 권한 요청
  useEffect(() => {
    if (!profile) return

    // DB에 "알림을 원한다"고 저장되어 있으면
    if (profile.notification_browser_enabled) {
      const currentPermission = getNotificationPermission()

      // 이 브라우저에서 아직 권한을 묻지 않았으면 (default)
      if (currentPermission === "default") {
        // 자동으로 권한 요청
        requestNotificationPermission().then((permission) => {
          if (permission === "granted") {
            console.log("브라우저 알림 권한 자동 허용됨")
          }
        })
      }
    }
  }, [profile])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
