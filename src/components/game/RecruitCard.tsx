import { Link } from "react-router-dom"
import { Clock, MapPin, Users, Zap, Shield, Swords, Castle, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, timeAgo, formatScheduledDate } from "@/lib/utils"
import { SlotDisplay } from "./SlotDisplay"
import { RECRUIT_TYPE_CONFIG } from "@/lib/constants"
import type { PartyRecruit, RecruitStatus } from "@/types"

const TYPE_ICONS = { party: Users, guild_war: Swords, chaos_tower: Castle } as const

const STATUS_CONFIG: Record<RecruitStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "모집중", variant: "default" },
  full: { label: "모집완료", variant: "secondary" },
  closed: { label: "마감", variant: "outline" },
  cancelled: { label: "취소됨", variant: "destructive" },
}

interface RecruitCardProps {
  recruit: PartyRecruit
}

export function RecruitCard({ recruit }: RecruitCardProps) {
  const statusInfo = STATUS_CONFIG[recruit.status]
  const authorName =
    recruit.author?.game_nickname ?? recruit.author?.discord_username ?? "알 수 없음"

  return (
    <Link to={`/recruit/${recruit.id}`}>
      <Card className={cn(
        "transition-colors hover:border-primary/50",
        recruit.status === "open" && "border-primary/20",
      )}>
        <CardContent className="space-y-3 p-4">
          {/* 상단: 상태 + 유형 + 참여방식 */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            {recruit.recruit_type && recruit.recruit_type !== "party" && (() => {
              const TypeIcon = TYPE_ICONS[recruit.recruit_type]
              const typeInfo = RECRUIT_TYPE_CONFIG[recruit.recruit_type]
              return (
                <Badge variant="secondary" className="text-xs">
                  <TypeIcon className="mr-1 h-3 w-3" />
                  {typeInfo.label}
                </Badge>
              )
            })()}
            <Badge variant="outline" className="text-xs">
              {recruit.join_mode === "first_come" ? (
                <>
                  <Zap className="mr-1 h-3 w-3" />
                  선착순
                </>
              ) : (
                <>
                  <Shield className="mr-1 h-3 w-3" />
                  승인제
                </>
              )}
            </Badge>
            {recruit.location && (
              <Badge variant="outline" className="text-xs">
                <MapPin className="mr-1 h-3 w-3" />
                {recruit.location}
              </Badge>
            )}
          </div>

          {/* 제목 */}
          <h3 className="text-base font-semibold leading-tight">{recruit.title}</h3>

          {/* 슬롯 */}
          <SlotDisplay jobSlots={recruit.job_slots} compact />

          {/* 하단: 인원/작성자/예정시간 */}
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {recruit.member_count}/{recruit.max_members}
              </span>
              <span className="truncate">{authorName}</span>
            </div>
            {recruit.scheduled_at ? (
              <span className="flex shrink-0 items-center gap-1 font-medium text-primary">
                <Calendar className="h-3.5 w-3.5" />
                {formatScheduledDate(recruit.scheduled_at, recruit.end_time)}
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {timeAgo(recruit.created_at)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export { STATUS_CONFIG }
