"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DonutChart } from "@/components/charts/donut-chart"
import { MonthlyBarChart } from "@/components/charts/bar-chart"
import { formatCurrency } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CategoryStat {
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

interface PaymentMethodStat {
  paymentMethodId: string | null
  name: string
  type: string | null
  total: number
  count: number
}

const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
]

const PAYMENT_METHOD_COLORS = [
  "#3B82F6",
  "#22C55E",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#6366F1",
  "#14B8A6",
]

function ChartSkeleton() {
  return (
    <div className="h-[350px] animate-pulse rounded bg-muted" />
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
          <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export default function StatisticsPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [activeTab, setActiveTab] = useState("monthly")

  const [categoryData, setCategoryData] = useState<CategoryStat[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrendData[]>([])
  const [paymentMethodData, setPaymentMethodData] = useState<
    PaymentMethodStat[]
  >([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [categoryRes, trendRes, paymentRes] = await Promise.all([
        fetch(
          `/api/statistics/category?month=${selectedMonth}&year=${selectedYear}&type=EXPENSE`
        ),
        fetch(`/api/statistics/monthly-trend?year=${selectedYear}`),
        fetch(
          `/api/statistics/payment-method?month=${selectedMonth}&year=${selectedYear}`
        ),
      ])

      if (categoryRes.ok) {
        setCategoryData(await categoryRes.json())
      }
      if (trendRes.ok) {
        setMonthlyTrend(await trendRes.json())
      }
      if (paymentRes.ok) {
        setPaymentMethodData(await paymentRes.json())
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth, selectedYear])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Navigate months
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

  // Prepare chart data
  const monthlyBarData = monthlyTrend.map((d) => ({
    name: MONTH_LABELS[d.month - 1],
    income: d.income,
    expense: d.expense,
  }))

  const donutData = categoryData.map((c) => ({
    name: c.categoryName,
    value: c.total,
    color: c.color,
  }))

  const paymentBarData = paymentMethodData.map((pm) => ({
    name: pm.name,
    total: pm.total,
  }))

  const totalCategoryExpense = categoryData.reduce((s, c) => s + c.total, 0)
  const totalPaymentExpense = paymentMethodData.reduce(
    (s, pm) => s + pm.total,
    0
  )

  return (
    <div className="space-y-6">
      {/* Page title & period selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">통계</h1>
          <p className="text-sm text-muted-foreground">
            수입과 지출을 분석합니다
          </p>
        </div>

        {/* Period selector */}
        <div className="flex items-center gap-2 rounded-lg border bg-card px-2 py-1">
          <button
            onClick={goToPrevMonth}
            className="rounded-md p-1 hover:bg-accent"
            aria-label="이전 달"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[120px] text-center text-sm font-medium">
            {selectedYear}년 {selectedMonth}월
          </span>
          <button
            onClick={goToNextMonth}
            className="rounded-md p-1 hover:bg-accent"
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">월별 비교</TabsTrigger>
          <TabsTrigger value="category">카테고리 분석</TabsTrigger>
          <TabsTrigger value="payment">결제수단 분석</TabsTrigger>
        </TabsList>

        {/* Tab 1: Monthly comparison */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedYear}년 월별 수입/지출 비교
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton />
              ) : (
                <MonthlyBarChart data={monthlyBarData} />
              )}
            </CardContent>
          </Card>

          {/* Monthly summary table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">월별 상세</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left font-medium text-muted-foreground">
                          월
                        </th>
                        <th className="py-2 text-right font-medium text-muted-foreground">
                          수입
                        </th>
                        <th className="py-2 text-right font-medium text-muted-foreground">
                          지출
                        </th>
                        <th className="py-2 text-right font-medium text-muted-foreground">
                          잔액
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyTrend.map((d) => (
                        <tr
                          key={d.month}
                          className={`border-b last:border-0 ${
                            d.month === selectedMonth
                              ? "bg-accent/50"
                              : ""
                          }`}
                        >
                          <td className="py-2.5 font-medium">
                            {MONTH_LABELS[d.month - 1]}
                          </td>
                          <td className="py-2.5 text-right text-green-600 dark:text-green-400">
                            {d.income > 0
                              ? formatCurrency(d.income)
                              : "-"}
                          </td>
                          <td className="py-2.5 text-right text-red-600 dark:text-red-400">
                            {d.expense > 0
                              ? formatCurrency(d.expense)
                              : "-"}
                          </td>
                          <td
                            className={`py-2.5 text-right font-medium ${
                              d.income - d.expense >= 0
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {d.income > 0 || d.expense > 0
                              ? formatCurrency(d.income - d.expense)
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td className="py-2.5">합계</td>
                        <td className="py-2.5 text-right text-green-600 dark:text-green-400">
                          {formatCurrency(
                            monthlyTrend.reduce(
                              (s, d) => s + d.income,
                              0
                            )
                          )}
                        </td>
                        <td className="py-2.5 text-right text-red-600 dark:text-red-400">
                          {formatCurrency(
                            monthlyTrend.reduce(
                              (s, d) => s + d.expense,
                              0
                            )
                          )}
                        </td>
                        <td
                          className={`py-2.5 text-right ${
                            monthlyTrend.reduce(
                              (s, d) => s + d.income - d.expense,
                              0
                            ) >= 0
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatCurrency(
                            monthlyTrend.reduce(
                              (s, d) => s + d.income - d.expense,
                              0
                            )
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Category analysis */}
        <TabsContent value="category" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Donut Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedYear}년 {selectedMonth}월 카테고리별 지출
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <DonutChart data={donutData} />
                )}
              </CardContent>
            </Card>

            {/* Category Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">카테고리별 상세</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton />
                ) : categoryData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      지출 데이터가 없습니다
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoryData.map((cat) => (
                      <div key={cat.categoryId} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="font-medium">
                              {cat.categoryName}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-muted-foreground">
                              {cat.percentage}%
                            </span>
                            <span className="font-semibold">
                              {formatCurrency(cat.total)}
                            </span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: cat.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {/* Total */}
                    <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm font-semibold">
                      <span>합계</span>
                      <span>{formatCurrency(totalCategoryExpense)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Payment method analysis */}
        <TabsContent value="payment" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedYear}년 {selectedMonth}월 결제수단별 지출
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <MonthlyBarChart
                    data={paymentBarData}
                    bars={[
                      {
                        dataKey: "total",
                        name: "지출",
                        color: "#3B82F6",
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>

            {/* Payment Method Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">결제수단별 상세</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <TableSkeleton />
                ) : paymentMethodData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      지출 데이터가 없습니다
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left font-medium text-muted-foreground">
                            결제수단
                          </th>
                          <th className="py-2 text-right font-medium text-muted-foreground">
                            건수
                          </th>
                          <th className="py-2 text-right font-medium text-muted-foreground">
                            금액
                          </th>
                          <th className="py-2 text-right font-medium text-muted-foreground">
                            비율
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentMethodData.map((pm, index) => (
                          <tr
                            key={pm.paymentMethodId || "none"}
                            className="border-b last:border-0"
                          >
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      PAYMENT_METHOD_COLORS[
                                        index % PAYMENT_METHOD_COLORS.length
                                      ],
                                  }}
                                />
                                <span className="font-medium">{pm.name}</span>
                              </div>
                            </td>
                            <td className="py-2.5 text-right text-muted-foreground">
                              {pm.count}건
                            </td>
                            <td className="py-2.5 text-right font-semibold">
                              {formatCurrency(pm.total)}
                            </td>
                            <td className="py-2.5 text-right text-muted-foreground">
                              {totalPaymentExpense > 0
                                ? Math.round(
                                    (pm.total / totalPaymentExpense) * 100
                                  )
                                : 0}
                              %
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 font-semibold">
                          <td className="py-2.5">합계</td>
                          <td className="py-2.5 text-right text-muted-foreground">
                            {paymentMethodData.reduce(
                              (s, pm) => s + pm.count,
                              0
                            )}
                            건
                          </td>
                          <td className="py-2.5 text-right">
                            {formatCurrency(totalPaymentExpense)}
                          </td>
                          <td className="py-2.5 text-right">100%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
