import { Check, X, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { JOB_CONFIG } from "@/components/game/ClassBadge"
import type { PartyMember, MemberStatus } from "@/types"

const STATUS_LABELS: Record<MemberStatus, { label: string; className: string }> = {
  accepted: { label: "수락", className: "text-green-400" },
  pending: { label: "대기중", className: "text-yellow-400" },
  rejected: { label: "거절", className: "text-red-400" },
  left: { label: "탈퇴", className: "text-muted-foreground" },
  kicked: { label: "추방", className: "text-red-400" },
}

interface MemberListProps {
  members: PartyMember[]
  isLeader: boolean
  onAccept?: (memberId: string) => void
  onReject?: (memberId: string) => void
  onKick?: (memberId: string) => void
  disabled?: boolean
}

export function MemberList({
  members,
  isLeader,
  onAccept,
  onReject,
  onKick,
  disabled = false,
}: MemberListProps) {
  const accepted = members.filter((m) => m.status === "accepted")
  const pending = members.filter((m) => m.status === "pending")
  const others = members.filter((m) => !["accepted", "pending"].includes(m.status))

  return (
    <div className="space-y-4">
      {/* 수락된 멤버 */}
      {accepted.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            파티원 ({accepted.length})
          </h4>
          {accepted.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              showKick={isLeader && m.role !== "leader"}
              onKick={onKick}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* 대기중 신청자 */}
      {pending.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-yellow-400">
            대기중 ({pending.length})
          </h4>
          {pending.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              showActions={isLeader}
              onAccept={onAccept}
              onReject={onReject}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {/* 기타 (거절/탈퇴/추방) */}
      {others.length > 0 && isLeader && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            기타 ({others.length})
          </h4>
          {others.map((m) => (
            <MemberRow key={m.id} member={m} disabled={disabled} />
          ))}
        </div>
      )}
    </div>
  )
}

function MemberRow({
  member,
  showActions = false,
  showKick = false,
  onAccept,
  onReject,
  onKick,
  disabled = false,
}: {
  member: PartyMember
  showActions?: boolean
  showKick?: boolean
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  onKick?: (id: string) => void
  disabled?: boolean
}) {
  const config = JOB_CONFIG[member.job_class]
  const statusInfo = STATUS_LABELS[member.status]

  return (
    <div className="flex items-center gap-3 rounded-md bg-muted/30 p-2.5">
      {/* 직업 */}
      <span className={cn("text-xs font-semibold", config.textClass)}>
        {config.kr}
      </span>

      {/* 캐릭명 + 역할 */}
      <div className="flex-1">
        <span className="text-sm font-medium">{member.character_name}</span>
        {member.role === "leader" && (
          <Badge variant="outline" className="ml-2 text-xs">
            리더
          </Badge>
        )}
      </div>

      {/* 상태 */}
      <span className={cn("text-xs", statusInfo.className)}>
        {statusInfo.label}
      </span>

      {/* 리더 액션 버튼 */}
      {showActions && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-green-400 hover:text-green-300"
            onClick={() => onAccept?.(member.id)}
            disabled={disabled}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-red-400 hover:text-red-300"
            onClick={() => onReject?.(member.id)}
            disabled={disabled}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {showKick && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-red-400 hover:text-red-300"
          onClick={() => onKick?.(member.id)}
          disabled={disabled}
        >
          <UserMinus className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
