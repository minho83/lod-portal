import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useServerConnection } from "@/hooks/useServerConnection"

export function ServerBar() {
  const { isConnected, isChecking } = useServerConnection()

  return (
    <div className="border-b border-border bg-card px-4 py-1.5">
      <div className="mx-auto flex max-w-7xl items-center gap-1.5">
        {isChecking ? (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        ) : isConnected ? (
          <Wifi className="h-3 w-3 text-success" />
        ) : (
          <WifiOff className="h-3 w-3 text-destructive" />
        )}
        <span
          className={cn(
            "text-xs",
            isConnected ? "text-success" : "text-muted-foreground",
          )}
        >
          {isChecking
            ? "게임서버 연결 확인 중..."
            : isConnected
              ? "게임서버 연결됨"
              : "게임서버 미연결"}
        </span>
      </div>
    </div>
  )
}
