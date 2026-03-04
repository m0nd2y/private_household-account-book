"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { CategoryForm } from "@/components/forms/category-form"
import { getIconComponent } from "@/components/forms/icon-picker"
import type { CategoryCreateInput } from "@/lib/validations/category"
import type { TransactionType } from "@/types"

interface Category {
  id: string
  name: string
  type: string
  icon: string | null
  color: string | null
  isDefault: boolean
  parentId: string | null
  createdAt: string
  children: Category[]
  _count: {
    transactions: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<TransactionType>("EXPENSE")

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/categories")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleCreate = async (data: CategoryCreateInput) => {
    try {
      setIsSubmitting(true)
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to create")
      }
      await fetchCategories()
      setIsCreateOpen(false)
    } catch (error) {
      console.error("Failed to create category:", error)
      alert(error instanceof Error ? error.message : "카테고리 생성에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (data: CategoryCreateInput) => {
    if (!editingCategory) return
    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update")
      }
      await fetchCategories()
      setEditingCategory(null)
    } catch (error) {
      console.error("Failed to update category:", error)
      alert(error instanceof Error ? error.message : "카테고리 수정에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    try {
      const res = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete")
      }
      await fetchCategories()
      setDeletingCategory(null)
    } catch (error) {
      console.error("Failed to delete category:", error)
      alert(error instanceof Error ? error.message : "카테고리 삭제에 실패했습니다.")
    }
  }

  const filteredCategories = categories.filter(
    (cat) => cat.type === activeTab && !cat.parentId
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">카테고리 관리</h1>
          <p className="text-muted-foreground">
            수입/지출 카테고리를 관리합니다.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          카테고리 추가
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TransactionType)}
      >
        <TabsList>
          <TabsTrigger value="EXPENSE" className="gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "#EF4444" }}
            />
            지출
          </TabsTrigger>
          <TabsTrigger value="INCOME" className="gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: "#22C55E" }}
            />
            수입
          </TabsTrigger>
        </TabsList>

        <TabsContent value="EXPENSE">
          <CategoryGrid
            categories={filteredCategories}
            isLoading={isLoading}
            onEdit={setEditingCategory}
            onDelete={setDeletingCategory}
          />
        </TabsContent>

        <TabsContent value="INCOME">
          <CategoryGrid
            categories={filteredCategories}
            isLoading={isLoading}
            onEdit={setEditingCategory}
            onDelete={setDeletingCategory}
          />
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 추가</DialogTitle>
            <DialogDescription>
              새로운 카테고리를 추가합니다.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={isSubmitting}
            fixedType={activeTab}
            defaultValues={{ type: activeTab }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 수정</DialogTitle>
            <DialogDescription>
              카테고리 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              defaultValues={{
                name: editingCategory.name,
                type: editingCategory.type as TransactionType,
                icon: editingCategory.icon || "Tag",
                color: editingCategory.color || "#3B82F6",
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingCategory(null)}
              isLoading={isSubmitting}
              fixedType={editingCategory.type as TransactionType}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingCategory?.name}&quot; 카테고리를 삭제하시겠습니까?
              {deletingCategory?.isDefault && (
                <span className="mt-1 block text-amber-600">
                  기본 카테고리를 삭제하면 복구할 수 없습니다.
                </span>
              )}
              {deletingCategory && deletingCategory._count.transactions > 0 && (
                <span className="mt-1 block text-destructive">
                  이 카테고리에 {deletingCategory._count.transactions}건의 거래가 연결되어 있어 삭제할 수 없습니다.
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
                !!deletingCategory && deletingCategory._count.transactions > 0
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

function CategoryGrid({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: {
  categories: Category[]
  isLoading: boolean
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="flex flex-col items-center gap-3 p-6">
              <div className="h-10 w-10 rounded-full bg-muted" />
              <div className="h-4 w-16 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">등록된 카테고리가 없습니다.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          상단의 &quot;카테고리 추가&quot; 버튼을 눌러 추가해보세요.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {categories.map((category) => {
        const Icon = getIconComponent(category.icon || "Tag")
        return (
          <Card
            key={category.id}
            className="group relative transition-shadow hover:shadow-md"
          >
            <CardContent className="flex flex-col items-center gap-3 p-6">
              {/* Dropdown menu */}
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">메뉴</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(category)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(category)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Icon */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${category.color || "#3B82F6"}20`,
                  color: category.color || "#3B82F6",
                }}
              >
                <Icon className="h-6 w-6" />
              </div>

              {/* Name */}
              <span className="text-sm font-medium">{category.name}</span>

              {/* Badge for default */}
              {category.isDefault && (
                <Badge variant="secondary" className="text-xs">
                  기본
                </Badge>
              )}

              {/* Transaction count */}
              {category._count.transactions > 0 && (
                <span className="text-xs text-muted-foreground">
                  {category._count.transactions}건
                </span>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
