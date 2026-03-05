export type TransactionType = "INCOME" | "EXPENSE"

export type PaymentType =
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CASH"
  | "BANK_TRANSFER"
  | "E_WALLET"

export type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "수입",
  EXPENSE: "지출",
}

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  CREDIT_CARD: "신용카드",
  DEBIT_CARD: "체크카드",
  CASH: "현금",
  BANK_TRANSFER: "계좌이체",
  E_WALLET: "간편결제",
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: "매일",
  WEEKLY: "매주",
  MONTHLY: "매월",
  YEARLY: "매년",
}

export type AssetType =
  | "DEPOSIT"
  | "SAVINGS"
  | "INVESTMENT"
  | "CRYPTO"
  | "PENSION_INSURANCE"

export type AssetTransactionType =
  | "BUY"
  | "SELL"
  | "DEPOSIT"
  | "WITHDRAW"
  | "INTEREST"
  | "DIVIDEND"

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  DEPOSIT: "예금",
  SAVINGS: "적금",
  INVESTMENT: "투자",
  CRYPTO: "가상화폐",
  PENSION_INSURANCE: "연금/보험",
}

export const ASSET_TRANSACTION_TYPE_LABELS: Record<AssetTransactionType, string> = {
  BUY: "매수",
  SELL: "매도",
  DEPOSIT: "입금",
  WITHDRAW: "출금",
  INTEREST: "이자",
  DIVIDEND: "배당",
}

export type FixedCostCategory =
  | "HOUSING"
  | "UTILITY"
  | "TELECOM"
  | "SUBSCRIPTION"
  | "INSURANCE"
  | "TRANSPORT"
  | "FINANCE"
  | "ETC"

export const FIXED_COST_CATEGORY_LABELS: Record<FixedCostCategory, string> = {
  HOUSING: "주거",
  UTILITY: "공과금",
  TELECOM: "통신",
  SUBSCRIPTION: "구독",
  INSURANCE: "보험",
  TRANSPORT: "교통",
  FINANCE: "금융",
  ETC: "기타",
}

export type FixedCostType = "EXPENSE" | "SAVING"

export const FIXED_COST_TYPE_LABELS: Record<FixedCostType, string> = {
  EXPENSE: "지출",
  SAVING: "저축/투자",
}
