"use client"

import { useEffect, useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

import { cn } from "@/lib/utils"
import {
  transactionCreateSchema,
  type TransactionFormValues,
} from "@/lib/validations/transaction"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Category {
  id: string
  name: string
  type: string
  icon?: string | null
  color?: string | null
}

interface PaymentMethod {
  id: string
  name: string
  type: string
}

interface TransactionFormProps {
  initialData?: {
    id: string
    amount: number
    type: "INCOME" | "EXPENSE"
    description?: string | null
    memo?: string | null
    date: string | Date
    categoryId: string
    paymentMethodId?: string | null
    tags?: { id: string; name: string }[]
  }
  onSubmit: (data: TransactionFormValues) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TransactionFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionCreateSchema) as Resolver<TransactionFormValues>,
    defaultValues: {
      type: initialData?.type || "EXPENSE",
      amount: initialData?.amount || 0,
      description: initialData?.description || "",
      memo: initialData?.memo || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      categoryId: initialData?.categoryId || "",
      paymentMethodId: initialData?.paymentMethodId || "",
      tagNames: initialData?.tags?.map((t) => t.name) || [],
    },
  })

  const selectedType = form.watch("type")

  const filteredCategories = categories.filter((c) => c.type === selectedType)

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, pmRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/payment-methods"),
        ])
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories(Array.isArray(catData) ? catData : catData.data || [])
        }
        if (pmRes.ok) {
          const pmData = await pmRes.json()
          setPaymentMethods(Array.isArray(pmData) ? pmData : pmData.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch form data:", error)
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [])

  // Reset categoryId when type changes
  useEffect(() => {
    const currentCategoryId = form.getValues("categoryId")
    if (currentCategoryId) {
      const categoryStillValid = filteredCategories.some(
        (c) => c.id === currentCategoryId
      )
      if (!categoryStillValid) {
        form.setValue("categoryId", "")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType])

  async function handleSubmit(data: TransactionFormValues) {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Type Toggle */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>거래 유형</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={field.value === "EXPENSE" ? "default" : "outline"}
                    className={cn(
                      "flex-1",
                      field.value === "EXPENSE" &&
                        "bg-red-500 hover:bg-red-600 text-white"
                    )}
                    onClick={() => field.onChange("EXPENSE")}
                  >
                    지출
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "INCOME" ? "default" : "outline"}
                    className={cn(
                      "flex-1",
                      field.value === "INCOME" &&
                        "bg-green-500 hover:bg-green-600 text-white"
                    )}
                    onClick={() => field.onChange("INCOME")}
                  >
                    수입
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date Picker */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>날짜</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "yyyy년 MM월 dd일", { locale: ko })
                      ) : (
                        <span>날짜를 선택하세요</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Amount */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>금액</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    ₩
                  </span>
                  <Input
                    type="number"
                    placeholder="0"
                    className="pl-8"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingData ? "불러오는 중..." : "카테고리 선택"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredCategories.length === 0 ? (
                    <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                      {loadingData
                        ? "불러오는 중..."
                        : "해당 유형의 카테고리가 없습니다"}
                    </div>
                  ) : (
                    filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon ? `${category.icon} ` : ""}
                        {category.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Payment Method */}
        <FormField
          control={form.control}
          name="paymentMethodId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>결제수단</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingData ? "불러오는 중..." : "결제수단 선택 (선택사항)"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">선택 안함</SelectItem>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명</FormLabel>
              <FormControl>
                <Input
                  placeholder="거래에 대한 간단한 설명"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Memo */}
        <FormField
          control={form.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="추가 메모 (선택사항)"
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className={cn(
              selectedType === "EXPENSE"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            )}
          >
            {isLoading
              ? "처리 중..."
              : initialData
                ? "수정하기"
                : "등록하기"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
