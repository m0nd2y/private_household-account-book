"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Repeat, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { FREQUENCY_LABELS, TRANSACTION_TYPE_LABELS } from "@/types"
import type { Frequency, TransactionType } from "@/types"
import { toast } from "sonner"

interface RecurringItem {
  id: string
  amount: number
  type: TransactionType
  description: string
  frequency: Frequency
  dayOfMonth: number | null
  dayOfWeek: number | null
  startDate: string
  endDate: string | null
  isActive: boolean
  categoryId: string
  paymentMethodId: string | null
}

interface Category {
  id: string
  name: string
  type: string
}

export default function RecurringPage() {
  const [items, setItems] = useState<RecurringItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null)

  // form state
  const [formType, setFormType] = useState<TransactionType>("EXPENSE")
  const [formAmount, setFormAmount] = useState("")
  const [formDesc, setFormDesc] = useState("")
  const [formFreq, setFormFreq] = useState<Frequency>("MONTHLY")
  const [formDayOfMonth, setFormDayOfMonth] = useState("")
  const [formCategoryId, setFormCategoryId] = useState("")
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split("T")[0])

  const fetchItems = async () => {
    const res = await fetch("/api/recurring")
    setItems(await res.json())
  }

  useEffect(() => {
    fetchItems()
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {})
  }, [])

  const filteredCategories = categories.filter((c) => c.type === formType)

  const resetForm = () => {
    setFormType("EXPENSE")
    setFormAmount("")
    setFormDesc("")
    setFormFreq("MONTHLY")
    setFormDayOfMonth("")
    setFormCategoryId("")
    setFormStartDate(new Date().toISOString().split("T")[0])
    setEditingItem(null)
  }

  const openEdit = (item: RecurringItem) => {
    setEditingItem(item)
    setFormType(item.type)
    setFormAmount(String(item.amount))
    setFormDesc(item.description)
    setFormFreq(item.frequency)
    setFormDayOfMonth(item.dayOfMonth ? String(item.dayOfMonth) : "")
    setFormCategoryId(item.categoryId)
    setFormStartDate(item.startDate.split("T")[0])
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    const amount = parseInt(formAmount)
    if (!amount || !formDesc || !formCategoryId) {
      toast.error("필수 항목을 입력하세요")
      return
    }

    const payload = {
      amount,
      type: formType,
      description: formDesc,
      frequency: formFreq,
      dayOfMonth: formDayOfMonth ? parseInt(formDayOfMonth) : null,
      startDate: formStartDate,
      categoryId: formCategoryId,
    }

    if (editingItem) {
      await fetch(`/api/recurring/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      toast.success("정기 거래가 수정되었습니다")
    } else {
      await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      toast.success("정기 거래가 등록되었습니다")
    }

    setDialogOpen(false)
    resetForm()
    fetchItems()
  }

  const toggleActive = async (item: RecurringItem) => {
    await fetch(`/api/recurring/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, isActive: !item.isActive }),
    })
    fetchItems()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/recurring/${id}`, { method: "DELETE" })
    fetchItems()
    toast.success("정기 거래가 삭제되었습니다")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">정기 거래</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />정기 거래 추가</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "정기 거래 수정" : "정기 거래 추가"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="flex gap-2">
                <Button variant={formType === "EXPENSE" ? "default" : "outline"} className="flex-1" onClick={() => setFormType("EXPENSE")}>지출</Button>
                <Button variant={formType === "INCOME" ? "default" : "outline"} className="flex-1" onClick={() => setFormType("INCOME")}>수입</Button>
              </div>
              <div>
                <label className="text-sm font-medium">설명</label>
                <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="예: 월세, 급여" />
              </div>
              <div>
                <label className="text-sm font-medium">금액</label>
                <Input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="금액" />
              </div>
              <div>
                <label className="text-sm font-medium">반복 주기</label>
                <Select value={formFreq} onValueChange={(v) => setFormFreq(v as Frequency)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(FREQUENCY_LABELS) as [Frequency, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formFreq === "MONTHLY" && (
                <div>
                  <label className="text-sm font-medium">매월 실행일</label>
                  <Input type="number" min={1} max={31} value={formDayOfMonth} onChange={(e) => setFormDayOfMonth(e.target.value)} placeholder="1~31" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">카테고리</label>
                <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                  <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">시작일</label>
                <Input type="date" value={formStartDate} onChange={(e) => setFormStartDate(e.target.value)} />
              </div>
              <Button onClick={handleSubmit} className="w-full">저장</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className={!item.isActive ? "opacity-50" : ""}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <Repeat className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.description}</span>
                    <Badge variant={item.type === "INCOME" ? "default" : "destructive"} className="text-xs">
                      {TRANSACTION_TYPE_LABELS[item.type]}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {FREQUENCY_LABELS[item.frequency]}
                      {item.dayOfMonth && ` ${item.dayOfMonth}일`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(item.startDate)} ~
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-semibold ${item.type === "INCOME" ? "text-green-600" : "text-red-500"}`}>
                  {item.type === "INCOME" ? "+" : "-"}{formatCurrency(item.amount)}
                </span>
                <Switch checked={item.isActive} onCheckedChange={() => toggleActive(item)} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(item)}>
                      <Pencil className="mr-2 h-4 w-4" />수정
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Repeat className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>등록된 정기 거래가 없습니다.</p>
        </div>
      )}
    </div>
  )
}
