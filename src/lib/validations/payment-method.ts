import { z } from "zod"

export const paymentMethodCreateSchema = z.object({
  name: z.string().min(1, "결제수단명을 입력해주세요").max(50, "결제수단명은 50자 이내로 입력해주세요"),
  type: z.enum(["CREDIT_CARD", "DEBIT_CARD", "CASH", "BANK_TRANSFER", "E_WALLET"], {
    message: "결제수단 유형을 선택해주세요",
  }),
  cardCompany: z.string().max(50).optional(),
  paymentDay: z
    .number()
    .int()
    .min(1, "결제일은 1~31 사이의 값이어야 합니다")
    .max(31, "결제일은 1~31 사이의 값이어야 합니다")
    .optional(),
  creditLimit: z
    .number()
    .int()
    .min(0, "한도는 0 이상이어야 합니다")
    .optional(),
})

export const paymentMethodUpdateSchema = z.object({
  name: z.string().min(1, "결제수단명을 입력해주세요").max(50, "결제수단명은 50자 이내로 입력해주세요").optional(),
  type: z.enum(["CREDIT_CARD", "DEBIT_CARD", "CASH", "BANK_TRANSFER", "E_WALLET"]).optional(),
  cardCompany: z.string().max(50).nullable().optional(),
  paymentDay: z
    .number()
    .int()
    .min(1)
    .max(31)
    .nullable()
    .optional(),
  creditLimit: z
    .number()
    .int()
    .min(0)
    .nullable()
    .optional(),
})

export type PaymentMethodCreateInput = z.infer<typeof paymentMethodCreateSchema>
export type PaymentMethodUpdateInput = z.infer<typeof paymentMethodUpdateSchema>
