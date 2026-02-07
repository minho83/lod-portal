import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useServerConnection } from "@/hooks/useServerConnection"

export function ServerBar() {
  const { url, isConnected, isChecking, connect } = useServerConnection()
  const [inputValue, setInputValue] = useState(url)

  const handleConnect = () => {
    connect(inputValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConnect()
  }

  return (
    <div className="border-b border-border bg-card px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center gap-2">
        <div className="flex items-center gap-1.5">
          {isChecking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : isConnected ? (
            <Wifi className="h-3.5 w-3.5 text-success" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 text-destructive" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              isConnected ? "text-success" : "text-muted-foreground",
            )}
          >
            {isConnected ? "연결됨" : "미연결"}
          </span>
        </div>
        <Input
          className="h-7 max-w-xs font-mono text-xs"
          placeholder="http://서버IP:3000"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={handleConnect}>
          연결
        </Button>
      </div>
    </div>
  )
}
