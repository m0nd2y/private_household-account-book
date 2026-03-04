import { z } from "zod"

export const assetCreateSchema = z.object({
  name: z.string().min(1, "자산명을 입력해주세요").max(100),
  type: z.enum(["DEPOSIT", "SAVINGS", "INVESTMENT", "CRYPTO", "PENSION_INSURANCE"], {
    message: "자산 유형을 선택해주세요",
  }),
  institution: z.string().max(100).optional(),
  accountNumber: z.string().max(50).optional(),
  interestRate: z.coerce.number().min(0).max(100).optional(),
  maturityDate: z.coerce.date().optional(),
  memo: z.string().max(500).optional(),
  currentValue: z.coerce.number().int().min(0).default(0),
  initialAmount: z.coerce.number().int().min(0).default(0),
})

export const assetUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(["DEPOSIT", "SAVINGS", "INVESTMENT", "CRYPTO", "PENSION_INSURANCE"]).optional(),
  institution: z.string().max(100).nullable().optional(),
  accountNumber: z.string().max(50).nullable().optional(),
  interestRate: z.coerce.number().min(0).max(100).nullable().optional(),
  maturityDate: z.coerce.date().nullable().optional(),
  memo: z.string().max(500).nullable().optional(),
  currentValue: z.coerce.number().int().min(0).optional(),
  initialAmount: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const assetTransactionCreateSchema = z.object({
  type: z.enum(["BUY", "SELL", "DEPOSIT", "WITHDRAW", "INTEREST", "DIVIDEND"], {
    message: "거래 유형을 선택해주세요",
  }),
  amount: z.coerce.number().int().min(1, "금액은 1원 이상이어야 합니다"),
  quantity: z.coerce.number().min(0).optional(),
  unitPrice: z.coerce.number().min(0).optional(),
  date: z.coerce.date({ message: "날짜를 선택해주세요" }),
  memo: z.string().max(500).optional(),
})

export const assetTransactionUpdateSchema = z.object({
  type: z.enum(["BUY", "SELL", "DEPOSIT", "WITHDRAW", "INTEREST", "DIVIDEND"]).optional(),
  amount: z.coerce.number().int().min(1).optional(),
  quantity: z.coerce.number().min(0).nullable().optional(),
  unitPrice: z.coerce.number().min(0).nullable().optional(),
  date: z.coerce.date().optional(),
  memo: z.string().max(500).nullable().optional(),
})
