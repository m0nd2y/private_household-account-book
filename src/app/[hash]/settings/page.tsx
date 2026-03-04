"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Settings, Download, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const handleExport = async () => {
    try {
      const res = await fetch("/api/transactions?limit=10000")
      const data = await res.json()
      const transactions = data.data || []

      if (transactions.length === 0) {
        toast.error("내보낼 데이터가 없습니다")
        return
      }

      const headers = ["날짜", "유형", "카테고리", "설명", "금액", "결제수단", "메모"]
      const rows = transactions.map((t: { date: string; type: string; category?: { name: string }; description?: string; amount: number; paymentMethod?: { name: string }; memo?: string }) => [
        new Date(t.date).toLocaleDateString("ko-KR"),
        t.type === "INCOME" ? "수입" : "지출",
        t.category?.name || "",
        t.description || "",
        t.amount,
        t.paymentMethod?.name || "",
        t.memo || "",
      ])

      const BOM = "\uFEFF"
      const csv = BOM + [headers.join(","), ...rows.map((r: (string | number)[]) => r.map((v) => `"${v}"`).join(","))].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `가계부_${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("CSV 파일이 다운로드되었습니다")
    } catch {
      toast.error("내보내기에 실패했습니다")
    }
  }

  const handleReset = async () => {
    try {
      const res = await fetch("/api/data/reset", { method: "POST" })
      if (res.ok) {
        toast.success("모든 데이터가 초기화되었습니다")
      } else {
        toast.error("초기화에 실패했습니다")
      }
    } catch {
      toast.error("초기화에 실패했습니다")
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            일반 설정
          </CardTitle>
          <CardDescription>가계부 기본 설정을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">통화</p>
              <p className="text-sm text-muted-foreground">원화 (KRW, ₩)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            데이터 관리
          </CardTitle>
          <CardDescription>데이터를 내보내거나 초기화할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">데이터 내보내기</p>
              <p className="text-sm text-muted-foreground">모든 거래 내역을 CSV 파일로 다운로드</p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />CSV 내보내기
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-600">데이터 초기화</p>
                <p className="text-sm text-muted-foreground">모든 거래, 예산, 정기 거래 데이터를 삭제합니다.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />초기화
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>정말로 초기화하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 모든 거래, 예산, 정기 거래 데이터가 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                      초기화
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
