import { z } from "zod"

export const budgetSchema = z.object({
  amount: z.number().min(0, "금액은 0 이상이어야 합니다"),
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
  categoryId: z.string().optional().nullable(),
})

export type BudgetFormData = z.infer<typeof budgetSchema>
