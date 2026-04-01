"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { DonutChart } from "@/components/charts/donut-chart"
import { MonthlyLineChart } from "@/components/charts/line-chart"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CalendarCheck,
  Tag,
} from "lucide-react"

interface FixedCostsSummary {
  total: number
  paid: number
  expectedTotal: number
  paidTotal: number
  unpaidNames: string[]
}

interface SummaryData {
  totalIncome: number
  totalExpense: number
  balance: number
  totalDiscount?: number
  transactionExpense?: number
  fixedCostExpense?: number
  fixedCostSaving?: number
  previousMonthIncome: number
  previousMonthExpense: number
  fixedCosts?: FixedCostsSummary
}

interface CategoryData {
  categoryId: string
  categoryName: string
  color: string
  icon: string | null
  total: number
  percentage: number
}

interface MonthlyTrendData {
  month: number
  income: number
  expense: number
}

interface BudgetData {
  budgets: Array<{
    id: string
    amount: number
    categoryId: string | null
    spent: number
  }>
  totalExpense: number
}

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  date: string
  category: {
    name: string
    icon: string | null
    color: string | null
  }
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

function TransactionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-16 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function getChangePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendData[]>([])
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  )
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, categoryRes, trendRes, budgetRes, recentRes] =
        await Promise.all([
          fetch(
            `/api/statistics/summary?month=${currentMonth}&year=${currentYear}`
          ),
          fetch(
            `/api/statistics/category?month=${currentMonth}&year=${currentYear}&type=EXPENSE`
          ),
          fetch(`/api/statistics/monthly-trend?year=${currentYear}`),
          fetch(`/api/budgets?month=${currentMonth}&year=${currentYear}`),
          fetch(`/api/transactions?limit=5`),
        ])

      if (summaryRes.ok) {
        setSummary(await summaryRes.json())
      }
      if (categoryRes.ok) {
        setCategoryData(await categoryRes.json())
      }
      if (trendRes.ok) {
        setMonthlyTrend(await trendRes.json())
      }
      if (budgetRes.ok) {
        setBudgetData(await budgetRes.json())
      }
      if (recentRes.ok) {
        const recentData = await recentRes.json()
        const txList = Array.isArray(recentData)
          ? recentData
          : recentData.data || []
        setRecentTransactions(txList.slice(0, 5))
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [currentMonth, currentYear])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate budget usage
  const totalBudget =
    budgetData?.budgets.reduce((sum, b) => sum + b.amount, 0) || 0
  const totalSpent = budgetData?.totalExpense || summary?.totalExpense || 0
  const budgetUsagePercent =
    totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0

  // Change percentages
  const incomeChange = summary
    ? getChangePercent(summary.totalIncome, summary.previousMonthIncome)
    : 0
  const expenseChange = summary
    ? getChangePercent(summary.totalExpense, summary.previousMonthExpense)
    : 0

  // Donut chart data
  const donutData = categoryData.map((c) => ({
    name: c.categoryName,
    value: c.total,
    color: c.color,
  }))

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground">
            {currentYear}년 {currentMonth}월 현황
          </p>
        </div>
        <SummarySkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <TransactionSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold">대시보드</h1>
        <p className="text-sm text-muted-foreground">
          {currentYear}년 {currentMonth}월 현황
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 수입</CardTitle>
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary?.totalIncome || 0)}
            </div>
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              {incomeChange > 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              ) : incomeChange < 0 ? (
                <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              ) : (
                <Minus className="mr-1 h-3 w-3" />
              )}
              전월 대비 {Math.abs(incomeChange)}%
              {incomeChange > 0 ? " 증가" : incomeChange < 0 ? " 감소" : ""}
            </div>
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 지출</CardTitle>
            <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30">
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary?.totalExpense || 0)}
            </div>
            {(summary?.fixedCostExpense ?? 0) > 0 && (
              <div className="mt-1 text-xs text-muted-foreground">
                변동 {formatCurrency(summary?.transactionExpense || 0)} + 고정 {formatCurrency(summary?.fixedCostExpense || 0)}
              </div>
            )}
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              {expenseChange > 0 ? (
                <ArrowUpRight className="mr-1 h-3 w-3 text-red-500" />
              ) : expenseChange < 0 ? (
                <ArrowDownRight className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <Minus className="mr-1 h-3 w-3" />
              )}
              전월 대비 {Math.abs(expenseChange)}%
              {expenseChange > 0 ? " 증가" : expenseChange < 0 ? " 감소" : ""}
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">잔액</CardTitle>
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (summary?.balance || 0) >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(summary?.balance || 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              수입 - 지출
            </p>
          </CardContent>
        </Card>

        {/* Budget Usage Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">예산 사용률</CardTitle>
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
              <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBudget > 0 ? `${budgetUsagePercent}%` : "-"}
            </div>
            {totalBudget > 0 ? (
              <>
                <Progress
                  value={budgetUsagePercent}
                  className="mt-2"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                설정된 예산이 없습니다
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Discount Card */}
      {(summary?.totalDiscount ?? 0) > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 할인 금액</CardTitle>
            <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
              <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(summary?.totalDiscount || 0)}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              할인 적용으로 절약한 금액
            </p>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">카테고리별 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={donutData} />
          </CardContent>
        </Card>

        {/* Monthly Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">월별 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyLineChart data={monthlyTrend} />
          </CardContent>
        </Card>
      </div>

      {/* Fixed Costs Widget */}
      {summary?.fixedCosts && summary.fixedCosts.total > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">고정비용 현황</CardTitle>
            <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
              <CalendarCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">
                {summary.fixedCosts.total}개 중{" "}
                <span className="font-semibold text-green-600">
                  {summary.fixedCosts.paid}개
                </span>{" "}
                납부 완료
              </span>
              <span className="text-sm text-muted-foreground">
                {summary.fixedCosts.total > 0
                  ? Math.round(
                      (summary.fixedCosts.paid / summary.fixedCosts.total) * 100
                    )
                  : 0}
                %
              </span>
            </div>
            <Progress
              value={
                summary.fixedCosts.total > 0
                  ? Math.round(
                      (summary.fixedCosts.paid / summary.fixedCosts.total) * 100
                    )
                  : 0
              }
              className="h-2 mb-3"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                납부: {formatCurrency(summary.fixedCosts.paidTotal)} /{" "}
                {formatCurrency(summary.fixedCosts.expectedTotal)}
              </span>
            </div>
            {summary.fixedCosts.unpaidNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {summary.fixedCosts.unpaidNames.map((name) => (
                  <Badge key={name} variant="secondary" className="text-xs text-orange-600">
                    {name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 거래</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-sm text-muted-foreground">
                거래 내역이 없습니다
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTransactions.map((tx, index) => (
                <div key={tx.id}>
                  <div className="flex items-center gap-3 py-3">
                    {/* Category icon circle */}
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium"
                      style={{
                        backgroundColor:
                          tx.category?.color || "#6B7280",
                      }}
                    >
                      {tx.category?.name?.charAt(0) || "?"}
                    </div>

                    {/* Description & category */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {tx.description || tx.category?.name || "거래"}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(tx.date)}
                        </span>
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          {tx.category?.name}
                        </Badge>
                      </div>
                    </div>

                    {/* Amount */}
                    <div
                      className={`shrink-0 text-sm font-semibold ${
                        tx.type === "INCOME"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {tx.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                  {index < recentTransactions.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
