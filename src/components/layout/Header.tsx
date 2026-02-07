import { NavLink } from "react-router-dom"
import { Swords, Calculator, Search, BookOpen, ShoppingBag, Users, LogIn, LogOut, User } from "lucide-react"
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

const navItems = [
  { to: "/", label: "파티 빈자리", sub: "나겔톡방", icon: Swords },
  { to: "/recruit", label: "파티모집", sub: "LOD Portal", icon: Users },
  { to: "/market", label: "거래소", icon: ShoppingBag },
  { to: "/calculator", label: "라르 계산기", icon: Calculator },
  { to: "/search", label: "DB 검색", icon: Search },
  { to: "/wiki", label: "뉴비 가이드", icon: BookOpen },
]

function getDiscordAvatarUrl(discordId: string, avatar: string | null) {
  if (!avatar) return null
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
}

export function Header() {
  const { user, profile, loading, signInWithDiscord, signOut } = useAuth()

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
          {navItems.map(({ to, label, sub, icon: Icon }) => (
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
        <div className="flex w-20 items-center justify-end">
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : user ? (
            <UserMenu
              discordId={user.user_metadata.provider_id}
              discordAvatar={user.user_metadata.avatar_url}
              displayName={profile?.game_nickname ?? user.user_metadata.full_name ?? "유저"}
              onSignOut={signOut}
            />
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
