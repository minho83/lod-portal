import { Outlet, useLocation } from "react-router-dom"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { ServerBar } from "./ServerBar"

const SUPABASE_ROUTES = ["/market", "/profile"]

export function Layout() {
  const { pathname } = useLocation()
  const needsServer = !SUPABASE_ROUTES.some((r) => pathname.startsWith(r))

  return (
    <div className="flex min-h-screen flex-col">
      {needsServer && <ServerBar />}
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
