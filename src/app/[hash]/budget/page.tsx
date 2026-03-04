"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PiggyBank, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  type: string
  color: string | null
}

interface BudgetItem {
  id: string
  amount: number
  month: number
  year: number
  categoryId: string | null
  category: Category | null
  spent: number
}

export default function BudgetPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const [totalExpense, setTotalExpense] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formAmount, setFormAmount] = useState("")
  const [formCategoryId, setFormCategoryId] = useState<string>("")

  const fetchBudgets = useCallback(async () => {
    const res = await fetch(`/api/budgets?month=${month}&year=${year}`)
    const data = await res.json()
    setBudgets(data.budgets || [])
    setTotalExpense(data.totalExpense || 0)
  }, [month, year])

  useEffect(() => {
    fetchBudgets()
    fetch("/api/categories?type=EXPENSE")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [fetchBudgets])

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
  const usagePercent = totalBudget > 0 ? Math.min((totalExpense / totalBudget) * 100, 100) : 0

  const handleSubmit = async () => {
    const amount = parseInt(formAmount)
    if (!amount || amount <= 0) {
      toast.error("금액을 입력하세요")
      return
    }

    await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        month,
        year,
        categoryId: formCategoryId || null,
      }),
    })

    setDialogOpen(false)
    setFormAmount("")
    setFormCategoryId("")
    fetchBudgets()
    toast.success("예산이 설정되었습니다")
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/budgets/${id}`, { method: "DELETE" })
    fetchBudgets()
    toast.success("예산이 삭제되었습니다")
  }

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1) }
    else setMonth(month - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1) }
    else setMonth(month + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">예산 관리</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />예산 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>예산 설정</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">카테고리</label>
                <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                  <SelectTrigger><SelectValue placeholder="전체 (총 예산)" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">금액</label>
                <Input
                  type="number"
                  placeholder="예산 금액"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full">저장</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 월 선택 */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold">{year}년 {month}월</span>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 총 예산 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            이번 달 예산 현황
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>지출: {formatCurrency(totalExpense)}</span>
            <span>예산: {formatCurrency(totalBudget)}</span>
          </div>
          <Progress value={usagePercent} className="h-3" />
          <p className="text-sm text-muted-foreground text-center">
            {usagePercent.toFixed(0)}% 사용 | 남은 예산: {formatCurrency(Math.max(totalBudget - totalExpense, 0))}
          </p>
        </CardContent>
      </Card>

      {/* 카테고리별 예산 */}
      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((b) => {
          const percent = b.amount > 0 ? Math.min((b.spent / b.amount) * 100, 100) : 0
          const isOver = b.spent > b.amount
          return (
            <Card key={b.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {b.category?.color && (
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: b.category.color }} />
                    )}
                    <span className="font-medium">{b.category?.name || "총 예산"}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(b.id)} className="text-muted-foreground text-xs">
                    삭제
                  </Button>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className={isOver ? "text-red-500 font-medium" : ""}>
                    {formatCurrency(b.spent)}
                  </span>
                  <span className="text-muted-foreground">{formatCurrency(b.amount)}</span>
                </div>
                <Progress value={percent} className={`h-2 ${isOver ? "[&>div]:bg-red-500" : ""}`} />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {budgets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <PiggyBank className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>설정된 예산이 없습니다.</p>
          <p className="text-sm">위의 &quot;예산 추가&quot; 버튼으로 예산을 설정하세요.</p>
        </div>
      )}
    </div>
  )
}
