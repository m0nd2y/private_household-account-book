"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  paymentMethodCreateSchema,
  type PaymentMethodCreateInput,
} from "@/lib/validations/payment-method"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAYMENT_TYPE_LABELS, type PaymentType } from "@/types"
import { formatNumber } from "@/lib/utils"

interface PaymentMethodFormProps {
  defaultValues?: Partial<PaymentMethodCreateInput>
  onSubmit: (data: PaymentMethodCreateInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const CARD_COMPANIES = [
  "삼성카드",
  "현대카드",
  "KB국민카드",
  "신한카드",
  "롯데카드",
  "우리카드",
  "하나카드",
  "NH농협카드",
  "BC카드",
  "카카오뱅크",
  "토스뱅크",
  "기타",
]

export function PaymentMethodForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: PaymentMethodFormProps) {
  const form = useForm<PaymentMethodCreateInput>({
    resolver: zodResolver(paymentMethodCreateSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: defaultValues?.type || "CREDIT_CARD",
      cardCompany: defaultValues?.cardCompany || undefined,
      paymentDay: defaultValues?.paymentDay || undefined,
      creditLimit: defaultValues?.creditLimit || undefined,
    },
  })

  const watchType = form.watch("type")
  const isCardType = watchType === "CREDIT_CARD" || watchType === "DEBIT_CARD"

  const handleSubmit = async (data: PaymentMethodCreateInput) => {
    // Clear card-specific fields if not a card type
    if (!isCardType) {
      data.cardCompany = undefined
      data.paymentDay = undefined
      data.creditLimit = undefined
    }
    // Only credit cards have credit limit
    if (watchType !== "CREDIT_CARD") {
      data.creditLimit = undefined
    }
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>결제수단명</FormLabel>
              <FormControl>
                <Input placeholder="예: 삼성카드 taptap O" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>유형</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="유형을 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(Object.entries(PAYMENT_TYPE_LABELS) as [PaymentType, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {isCardType && (
          <>
            <FormField
              control={form.control}
              name="cardCompany"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카드사</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카드사를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CARD_COMPANIES.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>결제일</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      placeholder="1~31"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val === "" ? undefined : parseInt(val, 10))
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>매월 카드 대금 결제일</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {watchType === "CREDIT_CARD" && (
          <FormField
            control={form.control}
            name="creditLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>신용한도</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value
                      field.onChange(val === "" ? undefined : parseInt(val, 10))
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormDescription>
                  {field.value
                    ? `${formatNumber(Number(field.value))}원`
                    : "신용카드 한도 금액 (원)"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
