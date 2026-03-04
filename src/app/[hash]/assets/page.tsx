"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowLeftRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Landmark,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
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
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AssetForm, type AssetFormData } from "@/components/forms/asset-form"
import {
  AssetTransactionForm,
  type AssetTransactionFormData,
} from "@/components/forms/asset-transaction-form"
import { DonutChart } from "@/components/charts/donut-chart"
import { MonthlyBarChart } from "@/components/charts/bar-chart"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  ASSET_TYPE_LABELS,
  ASSET_TRANSACTION_TYPE_LABELS,
  type AssetType,
  type AssetTransactionType,
} from "@/types"
import { ASSET_TYPE_COLORS } from "@/constants"
import { toast } from "sonner"

// --------------- Types ---------------

interface Asset {
  id: string
  name: string
  type: AssetType
  institution: string | null
  accountNumber: string | null
  interestRate: number | null
  maturityDate: string | null
  initialAmount: number
  currentValue: number
  memo: string | null
  isActive: boolean
  createdAt: string
}

interface AssetTransaction {
  id: string
  type: AssetTransactionType
  amount: number
  quantity: number | null
  unitPrice: number | null
  date: string
  memo: string | null
  createdAt: string
}

interface AssetSummary {
  monthlyIncome: number
  monthlyExpense: number
  monthlyAllocation: number
  allocationRate: number
  byType: { type: AssetType; amount: number; count: number }[]
}

interface MonthlyTrendItem {
  month: string
  income: number
  allocation: number
  byType: Record<string, number>
}

// --------------- Filter types ---------------

type FilterType = "ALL" | AssetType

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "DEPOSIT", label: "예금" },
  { value: "SAVINGS", label: "적금" },
  { value: "INVESTMENT", label: "투자" },
  { value: "CRYPTO", label: "코인" },
  { value: "PENSION_INSURANCE", label: "연금/보험" },
]

// --------------- Page ---------------

export default function AssetsPage() {
  const now = new Date()

  // Data
  const [assets, setAssets] = useState<Asset[]>([])
  const [summary, setSummary] = useState<AssetSummary | null>(null)
  const [trendData, setTrendData] = useState<MonthlyTrendItem[]>([])
  const [loading, setLoading] = useState(true)

  // Month selector
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  // Filters
  const [filterType, setFilterType] = useState<FilterType>("ALL")

  // Create / Edit dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)

  // Transaction detail dialog
  const [detailAsset, setDetailAsset] = useState<Asset | null>(null)
  const [detailTransactions, setDetailTransactions] = useState<AssetTransaction[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [txFormOpen, setTxFormOpen] = useState(false)

  // Quick value update dialog
  const [updateValueAsset, setUpdateValueAsset] = useState<Asset | null>(null)
  const [newValueInput, setNewValueInput] = useState("")

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

  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType !== "ALL") params.set("type", filterType)
      const res = await fetch(`/api/assets?${params.toString()}`)
      if (!res.ok) throw new Error("Failed to fetch assets")
      const json = await res.json()
      const list = Array.isArray(json) ? json : json.data || []
      setAssets(list)
    } catch (error) {
      console.error("Failed to fetch assets:", error)
    } finally {
      setLoading(false)
    }
  }, [filterType])

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/assets/summary?month=${selectedMonth}&year=${selectedYear}`)
      if (!res.ok) throw new Error("Failed to fetch summary")
      const data = await res.json()
      setSummary(data)
    } catch (error) {
      console.error("Failed to fetch summary:", error)
    }
  }, [selectedMonth, selectedYear])

  const fetchTrend = useCallback(async () => {
    try {
      const res = await fetch("/api/assets/monthly-trend?months=6")
      if (!res.ok) throw new Error("Failed to fetch trend")
      const json = await res.json()
      const list = Array.isArray(json) ? json : json.data || []
      setTrendData(list)
    } catch (error) {
      console.error("Failed to fetch trend:", error)
    }
  }, [])

  const fetchTransactions = useCallback(async (assetId: string) => {
    try {
      setDetailLoading(true)
      const res = await fetch(`/api/assets/${assetId}/transactions`)
      if (!res.ok) throw new Error("Failed to fetch transactions")
      const json = await res.json()
      const list = Array.isArray(json) ? json : json.data || []
      setDetailTransactions(list)
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  useEffect(() => {
    fetchTrend()
  }, [fetchTrend])

  // Refresh all data after mutations
  const refreshAll = async () => {
    await Promise.all([fetchAssets(), fetchSummary(), fetchTrend()])
  }

  // --------------- Handlers ---------------

  const handleCreateAsset = async (data: AssetFormData) => {
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "자산 생성에 실패했습니다.")
      }
      setCreateDialogOpen(false)
      toast.success("자산이 등록되었습니다")
      await refreshAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "자산 생성에 실패했습니다.")
    }
  }

  const handleUpdateAsset = async (data: AssetFormData) => {
    if (!editingAsset) return
    try {
      const res = await fetch(`/api/assets/${editingAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "자산 수정에 실패했습니다.")
      }
      setEditingAsset(null)
      toast.success("자산이 수정되었습니다")
      await refreshAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "자산 수정에 실패했습니다.")
    }
  }

  const handleDeleteAsset = async () => {
    if (!deletingAsset) return
    try {
      const res = await fetch(`/api/assets/${deletingAsset.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "자산 삭제에 실패했습니다.")
      }
      setDeletingAsset(null)
      toast.success("자산이 삭제되었습니다")
      await refreshAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "자산 삭제에 실패했습니다.")
    }
  }

  const handleQuickValueUpdate = async () => {
    if (!updateValueAsset) return
    const value = parseInt(newValueInput, 10)
    if (isNaN(value) || value < 0) {
      toast.error("올바른 금액을 입력하세요")
      return
    }
    try {
      const res = await fetch(`/api/assets/${updateValueAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue: value }),
      })
      if (!res.ok) throw new Error("업데이트에 실패했습니다.")
      setUpdateValueAsset(null)
      setNewValueInput("")
      toast.success("현재 가치가 업데이트되었습니다")
      await refreshAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "업데이트에 실패했습니다.")
    }
  }

  const handleCreateTransaction = async (data: AssetTransactionFormData) => {
    if (!detailAsset) return
    try {
      const res = await fetch(`/api/assets/${detailAsset.id}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "거래 등록에 실패했습니다.")
      }
      setTxFormOpen(false)
      toast.success("거래가 등록되었습니다")
      await fetchTransactions(detailAsset.id)
      await refreshAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "거래 등록에 실패했습니다.")
    }
  }

  const handleDeleteTransaction = async (txId: string) => {
    try {
      const res = await fetch(`/api/assets/transactions/${txId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("거래 삭제에 실패했습니다.")
      toast.success("거래가 삭제되었습니다")
      if (detailAsset) {
        await fetchTransactions(detailAsset.id)
      }
      await refreshAll()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "거래 삭제에 실패했습니다.")
    }
  }

  const openDetailDialog = (asset: Asset) => {
    setDetailAsset(asset)
    setTxFormOpen(false)
    fetchTransactions(asset.id)
  }

  const openValueUpdate = (asset: Asset) => {
    setUpdateValueAsset(asset)
    setNewValueInput(String(asset.currentValue))
  }

  // --------------- Derived data ---------------

  const donutData =
    summary?.byType
      .filter((b) => b.amount > 0)
      .map((b) => ({
        name: ASSET_TYPE_LABELS[b.type] || b.type,
        value: b.amount,
        color: ASSET_TYPE_COLORS[b.type] || "#6B7280",
      })) || []

  const barChartData = trendData.map((item) => ({
    name: `${parseInt(item.month.split("-")[1], 10)}월`,
    income: item.income,
    allocation: item.allocation,
  }))

  const barChartBars = [
    { dataKey: "income", name: "수입", color: "#22C55E" },
    { dataKey: "allocation", name: "자산 투입", color: "#3B82F6" },
  ]

  // --------------- Render ---------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">자산 관리</h1>
          <p className="text-muted-foreground">
            월별 수입 대비 자산 투입 현황을 확인합니다.
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          자산 추가
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">이번 달 수입</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary?.monthlyIncome ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">이번 달 지출</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary?.monthlyExpense ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">이번 달 자산 투입</p>
                <p className="text-xl font-bold">
                  {formatCurrency(summary?.monthlyAllocation ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                <PieChartIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">수입 대비 투입률</p>
                <p className="text-xl font-bold">
                  {(summary?.allocationRate ?? 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>유형별 투입 비율</CardTitle>
            <CardDescription>{selectedYear}년 {selectedMonth}월</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={donutData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>월별 수입 vs 자산 투입</CardTitle>
            <CardDescription>최근 6개월</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyBarChart data={barChartData} bars={barChartBars} />
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={filterType === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterType(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {/* Asset Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-6 w-40 rounded bg-muted" />
                  <div className="h-3 w-28 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Landmark className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">등록된 자산이 없습니다.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            자산 추가 버튼으로 시작하세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assets.map((asset) => {
            const color = ASSET_TYPE_COLORS[asset.type] || "#6B7280"

            return (
              <Card
                key={asset.id}
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
                      <DropdownMenuItem onClick={() => setEditingAsset(asset)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDetailDialog(asset)}>
                        <ArrowLeftRight className="mr-2 h-4 w-4" />
                        거래 내역
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openValueUpdate(asset)}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        현재가 업데이트
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingAsset(asset)}
                        className="text-red-600 focus:text-red-600"
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
                      <Landmark className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="truncate">{asset.name}</span>
                        <Badge
                          variant="secondary"
                          className="shrink-0 text-xs"
                          style={{ color: color }}
                        >
                          {ASSET_TYPE_LABELS[asset.type]}
                        </Badge>
                        {!asset.isActive && (
                          <Badge variant="outline" className="shrink-0 text-xs">
                            비활성
                          </Badge>
                        )}
                      </CardTitle>
                      {asset.institution && (
                        <CardDescription>{asset.institution}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-1.5">
                    <div>
                      <p className="text-xs text-muted-foreground">현재 가치</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(asset.currentValue)}
                      </p>
                    </div>

                    {(asset.type === "DEPOSIT" || asset.type === "SAVINGS") && (
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                        {asset.interestRate != null && (
                          <span>금리: {asset.interestRate}%</span>
                        )}
                        {asset.maturityDate && (
                          <span>만기일: {formatDate(asset.maturityDate)}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ============ Dialogs ============ */}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>자산 추가</DialogTitle>
            <DialogDescription>새로운 자산을 등록합니다.</DialogDescription>
          </DialogHeader>
          <AssetForm
            onSubmit={handleCreateAsset}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingAsset}
        onOpenChange={(open) => !open && setEditingAsset(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>자산 수정</DialogTitle>
            <DialogDescription>자산 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          {editingAsset && (
            <AssetForm
              initialData={{
                name: editingAsset.name,
                type: editingAsset.type,
                institution: editingAsset.institution || "",
                accountNumber: editingAsset.accountNumber || "",
                interestRate: editingAsset.interestRate,
                maturityDate: editingAsset.maturityDate,
                initialAmount: editingAsset.initialAmount,
                currentValue: editingAsset.currentValue,
                memo: editingAsset.memo || "",
              }}
              onSubmit={handleUpdateAsset}
              onCancel={() => setEditingAsset(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingAsset}
        onOpenChange={(open) => !open && setDeletingAsset(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>자산 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingAsset?.name}&quot; 자산을 삭제하시겠습니까? 관련된
              거래 내역도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAsset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Asset Transactions Dialog */}
      <Dialog
        open={!!detailAsset}
        onOpenChange={(open) => {
          if (!open) {
            setDetailAsset(null)
            setTxFormOpen(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {detailAsset?.name}
              <Badge variant="secondary" className="text-xs">
                {detailAsset?.type
                  ? ASSET_TYPE_LABELS[detailAsset.type]
                  : ""}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              현재 가치:{" "}
              {detailAsset ? formatCurrency(detailAsset.currentValue) : ""}
            </DialogDescription>
          </DialogHeader>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">거래 내역</h3>
              <Button size="sm" onClick={() => setTxFormOpen(!txFormOpen)}>
                {txFormOpen ? "취소" : (
                  <>
                    <Plus className="mr-1 h-3 w-3" />
                    거래 추가
                  </>
                )}
              </Button>
            </div>

            {/* Transaction Form (inline) */}
            {txFormOpen && detailAsset && (
              <Card>
                <CardContent className="pt-4">
                  <AssetTransactionForm
                    assetType={detailAsset.type}
                    onSubmit={handleCreateTransaction}
                    onCancel={() => setTxFormOpen(false)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Transaction List */}
            {detailLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="h-8 w-12 rounded bg-muted" />
                    <div className="flex-1 space-y-1">
                      <div className="h-3 w-24 rounded bg-muted" />
                      <div className="h-3 w-16 rounded bg-muted" />
                    </div>
                    <div className="h-4 w-20 rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : detailTransactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                거래 내역이 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {detailTransactions.map((tx) => {
                  const typeLabel =
                    ASSET_TRANSACTION_TYPE_LABELS[tx.type] || tx.type
                  const isInflow =
                    tx.type === "BUY" ||
                    tx.type === "DEPOSIT" ||
                    tx.type === "INTEREST" ||
                    tx.type === "DIVIDEND"

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isInflow ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {typeLabel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(tx.date)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm">
                          <span className="font-medium">
                            {formatCurrency(tx.amount)}
                          </span>
                          {tx.quantity != null && tx.unitPrice != null && (
                            <span className="text-muted-foreground">
                              ({tx.quantity}주 x {formatCurrency(tx.unitPrice)})
                            </span>
                          )}
                        </div>
                        {tx.memo && (
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">
                            {tx.memo}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-600"
                        onClick={() => handleDeleteTransaction(tx.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">삭제</span>
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Value Update Dialog */}
      <Dialog
        open={!!updateValueAsset}
        onOpenChange={(open) => {
          if (!open) {
            setUpdateValueAsset(null)
            setNewValueInput("")
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>현재가 업데이트</DialogTitle>
            <DialogDescription>
              &quot;{updateValueAsset?.name}&quot;의 현재 가치를 업데이트합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium">현재 가치</label>
              <Input
                type="number"
                min={0}
                value={newValueInput}
                onChange={(e) => setNewValueInput(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setUpdateValueAsset(null)
                  setNewValueInput("")
                }}
              >
                취소
              </Button>
              <Button onClick={handleQuickValueUpdate}>업데이트</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
