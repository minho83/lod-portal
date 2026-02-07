import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Send, Plus, X, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { createTrade } from "@/lib/trades"
import { formatPrice } from "@/lib/utils"
import type { TradeCategory, TradeItem, TradeType } from "@/types"
import { TRADE_CATEGORIES } from "@/types"

interface BundleItemRow {
  name: string
  category: TradeCategory | ""
  price: string
  quantity: string
}

const EMPTY_ROW: BundleItemRow = { name: "", category: "", price: "", quantity: "1" }

export function NewTradePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tradeType, setTradeType] = useState<TradeType>("sell")
  const [isBundle, setIsBundle] = useState(false)

  // 일반 글 필드
  const [itemName, setItemName] = useState("")
  const [itemCategory, setItemCategory] = useState<TradeCategory | "">("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("1")

  // 묶음 글 필드
  const [bundleItems, setBundleItems] = useState<BundleItemRow[]>([
    { ...EMPTY_ROW },
    { ...EMPTY_ROW },
  ])

  // 공통 필드
  const [itemDescription, setItemDescription] = useState("")
  const [isNegotiable, setIsNegotiable] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isBuy = tradeType === "buy"

  // 묶음 아이템 관리
  const addBundleItem = () => {
    setBundleItems([...bundleItems, { ...EMPTY_ROW }])
  }

  const removeBundleItem = (index: number) => {
    if (bundleItems.length <= 2) return
    setBundleItems(bundleItems.filter((_, i) => i !== index))
  }

  const updateBundleItem = (index: number, field: keyof BundleItemRow, value: string) => {
    setBundleItems(bundleItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const bundleTotalPrice = bundleItems.reduce((sum, item) => {
    return sum + (Number(item.price) || 0) * (Number(item.quantity) || 1)
  }, 0)

  if (!user) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            로그인이 필요합니다
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async () => {
    setError("")

    if (isBundle) {
      // 묶음 글 검증
      const validItems = bundleItems.filter(
        (item) => item.name.trim() && item.category && Number(item.price) > 0
      )
      if (validItems.length < 2) {
        return setError("묶음 글은 최소 2개 아이템을 입력해주세요")
      }

      const items: TradeItem[] = validItems.map((item) => ({
        item_name: item.name.trim(),
        item_category: item.category as TradeCategory,
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
      }))

      const title = items.length === 1
        ? items[0].item_name
        : `${items[0].item_name} 외 ${items.length - 1}건`

      setSubmitting(true)
      try {
        const trade = await createTrade({
          seller_id: user.id,
          trade_type: tradeType,
          item_name: title,
          item_category: items[0].item_category,
          item_description: itemDescription.trim() || undefined,
          price: bundleTotalPrice,
          quantity: 1,
          is_negotiable: isNegotiable,
          items,
        })
        navigate(`/market/${trade.id}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error("Trade creation failed:", err)
        setError(`등록 실패: ${msg}`)
        setSubmitting(false)
      }
    } else {
      // 일반 글 검증
      if (!itemName.trim()) return setError("아이템명을 입력해주세요")
      if (!itemCategory) return setError("카테고리를 선택해주세요")
      if (!price || Number(price) <= 0) return setError("가격을 입력해주세요")

      setSubmitting(true)
      try {
        const trade = await createTrade({
          seller_id: user.id,
          trade_type: tradeType,
          item_name: itemName.trim(),
          item_category: itemCategory,
          item_description: itemDescription.trim() || undefined,
          price: Number(price),
          quantity: Number(quantity) || 1,
          is_negotiable: isNegotiable,
        })
        navigate(`/market/${trade.id}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error("Trade creation failed:", err)
        setError(`등록 실패: ${msg}`)
        setSubmitting(false)
      }
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/market")}>
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        거래소로 돌아가기
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isBuy ? "구매글 등록" : "판매글 등록"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 거래 유형 */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={tradeType === "sell" ? "default" : "outline"}
              onClick={() => setTradeType("sell")}
              className="w-full"
            >
              팝니다
            </Button>
            <Button
              type="button"
              variant={tradeType === "buy" ? "default" : "outline"}
              onClick={() => setTradeType("buy")}
              className="w-full"
            >
              삽니다
            </Button>
          </div>

          {/* 일반/묶음 토글 */}
          <Tabs
            value={isBundle ? "bundle" : "single"}
            onValueChange={(v) => setIsBundle(v === "bundle")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="single" className="flex-1">일반 글</TabsTrigger>
              <TabsTrigger value="bundle" className="flex-1">
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                묶음 글
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isBundle ? (
            /* ─── 묶음 글 입력 ─── */
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                여러 아이템을 하나의 글로 등록합니다 (최소 2개)
              </p>

              {bundleItems.map((item, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      아이템 {index + 1}
                    </span>
                    {bundleItems.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeBundleItem(index)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <Input
                    placeholder="아이템명 *"
                    value={item.name}
                    onChange={(e) => updateBundleItem(index, "name", e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={item.category}
                      onValueChange={(v) => updateBundleItem(index, "category", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRADE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="가격 *"
                      value={item.price}
                      onChange={(e) => updateBundleItem(index, "price", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="수량"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateBundleItem(index, "quantity", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBundleItem}
                className="w-full"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                아이템 추가
              </Button>

              {/* 총 가격 */}
              {bundleTotalPrice > 0 && (
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <span className="text-sm text-muted-foreground">총 가격: </span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(bundleTotalPrice)}
                  </span>
                  <span className="text-sm text-muted-foreground"> 어둠돈</span>
                </div>
              )}
            </div>
          ) : (
            /* ─── 일반 글 입력 ─── */
            <>
              {/* 아이템명 */}
              <div className="space-y-2">
                <label htmlFor="item-name" className="text-sm font-medium">
                  아이템명 *
                </label>
                <Input
                  id="item-name"
                  placeholder="아이템 이름"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>

              {/* 카테고리 */}
              <div className="space-y-2">
                <label htmlFor="item-category" className="text-sm font-medium">
                  카테고리 *
                </label>
                <Select
                  value={itemCategory}
                  onValueChange={(v) => setItemCategory(v as TradeCategory)}
                >
                  <SelectTrigger id="item-category">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 가격 + 수량 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">
                    {isBuy ? "희망가격" : "판매가격"} (어둠돈) *
                  </label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    수량
                  </label>
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* 상세 설명 (공통) */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              상세 설명
            </label>
            <Textarea
              id="description"
              placeholder={isBundle ? "묶음 거래 조건, 개별 판매 가능 여부 등" : "추가 옵션, 인챈트 정보 등"}
              rows={3}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
            />
          </div>

          {/* 협상 가능 (공통) */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="negotiable"
              checked={isNegotiable}
              onCheckedChange={(v) => setIsNegotiable(v === true)}
            />
            <label htmlFor="negotiable" className="text-sm">
              가격 협상 가능
            </label>
          </div>

          {/* 에러 */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* 등록 버튼 */}
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {submitting
              ? "등록 중..."
              : isBundle
                ? isBuy ? "묶음 구매글 등록" : "묶음 판매글 등록"
                : isBuy ? "구매글 등록" : "판매글 등록"
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
