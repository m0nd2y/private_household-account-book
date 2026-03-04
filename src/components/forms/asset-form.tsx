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
import { ASSET_TYPE_LABELS, type AssetType } from "@/types"

export interface AssetFormData {
  name: string
  type: AssetType
  institution: string
  accountNumber: string
  interestRate: number | null
  maturityDate: string
  initialAmount: number
  currentValue: number
  memo: string
}

interface AssetFormProps {
  initialData?: {
    name?: string
    type?: AssetType
    institution?: string
    accountNumber?: string
    interestRate?: number | null
    maturityDate?: string | null
    initialAmount?: number
    currentValue?: number
    memo?: string
  }
  onSubmit: (data: AssetFormData) => Promise<void> | void
  onCancel?: () => void
}

export function AssetForm({ initialData, onSubmit, onCancel }: AssetFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [formType, setFormType] = useState<AssetType>(initialData?.type || "DEPOSIT")
  const [institution, setInstitution] = useState(initialData?.institution || "")
  const [accountNumber, setAccountNumber] = useState(initialData?.accountNumber || "")
  const [interestRate, setInterestRate] = useState(
    initialData?.interestRate != null ? String(initialData.interestRate) : ""
  )
  const [maturityDate, setMaturityDate] = useState(
    initialData?.maturityDate ? initialData.maturityDate.slice(0, 10) : ""
  )
  const [initialAmount, setInitialAmount] = useState(
    initialData?.initialAmount != null ? String(initialData.initialAmount) : ""
  )
  const [currentValue, setCurrentValue] = useState(
    initialData?.currentValue != null ? String(initialData.currentValue) : ""
  )
  const [memo, setMemo] = useState(initialData?.memo || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    try {
      setIsSubmitting(true)
      await onSubmit({
        name: name.trim(),
        type: formType,
        institution: institution.trim(),
        accountNumber: accountNumber.trim(),
        interestRate: interestRate ? parseFloat(interestRate) : null,
        maturityDate,
        initialAmount: initialAmount ? parseInt(initialAmount, 10) : 0,
        currentValue: currentValue ? parseInt(currentValue, 10) : 0,
        memo: memo.trim(),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div>
        <label className="text-sm font-medium">자산명 *</label>
        <Input
          placeholder="예: 신한은행 정기예금"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">유형</label>
        <Select value={formType} onValueChange={(v) => setFormType(v as AssetType)}>
          <SelectTrigger>
            <SelectValue placeholder="자산 유형 선택" />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(ASSET_TYPE_LABELS) as [AssetType, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">기관명</label>
        <Input
          placeholder="은행/증권사/거래소"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">계좌번호</label>
        <Input
          placeholder="계좌번호 (선택)"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
        />
      </div>

      {(formType === "DEPOSIT" || formType === "SAVINGS") && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">금리 (%)</label>
            <Input
              type="number"
              step="0.01"
              min={0}
              placeholder="3.5"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">만기일</label>
            <Input
              type="date"
              value={maturityDate}
              onChange={(e) => setMaturityDate(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">초기 금액</label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">현재 가치</label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
        </div>
      </div>

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
        <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  )
}
