"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  CreditCard,
  Wallet,
  Banknote,
  Building2,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { PaymentMethodForm } from "@/components/forms/payment-method-form"
import { PAYMENT_TYPE_LABELS, type PaymentType } from "@/types"
import { formatNumber } from "@/lib/utils"
import type { PaymentMethodCreateInput } from "@/lib/validations/payment-method"
import type { LucideIcon } from "lucide-react"

interface PaymentMethod {
  id: string
  name: string
  type: string
  cardCompany: string | null
  paymentDay: number | null
  creditLimit: number | null
  isDefault: boolean
  createdAt: string
  _count: {
    transactions: number
  }
}

const PAYMENT_TYPE_ICONS: Record<string, LucideIcon> = {
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: CreditCard,
  CASH: Banknote,
  BANK_TRANSFER: Building2,
  E_WALLET: Smartphone,
}

const PAYMENT_TYPE_COLORS: Record<string, string> = {
  CREDIT_CARD: "#3B82F6",
  DEBIT_CARD: "#8B5CF6",
  CASH: "#22C55E",
  BANK_TRANSFER: "#F59E0B",
  E_WALLET: "#EC4899",
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null)

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/payment-methods")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setPaymentMethods(data)
    } catch (error) {
      console.error("Failed to fetch payment methods:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPaymentMethods()
  }, [fetchPaymentMethods])

  const handleCreate = async (data: PaymentMethodCreateInput) => {
    try {
      setIsSubmitting(true)
      const res = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create")
      }
      await fetchPaymentMethods()
      setIsCreateOpen(false)
    } catch (error) {
      console.error("Failed to create payment method:", error)
      alert(error instanceof Error ? error.message : "결제수단 생성에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (data: PaymentMethodCreateInput) => {
    if (!editingMethod) return
    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/payment-methods/${editingMethod.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update")
      }
      await fetchPaymentMethods()
      setEditingMethod(null)
    } catch (error) {
      console.error("Failed to update payment method:", error)
      alert(error instanceof Error ? error.message : "결제수단 수정에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingMethod) return
    try {
      const res = await fetch(`/api/payment-methods/${deletingMethod.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete")
      }
      await fetchPaymentMethods()
      setDeletingMethod(null)
    } catch (error) {
      console.error("Failed to delete payment method:", error)
      alert(error instanceof Error ? error.message : "결제수단 삭제에 실패했습니다.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">결제수단 관리</h1>
          <p className="text-muted-foreground">
            카드, 현금, 계좌이체 등 결제수단을 관리합니다.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          결제수단 추가
        </Button>
      </div>

      {/* Payment Methods Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-16 rounded bg-muted" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-3 w-32 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Wallet className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">등록된 결제수단이 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            상단의 &quot;결제수단 추가&quot; 버튼을 눌러 추가해보세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method) => {
            const Icon = PAYMENT_TYPE_ICONS[method.type] || Wallet
            const color = PAYMENT_TYPE_COLORS[method.type] || "#6B7280"
            const typeLabel =
              PAYMENT_TYPE_LABELS[method.type as PaymentType] || method.type

            return (
              <Card
                key={method.id}
                className="group relative transition-shadow hover:shadow-md"
              >
                {/* Dropdown menu */}
                <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">메뉴</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingMethod(method)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingMethod(method)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="truncate">{method.name}</span>
                        {method.isDefault && (
                          <Badge variant="secondary" className="shrink-0 text-xs">
                            기본
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5">
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {typeLabel}
                        {method.cardCompany && ` / ${method.cardCompany}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {method.paymentDay && (
                      <p>결제일: 매월 {method.paymentDay}일</p>
                    )}
                    {method.creditLimit != null && method.creditLimit > 0 && (
                      <p>한도: {formatNumber(method.creditLimit)}원</p>
                    )}
                    {method._count.transactions > 0 && (
                      <p>거래 {method._count.transactions}건</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>결제수단 추가</DialogTitle>
            <DialogDescription>
              새로운 결제수단을 등록합니다.
            </DialogDescription>
          </DialogHeader>
          <PaymentMethodForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingMethod}
        onOpenChange={(open) => !open && setEditingMethod(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>결제수단 수정</DialogTitle>
            <DialogDescription>
              결제수단 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          {editingMethod && (
            <PaymentMethodForm
              defaultValues={{
                name: editingMethod.name,
                type: editingMethod.type as PaymentType,
                cardCompany: editingMethod.cardCompany || undefined,
                paymentDay: editingMethod.paymentDay || undefined,
                creditLimit: editingMethod.creditLimit || undefined,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingMethod(null)}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingMethod}
        onOpenChange={(open) => !open && setDeletingMethod(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>결제수단 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingMethod?.name}&quot; 결제수단을 삭제하시겠습니까?
              {deletingMethod && deletingMethod._count.transactions > 0 && (
                <span className="mt-1 block text-destructive">
                  이 결제수단에 {deletingMethod._count.transactions}건의 거래가
                  연결되어 있어 삭제할 수 없습니다.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={
                !!deletingMethod && deletingMethod._count.transactions > 0
              }
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
