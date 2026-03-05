import { z } from "zod"

export const fixedCostCreateSchema = z.object({
  name: z.string().min(1, "항목명을 입력해주세요").max(100),
  expectedAmount: z.coerce.number().int().min(0, "금액은 0 이상이어야 합니다"),
  category: z.enum(
    ["HOUSING", "UTILITY", "TELECOM", "SUBSCRIPTION", "INSURANCE", "TRANSPORT", "FINANCE", "ETC"],
    { message: "분류를 선택해주세요" }
  ),
  costType: z.enum(["EXPENSE", "SAVING"]).default("EXPENSE"),
  dueDay: z.coerce.number().int().min(1).max(31).optional().nullable(),
  memo: z.string().max(500).optional().nullable(),
})

export const fixedCostUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  expectedAmount: z.coerce.number().int().min(0).optional(),
  category: z.enum(
    ["HOUSING", "UTILITY", "TELECOM", "SUBSCRIPTION", "INSURANCE", "TRANSPORT", "FINANCE", "ETC"]
  ).optional(),
  costType: z.enum(["EXPENSE", "SAVING"]).optional(),
  dueDay: z.coerce.number().int().min(1).max(31).optional().nullable(),
  memo: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
})

export const fixedCostPaymentSchema = z.object({
  actualAmount: z.coerce.number().int().min(0, "금액은 0 이상이어야 합니다"),
})
