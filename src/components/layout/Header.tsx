import { NavLink } from "react-router-dom"
import { Swords, Calculator, Search, BookOpen, ShoppingBag, Users, LogIn, LogOut, User, TestTube, Shield, HelpCircle, Sparkles, Map } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationBell } from "@/components/layout/NotificationBell"

const navItems = [
  { to: "/", label: "파티 빈자리", sub: "나겔톡방", icon: Swords },
  { to: "/recruit", label: "파티모집", sub: "LOD Portal", icon: Users },
  { to: "/market", label: "거래소", icon: ShoppingBag },
  { to: "/calculator", label: "라르 계산기", icon: Calculator },
  { to: "/spirit", label: "정령 레벨업", icon: Sparkles },
  { to: "/npcmap", label: "NPC&맵찾기", icon: Map },
  { to: "/search", label: "DB 검색", icon: Search },
  { to: "/wiki", label: "뉴비 가이드", icon: BookOpen },
  { to: "/guide", label: "사용법", icon: HelpCircle },
]

function getDiscordAvatarUrl(discordId: string, avatar: string | null) {
  if (!avatar) return null
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
}

export function Header() {
  const { user, profile, loading, signInWithDiscord, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* 로고 */}
        <NavLink to="/" className="flex flex-shrink-0 items-center gap-3">
          <img
            src="/lod-icon.png"
            alt="LOD"
            className="h-10 w-10 rounded-lg"
          />
          <h1 className="hidden pr-4 text-2xl font-black leading-none tracking-tight sm:block" style={{
            textShadow: '2px 2px 0px rgba(0,0,0,0.3)',
            letterSpacing: '-0.5px',
            fontStyle: 'italic'
          }}>
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              어둠의전설
            </span>
            <span className="ml-2 text-base font-bold text-primary">Portal</span>
          </h1>
        </NavLink>

        {/* 네비게이션 */}
        <nav className="scrollbar-hide flex flex-1 items-center gap-1 overflow-x-auto">
          {navItems.map(({ to, label, sub, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="hidden md:inline">
                {label}
                {sub && (
                  <span className="ml-1 text-[10px] font-normal opacity-60">({sub})</span>
                )}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* 로그인 / 유저 메뉴 */}
        <div className="flex flex-shrink-0 items-center justify-end gap-2">
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <>
              <NotificationBell />
              <UserMenu
                discordId={user.user_metadata.provider_id}
                discordAvatar={user.user_metadata.avatar_url}
                displayName={profile?.game_nickname ?? user.user_metadata.full_name ?? "유저"}
                onSignOut={signOut}
              />
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={signInWithDiscord}>
              <LogIn className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">로그인</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

function UserMenu({
  discordId,
  discordAvatar,
  displayName,
  onSignOut,
}: {
  discordId: string
  discordAvatar: string | null
  displayName: string
  onSignOut: () => void
}) {
  const avatarUrl = getDiscordAvatarUrl(discordId, discordAvatar)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          <Avatar size="sm">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback>{displayName[0]}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium sm:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          {displayName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <NavLink to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            프로필
          </NavLink>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <NavLink to="/admin" className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            관리자
          </NavLink>
        </DropdownMenuItem>
        {import.meta.env.DEV && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/dev/notifications" className="cursor-pointer">
                <TestTube className="mr-2 h-4 w-4" />
                <span className="text-orange-500">알림 테스트</span>
              </NavLink>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
