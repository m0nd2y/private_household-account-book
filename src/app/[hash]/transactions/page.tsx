"use client"

import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import {
  CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { TRANSACTION_TYPE_LABELS } from "@/types"
import type { TransactionFormValues } from "@/lib/validations/transaction"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

import { TransactionForm } from "@/components/forms/transaction-form"
import { FloatingActionButton } from "@/components/shared/floating-action-button"

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

interface Tag {
  id: string
  name: string
}

interface Transaction {
  id: string
  amount: number
  type: "INCOME" | "EXPENSE"
  description?: string | null
  memo?: string | null
  date: string
  categoryId: string
  category: Category
  paymentMethodId?: string | null
  paymentMethod?: PaymentMethod | null
  tags: Tag[]
  createdAt: string
  updatedAt: string
}

interface TransactionsResponse {
  data: Transaction[]
  total: number
  page: number
  totalPages: number
}

interface Filters {
  page: number
  limit: number
  type: string
  categoryId: string
  paymentMethodId: string
  startDate: Date | undefined
  endDate: Date | undefined
  keyword: string
}

const ITEMS_PER_PAGE = 20

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    type: "ALL",
    categoryId: "ALL",
    paymentMethodId: "ALL",
    startDate: undefined,
    endDate: undefined,
    keyword: "",
  })

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(filters.page))
      params.set("limit", String(filters.limit))

      if (filters.type !== "ALL") {
        params.set("type", filters.type)
      }
      if (filters.categoryId !== "ALL") {
        params.set("categoryId", filters.categoryId)
      }
      if (filters.paymentMethodId !== "ALL") {
        params.set("paymentMethodId", filters.paymentMethodId)
      }
      if (filters.startDate) {
        params.set("startDate", filters.startDate.toISOString())
      }
      if (filters.endDate) {
        params.set("endDate", filters.endDate.toISOString())
      }
      if (filters.keyword.trim()) {
        params.set("keyword", filters.keyword.trim())
      }

      const res = await fetch(`/api/transactions?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch")

      const data: TransactionsResponse = await res.json()
      setTransactions(data.data)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
      toast.error("거래 목록을 불러오는데 실패했습니다")
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchMeta = useCallback(async () => {
    try {
      const [catRes, pmRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/payment-methods"),
      ])
      if (catRes.ok) {
        const catData = await catRes.json()
        setCategories(Array.isArray(catData) ? catData : [])
      }
      if (pmRes.ok) {
        const pmData = await pmRes.json()
        setPaymentMethods(Array.isArray(pmData) ? pmData : [])
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error)
    }
  }, [])

  useEffect(() => {
    fetchMeta()
  }, [fetchMeta])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  async function handleCreate(data: TransactionFormValues) {
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        paymentMethodId:
          data.paymentMethodId === "none" ? undefined : data.paymentMethodId,
      }
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create")
      }

      toast.success("거래가 등록되었습니다")
      setCreateDialogOpen(false)
      fetchTransactions()
    } catch (error) {
      console.error("Failed to create transaction:", error)
      toast.error("거래 등록에 실패했습니다")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(data: TransactionFormValues) {
    if (!selectedTransaction) return
    setSubmitting(true)
    try {
      const payload = {
        ...data,
        paymentMethodId:
          data.paymentMethodId === "none" ? null : data.paymentMethodId,
      }
      const res = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update")
      }

      toast.success("거래가 수정되었습니다")
      setEditDialogOpen(false)
      setSelectedTransaction(null)
      fetchTransactions()
    } catch (error) {
      console.error("Failed to update transaction:", error)
      toast.error("거래 수정에 실패했습니다")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!selectedTransaction) return
    try {
      const res = await fetch(`/api/transactions/${selectedTransaction.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete")
      }

      toast.success("거래가 삭제되었습니다")
      setDeleteDialogOpen(false)
      setSelectedTransaction(null)
      fetchTransactions()
    } catch (error) {
      console.error("Failed to delete transaction:", error)
      toast.error("거래 삭제에 실패했습니다")
    }
  }

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  function handlePageChange(newPage: number) {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  function handleKeywordSearch(e: React.FormEvent) {
    e.preventDefault()
    setFilters((prev) => ({ ...prev, page: 1 }))
  }

  const filteredCategoriesForFilter = filters.type === "ALL"
    ? categories
    : categories.filter((c) => c.type === filters.type)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">거래 관리</h1>
          <p className="text-sm text-muted-foreground">
            수입과 지출을 기록하고 관리합니다
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="hidden sm:flex"
        >
          거래 추가
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Date Range - Start */}
            <div className="space-y-2">
              <label className="text-sm font-medium">시작일</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate
                      ? format(filters.startDate, "yyyy.MM.dd", { locale: ko })
                      : "시작일 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => updateFilter("startDate", date ?? undefined)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Range - End */}
            <div className="space-y-2">
              <label className="text-sm font-medium">종료일</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate
                      ? format(filters.endDate, "yyyy.MM.dd", { locale: ko })
                      : "종료일 선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => updateFilter("endDate", date ?? undefined)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">거래 유형</label>
              <Select
                value={filters.type}
                onValueChange={(val) => updateFilter("type", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="INCOME">수입</SelectItem>
                  <SelectItem value="EXPENSE">지출</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">카테고리</label>
              <Select
                value={filters.categoryId}
                onValueChange={(val) => updateFilter("categoryId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  {filteredCategoriesForFilter.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon ? `${cat.icon} ` : ""}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">결제수단</label>
              <Select
                value={filters.paymentMethodId}
                onValueChange={(val) => updateFilter("paymentMethodId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium">키워드 검색</label>
              <form onSubmit={handleKeywordSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="설명 또는 메모로 검색..."
                    value={filters.keyword}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        keyword: e.target.value,
                      }))
                    }
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="secondary">
                  검색
                </Button>
              </form>
            </div>
          </div>

          {/* Filter Reset */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              총 <span className="font-semibold text-foreground">{total}</span>건
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: ITEMS_PER_PAGE,
                  type: "ALL",
                  categoryId: "ALL",
                  paymentMethodId: "ALL",
                  startDate: undefined,
                  endDate: undefined,
                  keyword: "",
                })
              }
            >
              필터 초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">불러오는 중...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-lg font-medium">거래 내역이 없습니다</p>
              <p className="mt-1 text-sm">
                새로운 거래를 추가해보세요
              </p>
              <Button
                className="mt-4"
                onClick={() => setCreateDialogOpen(true)}
              >
                거래 추가
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">날짜</TableHead>
                      <TableHead className="w-[80px]">유형</TableHead>
                      <TableHead>카테고리</TableHead>
                      <TableHead>설명</TableHead>
                      <TableHead>결제수단</TableHead>
                      <TableHead className="text-right">금액</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(tx.date)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              tx.type === "INCOME" ? "default" : "destructive"
                            }
                            className={cn(
                              tx.type === "INCOME"
                                ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                                : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                            )}
                          >
                            {TRANSACTION_TYPE_LABELS[tx.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            {tx.category.icon && (
                              <span>{tx.category.icon}</span>
                            )}
                            {tx.category.name}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {tx.description || "-"}
                        </TableCell>
                        <TableCell>
                          {tx.paymentMethod?.name || "-"}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold tabular-nums",
                            tx.type === "INCOME"
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">메뉴 열기</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTransaction(tx)
                                  setEditDialogOpen(true)
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedTransaction(tx)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List */}
              <div className="divide-y md:hidden">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            tx.type === "INCOME" ? "default" : "destructive"
                          }
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            tx.type === "INCOME"
                              ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-100 border-red-200"
                          )}
                        >
                          {TRANSACTION_TYPE_LABELS[tx.type]}
                        </Badge>
                        <span className="text-sm font-medium truncate">
                          {tx.category.icon && (
                            <span className="mr-1">{tx.category.icon}</span>
                          )}
                          {tx.category.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground truncate">
                        {tx.description || "-"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(tx.date)}
                        {tx.paymentMethod && ` | ${tx.paymentMethod.name}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums whitespace-nowrap",
                          tx.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        )}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTransaction(tx)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedTransaction(tx)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            이전
          </Button>
          <div className="flex items-center gap-1">
            {generatePageNumbers(filters.page, totalPages).map((pageNum, idx) =>
              pageNum === -1 ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === filters.page ? "default" : "outline"}
                  size="sm"
                  className="min-w-[36px]"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page >= totalPages}
          >
            다음
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>거래 추가</DialogTitle>
            <DialogDescription>
              새로운 수입 또는 지출을 기록합니다
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            onSubmit={handleCreate}
            onCancel={() => setCreateDialogOpen(false)}
            isLoading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open)
          if (!open) setSelectedTransaction(null)
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>거래 수정</DialogTitle>
            <DialogDescription>거래 내용을 수정합니다</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionForm
              key={selectedTransaction.id}
              initialData={selectedTransaction}
              onSubmit={handleUpdate}
              onCancel={() => {
                setEditDialogOpen(false)
                setSelectedTransaction(null)
              }}
              isLoading={submitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open)
          if (!open) setSelectedTransaction(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>거래를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 해당 거래 기록이 영구적으로
              삭제됩니다.
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

      {/* FAB for mobile */}
      <FloatingActionButton
        onClick={() => setCreateDialogOpen(true)}
        className="sm:hidden"
      />
    </div>
  )
}

/**
 * Generate page numbers with ellipsis for pagination.
 * Returns -1 for ellipsis positions.
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number
): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: number[] = []

  // Always show first page
  pages.push(1)

  if (currentPage > 3) {
    pages.push(-1) // ellipsis
  }

  // Show pages around current
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push(-1) // ellipsis
  }

  // Always show last page
  pages.push(totalPages)

  return pages
}
