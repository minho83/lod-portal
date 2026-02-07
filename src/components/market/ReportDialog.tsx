import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { AlertCircle, ShieldAlert } from "lucide-react"
import { createScamReport } from "@/lib/scam-reports"
import { REPORT_TYPE_LABELS, type ReportType, type Trade } from "@/types"
import { useToast } from "@/hooks/use-toast"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trade: Trade
}

export function ReportDialog({ open, onOpenChange, trade }: ReportDialogProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [reportType, setReportType] = useState<ReportType>("no_payment")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "상세 내용을 입력해주세요",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createScamReport({
        reported_user_id: trade.seller_id,
        suspect_name: trade.seller?.game_nickname || trade.seller?.discord_username || "알 수 없음",
        suspect_discord_id: trade.seller?.discord_id,
        report_type: reportType,
        title: `${REPORT_TYPE_LABELS[reportType]} - ${trade.item_name}`,
        description: description.trim(),
        related_trade_id: trade.id,
      })

      toast({
        title: "신고 완료",
        description: "신고가 접수되었습니다. 운영진이 검토 후 조치하겠습니다.",
      })

      onOpenChange(false)
      setDescription("")
      setReportType("no_payment")

      // 내 신고 목록 페이지로 이동
      setTimeout(() => {
        navigate("/profile?tab=reports")
      }, 1000)
    } catch (error) {
      console.error("Failed to create report:", error)
      toast({
        variant: "destructive",
        title: "신고 실패",
        description: error instanceof Error ? error.message : "신고 중 오류가 발생했습니다",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <DialogTitle>사기 신고</DialogTitle>
          </div>
          <DialogDescription>
            거래 중 사기 피해를 입으셨나요? 신고해주시면 운영진이 검토 후 조치하겠습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 거래 정보 */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{trade.item_name}</div>
                <div className="text-muted-foreground">
                  {trade.price.toLocaleString()} {trade.price_unit}
                </div>
              </div>
              <div className="text-right text-muted-foreground">
                <div>판매자</div>
                <div className="font-medium text-foreground">
                  {trade.seller?.game_nickname || trade.seller?.discord_username}
                </div>
              </div>
            </div>
          </div>

          {/* 신고 유형 */}
          <div className="space-y-2">
            <Label>신고 사유 *</Label>
            <RadioGroup value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
              <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent">
                <RadioGroupItem value="no_payment" id="no_payment" />
                <Label htmlFor="no_payment" className="flex-1 cursor-pointer font-normal">
                  {REPORT_TYPE_LABELS.no_payment}
                </Label>
              </div>
              <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent">
                <RadioGroupItem value="no_item" id="no_item" />
                <Label htmlFor="no_item" className="flex-1 cursor-pointer font-normal">
                  {REPORT_TYPE_LABELS.no_item}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* 상세 내용 */}
          <div className="space-y-2">
            <Label htmlFor="description">상세 내용 *</Label>
            <Textarea
              id="description"
              placeholder={`예시:\n- 거래 날짜 및 시간\n- 거래 장소\n- 피해 금액/아이템\n- 구체적인 사기 수법`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              구체적인 정보를 제공할수록 빠른 처리가 가능합니다
            </p>
          </div>

          {/* 경고 안내 */}
          <div className="flex gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-warning" />
            <div className="text-muted-foreground">
              허위 신고 시 신고자도 제재를 받을 수 있습니다. 사실만 정확하게 기재해주세요.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            취소
          </Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "신고 중..." : "신고하기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
