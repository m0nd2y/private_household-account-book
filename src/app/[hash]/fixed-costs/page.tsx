"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { FIXED_COST_CATEGORY_LABELS, FIXED_COST_TYPE_LABELS, type FixedCostCategory, type FixedCostType } from "@/types"
import { toast } from "sonner"

// --------------- Types ---------------

interface FixedCostPayment {
  id: string
  isPaid: boolean
  actualAmount: number | null
  paidAt: string | null
}

interface FixedCost {
  id: string
  name: string
  expectedAmount: number
  category: string
  costType: string
  dueDay: number | null
  memo: string | null
  isActive: boolean
  payment: FixedCostPayment | null
}

const CATEGORY_COLORS: Record<string, string> = {
  HOUSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  UTILITY: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  TELECOM: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  SUBSCRIPTION: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  INSURANCE: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  TRANSPORT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  FINANCE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ETC: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
}

// --------------- Page ---------------

export default function FixedCostsPage() {
  const now = new Date()

  // Data
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([])
  const [loading, setLoading] = useState(true)

  // Month selector
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  // Create / Edit
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FixedCost | null>(null)
  const [deletingItem, setDeletingItem] = useState<FixedCost | null>(null)

  // Payment dialog
  const [payingItem, setPayingItem] = useState<FixedCost | null>(null)
  const [payAmount, setPayAmount] = useState("")

  // Form state
  const [formName, setFormName] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formCategory, setFormCategory] = useState("ETC")
  const [formCostType, setFormCostType] = useState("EXPENSE")
  const [formDueDay, setFormDueDay] = useState("")
  const [formMemo, setFormMemo] = useState("")

  // --------------- Month navigation ---------------

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear((y) => y - 1)
    } else {
      setSelectedMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear((y) => y + 1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
  }

  // --------------- Data fetching ---------------

  const fetchFixedCosts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/fixed-costs?month=${selectedMonth}&year=${selectedYear}`
      )
      if (!res.ok) throw new Error("Failed to fetch")
      const json = await res.json()
      const list = Array.isArray(json) ? json : json.data || []
      setFixedCosts(list)
    } catch (error) {
      console.error("Failed to fetch fixed costs:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    fetchFixedCosts()
  }, [fetchFixedCosts])

  // --------------- Form helpers ---------------

  const resetForm = () => {
    setFormName("")
    setFormAmount("")
    setFormCategory("ETC")
    setFormCostType("EXPENSE")
    setFormDueDay("")
    setFormMemo("")
  }

  const openCreateForm = () => {
    resetForm()
    setEditingItem(null)
    setFormOpen(true)
  }

  const openEditForm = (item: FixedCost) => {
    setEditingItem(item)
    setFormName(item.name)
    setFormAmount(String(item.expectedAmount))
    setFormCategory(item.category || "ETC")
    setFormCostType(item.costType || "EXPENSE")
    setFormDueDay(item.dueDay ? String(item.dueDay) : "")
    setFormMemo(item.memo || "")
    setFormOpen(true)
  }

  // --------------- Handlers ---------------

  const handleSubmitForm = async () => {
    if (!formName.trim()) {
      toast.error("항목명을 입력해주세요")
      return
    }
    const data = {
      name: formName.trim(),
      expectedAmount: parseInt(formAmount, 10) || 0,
      category: formCategory,
      costType: formCostType,
      dueDay: formDueDay ? parseInt(formDueDay, 10) : null,
      memo: formMemo.trim() || null,
    }

    try {
      if (editingItem) {
        const res = await fetch(`/api/fixed-costs/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("수정 실패")
        toast.success("고정비용이 수정되었습니다")
      } else {
        const res = await fetch("/api/fixed-costs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("등록 실패")
        toast.success("고정비용이 등록되었습니다")
      }
      setFormOpen(false)
      resetForm()
      setEditingItem(null)
      await fetchFixedCosts()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "처리에 실패했습니다"
      )
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    try {
      const res = await fetch(`/api/fixed-costs/${deletingItem.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("삭제 실패")
      setDeletingItem(null)
      toast.success("고정비용이 삭제되었습니다")
      await fetchFixedCosts()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "삭제에 실패했습니다"
      )
    }
  }

  const openPayDialog = (item: FixedCost) => {
    setPayingItem(item)
    setPayAmount(String(item.expectedAmount))
  }

  const handlePay = async () => {
    if (!payingItem) return
    const amount = parseInt(payAmount, 10)
    if (isNaN(amount) || amount < 0) {
      toast.error("올바른 금액을 입력해주세요")
      return
    }
    try {
      const res = await fetch(
        `/api/fixed-costs/${payingItem.id}/pay?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actualAmount: amount }),
        }
      )
      if (!res.ok) throw new Error("납부 처리 실패")
      setPayingItem(null)
      toast.success("납부 완료")
      await fetchFixedCosts()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "납부 처리에 실패했습니다"
      )
    }
  }

  const handleUnpay = async (item: FixedCost) => {
    try {
      const res = await fetch(
        `/api/fixed-costs/${item.id}/pay?month=${selectedMonth}&year=${selectedYear}`,
        { method: "DELETE" }
      )
      if (!res.ok) throw new Error("취소 실패")
      toast.success("납부가 취소되었습니다")
      await fetchFixedCosts()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "납부 취소에 실패했습니다"
      )
    }
  }

  // --------------- Derived data ---------------

  const paidItems = fixedCosts.filter((fc) => fc.payment?.isPaid)
  const unpaidItems = fixedCosts.filter((fc) => !fc.payment?.isPaid)
  const totalExpected = fixedCosts.reduce(
    (sum, fc) => sum + fc.expectedAmount,
    0
  )
  const totalPaid = paidItems.reduce(
    (sum, fc) => sum + (fc.payment?.actualAmount ?? fc.expectedAmount),
    0
  )
  const progressPercent =
    fixedCosts.length > 0
      ? Math.round((paidItems.length / fixedCosts.length) * 100)
      : 0

  // Group by category
  const groupedByCategory = fixedCosts.reduce<Record<string, FixedCost[]>>(
    (acc, item) => {
      const cat = item.category || "ETC"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    },
    {}
  )
  const categoryOrder = Object.keys(FIXED_COST_CATEGORY_LABELS) as FixedCostCategory[]
  const sortedCategories = categoryOrder.filter((cat) => groupedByCategory[cat])

  // --------------- Render ---------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">고정비용 관리</h1>
          <p className="text-muted-foreground">
            매월 반복되는 고정비용을 관리하고 납부 여부를 확인합니다.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          고정비용 추가
        </Button>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={goToPrevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold min-w-[120px] text-center">
          {selectedYear}년 {selectedMonth}월
        </span>
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">총 고정비용 (예상)</p>
            <p className="text-xl font-bold">{formatCurrency(totalExpected)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {fixedCosts.length}개 항목
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">납부 완료</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {paidItems.length}개 완료
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">미납부</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(totalExpected - totalPaid)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {unpaidItems.length}개 남음
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">납부 진행률</span>
            <span className="text-sm text-muted-foreground">
              {paidItems.length}/{fixedCosts.length} ({progressPercent}%)
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Checklist */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-6 w-48 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : fixedCosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <CalendarCheck className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">등록된 고정비용이 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            고정비용 추가 버튼으로 시작하세요.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedCategories.map((cat) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${CATEGORY_COLORS[cat] || CATEGORY_COLORS.ETC} border-0`}>
                  {FIXED_COST_CATEGORY_LABELS[cat]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {groupedByCategory[cat].filter((i) => i.payment?.isPaid).length}/
                  {groupedByCategory[cat].length}개 완료
                </span>
              </div>
              <div className="space-y-2">
                {groupedByCategory[cat].map((item) => {
                  const isPaid = item.payment?.isPaid ?? false

                  return (
                    <Card
                      key={item.id}
                      className={`transition-colors ${
                        isPaid ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" : ""
                      }`}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center gap-3">
                          {/* Check button */}
                          <button
                            onClick={() =>
                              isPaid ? handleUnpay(item) : openPayDialog(item)
                            }
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              isPaid
                                ? "border-green-500 bg-green-500 text-white"
                                : "border-muted-foreground/30 hover:border-primary"
                            }`}
                          >
                            {isPaid && <Check className="h-4 w-4" />}
                          </button>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-medium ${
                                  isPaid ? "line-through text-muted-foreground" : ""
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.costType === "SAVING" && (
                                <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">
                                  저축/투자
                                </Badge>
                              )}
                              {item.dueDay && (
                                <Badge variant="outline" className="text-xs">
                                  매월 {item.dueDay}일
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-sm">
                              {isPaid ? (
                                <span className="text-green-600">
                                  납부: {formatCurrency(item.payment?.actualAmount ?? 0)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  예상: {formatCurrency(item.expectedAmount)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status badge */}
                          <Badge
                            variant={isPaid ? "default" : "secondary"}
                            className={
                              isPaid
                                ? "bg-green-600 hover:bg-green-600"
                                : "text-orange-600"
                            }
                          >
                            {isPaid ? "완료" : "미납"}
                          </Badge>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditForm(item)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-red-600"
                              onClick={() => setDeletingItem(item)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ Dialogs ============ */}

      {/* Create/Edit Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false)
            setEditingItem(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "고정비용 수정" : "고정비용 추가"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "고정비용 정보를 수정합니다."
                : "매월 반복되는 고정비용을 등록합니다."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>항목명 *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="예: 월세, 넷플릭스, 전기료"
              />
            </div>
            <div>
              <Label>예상 금액 *</Label>
              <Input
                type="number"
                min={0}
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>분류 *</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="분류 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(FIXED_COST_CATEGORY_LABELS) as [FixedCostCategory, string][]).map(
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
              <Label>유형 *</Label>
              <Select value={formCostType} onValueChange={setFormCostType}>
                <SelectTrigger>
                  <SelectValue placeholder="유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(FIXED_COST_TYPE_LABELS) as [FixedCostType, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                지출: 대시보드 지출에 합산 / 저축·투자: 자산 투입에 합산
              </p>
            </div>
            <div>
              <Label>납부일 (선택)</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={formDueDay}
                onChange={(e) => setFormDueDay(e.target.value)}
                placeholder="예: 25"
              />
            </div>
            <div>
              <Label>메모 (선택)</Label>
              <Textarea
                value={formMemo}
                onChange={(e) => setFormMemo(e.target.value)}
                placeholder="메모"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFormOpen(false)
                  setEditingItem(null)
                  resetForm()
                }}
              >
                취소
              </Button>
              <Button onClick={handleSubmitForm}>
                {editingItem ? "수정" : "등록"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={!!payingItem}
        onOpenChange={(open) => {
          if (!open) {
            setPayingItem(null)
            setPayAmount("")
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>납부 확인</DialogTitle>
            <DialogDescription>
              &quot;{payingItem?.name}&quot; 납부 금액을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>실제 납부 금액</Label>
              <Input
                type="number"
                min={0}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                예상 금액: {formatCurrency(payingItem?.expectedAmount ?? 0)}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPayingItem(null)
                  setPayAmount("")
                }}
              >
                취소
              </Button>
              <Button onClick={handlePay}>납부 완료</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>고정비용 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingItem?.name}&quot;을(를) 삭제하시겠습니까? 관련 납부
              기록도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
