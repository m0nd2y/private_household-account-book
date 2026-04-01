import { z } from "zod"

export const transactionCreateSchema = z.object({
  amount: z.coerce
    .number()
    .int("금액은 정수여야 합니다")
    .min(1, "금액은 1원 이상이어야 합니다"),
  discountAmount: z.coerce.number().int().min(0).optional(),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "수입 또는 지출을 선택해주세요",
  }),
  description: z
    .string()
    .max(200, "설명은 200자 이내로 입력해주세요")
    .optional(),
  memo: z
    .string()
    .max(500, "메모는 500자 이내로 입력해주세요")
    .optional(),
  date: z.coerce.date({ message: "날짜를 선택해주세요" }),
  categoryId: z.string().min(1, "카테고리를 선택해주세요"),
  paymentMethodId: z.string().optional(),
  tagNames: z.array(z.string()).optional(),
})

export const transactionUpdateSchema = z.object({
  amount: z.coerce
    .number()
    .int("금액은 정수여야 합니다")
    .min(1, "금액은 1원 이상이어야 합니다")
    .optional(),
  discountAmount: z.coerce.number().int().min(0).optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  description: z
    .string()
    .max(200, "설명은 200자 이내로 입력해주세요")
    .nullable()
    .optional(),
  memo: z
    .string()
    .max(500, "메모는 500자 이내로 입력해주세요")
    .nullable()
    .optional(),
  date: z.coerce.date().optional(),
  categoryId: z.string().min(1).optional(),
  paymentMethodId: z.string().nullable().optional(),
  tagNames: z.array(z.string()).optional(),
})

export type TransactionCreateInput = z.output<typeof transactionCreateSchema>
export type TransactionUpdateInput = z.output<typeof transactionUpdateSchema>

/** Form values type for react-hook-form (matches the output shape) */
export interface TransactionFormValues {
  amount: number
  discountAmount?: number
  type: "INCOME" | "EXPENSE"
  description?: string
  memo?: string
  date: Date
  categoryId: string
  paymentMethodId?: string
  tagNames?: string[]
}
