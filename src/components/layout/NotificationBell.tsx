import { useState, useEffect } from "react"
import { Bell, Check, Trash2, X } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/notifications"
import { timeAgo } from "@/lib/utils"
import type { Notification } from "@/types"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const loadNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(20),
        getUnreadCount(),
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      console.error("Failed to load notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    // 30초마다 자동 갱신
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setUnreadCount((prev) => {
        const notification = notifications.find((n) => n.id === id)
        return notification && !notification.read ? Math.max(0, prev - 1) : prev
      })
    } catch (err) {
      console.error("Failed to delete notification:", err)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>알람</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleMarkAllAsRead}
              className="h-6 text-xs"
            >
              <Check className="mr-1 h-3 w-3" />
              모두 읽음
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              로딩 중...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
              <p className="mt-2 text-sm text-muted-foreground">알람이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClose,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const content = (
    <div
      className={`group relative rounded-md p-3 transition-colors ${
        notification.read
          ? "bg-muted/30 hover:bg-muted/50"
          : "bg-primary/5 hover:bg-primary/10"
      }`}
    >
      {!notification.read && (
        <div className="absolute top-3 left-1 h-2 w-2 rounded-full bg-primary" />
      )}
      <div className="ml-3">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {notification.message}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {timeAgo(notification.created_at)}
          </span>
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onMarkAsRead(notification.id)
                }}
                className="h-6 w-6"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(notification.id)
              }}
              className="h-6 w-6 text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (notification.link) {
    return (
      <Link
        to={notification.link}
        onClick={() => {
          if (!notification.read) {
            onMarkAsRead(notification.id)
          }
          onClose()
        }}
      >
        {content}
      </Link>
    )
  }

  return content
}
