import { z } from "zod"

export const recurringSchema = z.object({
  amount: z.number().min(1, "금액을 입력하세요"),
  type: z.enum(["INCOME", "EXPENSE"]),
  description: z.string().min(1, "설명을 입력하세요"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
  dayOfMonth: z.number().min(1).max(31).optional().nullable(),
  dayOfWeek: z.number().min(0).max(6).optional().nullable(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  categoryId: z.string().min(1, "카테고리를 선택하세요"),
  paymentMethodId: z.string().optional().nullable(),
})

export type RecurringFormData = z.infer<typeof recurringSchema>
