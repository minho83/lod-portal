import { NavLink } from "react-router-dom"
import { Swords, Calculator, Search, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "파티 빈자리", icon: Swords },
  { to: "/calculator", label: "라르 계산기", icon: Calculator },
  { to: "/search", label: "DB 검색", icon: Search },
  { to: "/wiki", label: "뉴비 가이드", icon: BookOpen },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* 로고 */}
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            L
          </div>
          <h1 className="hidden text-lg font-bold sm:block">
            LOD <span className="text-primary">도우미</span>
          </h1>
        </NavLink>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 로그인 버튼 자리 (향후 Discord OAuth) */}
        <div className="w-20" />
      </div>
    </header>
  )
}
