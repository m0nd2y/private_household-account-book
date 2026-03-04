import { z } from "zod"

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "카테고리명을 입력해주세요").max(50, "카테고리명은 50자 이내로 입력해주세요"),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "수입 또는 지출을 선택해주세요",
  }),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().optional(),
})

export const categoryUpdateSchema = z.object({
  name: z.string().min(1, "카테고리명을 입력해주세요").max(50, "카테고리명은 50자 이내로 입력해주세요").optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().nullable().optional(),
})

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>
