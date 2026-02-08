import { useState, useEffect, useRef } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/AuthContext"
import { fetchTradeMessages, sendTradeMessage, markMessagesAsRead } from "@/lib/messages"
import { timeAgo } from "@/lib/utils"
import type { Trade, TradeMessage } from "@/types"

interface MessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trade: Trade
}

export function MessageDialog({ open, onOpenChange, trade }: MessageDialogProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<TradeMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const otherUserName =
    trade.seller?.game_nickname ?? trade.seller?.discord_username ?? "알 수 없음"

  useEffect(() => {
    if (!open) return

    loadMessages()
    markMessagesAsRead(trade.id).catch(() => {})

    // 5초마다 새 메시지 확인
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [open, trade.id])

  useEffect(() => {
    // 새 메시지가 추가되면 스크롤 맨 아래로
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadMessages = async () => {
    try {
      const data = await fetchTradeMessages(trade.id)
      setMessages(data)
    } catch (error) {
      console.error("메시지 로드 실패:", error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || sending || !user) return

    const messageText = input.trim()
    setSending(true)

    // 낙관적 업데이트: 임시 메시지 즉시 표시
    const tempMessage: TradeMessage = {
      id: `temp-${Date.now()}`,
      trade_id: trade.id,
      sender_id: user.id,
      message: messageText,
      read: false,
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        discord_id: user.user_metadata?.discord_id || "",
        discord_username: user.user_metadata?.discord_username || "",
        game_nickname: user.user_metadata?.game_nickname || "",
        discord_avatar: user.user_metadata?.discord_avatar || null,
        game_class: null,
        created_at: "",
        updated_at: "",
      },
    }

    setMessages([...messages, tempMessage])
    setInput("")

    try {
      await sendTradeMessage(trade.id, messageText)
      console.log("메시지 전송 성공")

      // 서버에서 최신 메시지 다시 가져오기
      await loadMessages()
    } catch (error) {
      // 실패하면 임시 메시지 제거
      setMessages(messages)
      setInput(messageText)
      toast.error("메시지 전송에 실패했습니다")
      console.error("메시지 전송 오류:", error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            💬 {otherUserName}님과의 1:1 대화
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{trade.item_name}</p>
        </DialogHeader>

        <div className="space-y-4">
          <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                아직 메시지가 없습니다. 첫 메시지를 보내보세요!
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] space-y-1 rounded-lg px-3 py-2 ${
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                        <p
                          className={`text-xs ${
                            isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}
                        >
                          {timeAgo(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={!input.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            ℹ️ 이 대화는 거래 당사자만 볼 수 있으며, 관리자도 접근할 수 없습니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
