"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categoryCreateSchema, type CategoryCreateInput } from "@/lib/validations/category"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPicker } from "@/components/forms/icon-picker"
import { ColorPicker } from "@/components/forms/color-picker"
import type { TransactionType } from "@/types"

interface CategoryFormProps {
  defaultValues?: Partial<CategoryCreateInput>
  onSubmit: (data: CategoryCreateInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  fixedType?: TransactionType
}

export function CategoryForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
  fixedType,
}: CategoryFormProps) {
  const form = useForm<CategoryCreateInput>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      type: fixedType || defaultValues?.type || "EXPENSE",
      icon: defaultValues?.icon || "Tag",
      color: defaultValues?.color || "#3B82F6",
      parentId: defaultValues?.parentId || undefined,
    },
  })

  const handleSubmit = async (data: CategoryCreateInput) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>카테고리명</FormLabel>
              <FormControl>
                <Input placeholder="카테고리명을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!fixedType && (
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>유형</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="유형을 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INCOME">수입</SelectItem>
                    <SelectItem value="EXPENSE">지출</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>아이콘</FormLabel>
              <FormControl>
                <IconPicker value={field.value || "Tag"} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>색상</FormLabel>
              <FormControl>
                <ColorPicker value={field.value || "#3B82F6"} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "저장 중..." : "저장"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
