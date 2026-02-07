import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { copyToClipboard } from "@/lib/party-utils"
import { Copy, Check, type LucideIcon } from "lucide-react"

export function CopyButton({
  text,
  label,
  copiedLabel,
  variant = "outline",
  size = "xs",
  className,
  icon: Icon = Copy,
}: {
  text: string
  label: string
  copiedLabel?: string
  variant?: "outline" | "secondary" | "default"
  size?: "xs" | "sm"
  className?: string
  icon?: LucideIcon
}) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant={copied ? "default" : variant}
      size={size}
      onClick={handleCopy}
      className={cn(copied && "bg-success text-success-foreground hover:bg-success", className)}
    >
      {copied ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
      {copied ? (copiedLabel ?? "복사됨!") : label}
    </Button>
  )
}
