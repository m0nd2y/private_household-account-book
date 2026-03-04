"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ASSET_TRANSACTION_TYPE_LABELS,
  type AssetTransactionType,
} from "@/types"

export interface AssetTransactionFormData {
  type: AssetTransactionType
  date: string
  amount: number
  quantity: number | null
  unitPrice: number | null
  memo: string
}

interface AssetTransactionFormProps {
  assetType: string
  onSubmit: (data: AssetTransactionFormData) => Promise<void> | void
  onCancel?: () => void
}

function getAvailableTransactionTypes(
  assetType: string
): AssetTransactionType[] {
  switch (assetType) {
    case "DEPOSIT":
    case "SAVINGS":
      return ["DEPOSIT", "WITHDRAW", "INTEREST"]
    case "INVESTMENT":
    case "CRYPTO":
      return ["BUY", "SELL", "DIVIDEND"]
    case "PENSION_INSURANCE":
      return ["DEPOSIT", "WITHDRAW"]
    default:
      return ["DEPOSIT", "WITHDRAW"]
  }
}

export function AssetTransactionForm({
  assetType,
  onSubmit,
  onCancel,
}: AssetTransactionFormProps) {
  const availableTypes = getAvailableTransactionTypes(assetType)
  const showQuantityFields = assetType === "INVESTMENT" || assetType === "CRYPTO"

  const today = new Date().toISOString().slice(0, 10)

  const [type, setType] = useState<AssetTransactionType>(availableTypes[0])
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [memo, setMemo] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const parsedAmount = parseInt(amount, 10)
    if (!parsedAmount || parsedAmount <= 0) return
    if (!date) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        type,
        date,
        amount: parsedAmount,
        quantity: quantity ? parseFloat(quantity) : null,
        unitPrice: unitPrice ? parseInt(unitPrice, 10) : null,
        memo: memo.trim(),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="text-sm font-medium">거래 유형</label>
        <Select value={type} onValueChange={(v) => setType(v as AssetTransactionType)}>
          <SelectTrigger>
            <SelectValue placeholder="거래 유형 선택" />
          </SelectTrigger>
          <SelectContent>
            {availableTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {ASSET_TRANSACTION_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">날짜</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">금액</label>
        <Input
          type="number"
          min={0}
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {showQuantityFields && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">수량</label>
            <Input
              type="number"
              step="0.0001"
              min={0}
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">단가</label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium">메모</label>
        <Input
          placeholder="메모 (선택)"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !amount || !date}
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  )
}
