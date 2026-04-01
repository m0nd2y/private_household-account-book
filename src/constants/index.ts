import type { TransactionType } from "@/types"

export interface DefaultCategory {
  name: string
  type: TransactionType
  icon: string
  color: string
}

export const DEFAULT_INCOME_CATEGORIES: DefaultCategory[] = [
  { name: "급여", type: "INCOME", icon: "Banknote", color: "#22C55E" },
  { name: "부수입", type: "INCOME", icon: "TrendingUp", color: "#10B981" },
  { name: "용돈", type: "INCOME", icon: "Gift", color: "#14B8A6" },
  { name: "투자수익", type: "INCOME", icon: "LineChart", color: "#06B6D4" },
  { name: "환급금", type: "INCOME", icon: "RotateCcw", color: "#0EA5E9" },
  { name: "기타 수입", type: "INCOME", icon: "Plus", color: "#6366F1" },
]

export const DEFAULT_EXPENSE_CATEGORIES: DefaultCategory[] = [
  { name: "식비", type: "EXPENSE", icon: "UtensilsCrossed", color: "#EF4444" },
  { name: "교통비", type: "EXPENSE", icon: "Car", color: "#F97316" },
  { name: "주거비", type: "EXPENSE", icon: "Home", color: "#F59E0B" },
  { name: "통신비", type: "EXPENSE", icon: "Smartphone", color: "#EAB308" },
  { name: "의료/건강", type: "EXPENSE", icon: "Heart", color: "#84CC16" },
  { name: "교육", type: "EXPENSE", icon: "GraduationCap", color: "#22C55E" },
  { name: "문화/여가", type: "EXPENSE", icon: "Film", color: "#14B8A6" },
  { name: "쇼핑", type: "EXPENSE", icon: "ShoppingBag", color: "#06B6D4" },
  { name: "금융", type: "EXPENSE", icon: "Building2", color: "#3B82F6" },
  { name: "경조사", type: "EXPENSE", icon: "Users", color: "#8B5CF6" },
  { name: "기타 지출", type: "EXPENSE", icon: "MoreHorizontal", color: "#6B7280" },
]

export const ALL_DEFAULT_CATEGORIES = [
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_EXPENSE_CATEGORIES,
]

export const ASSET_TYPE_COLORS: Record<string, string> = {
  DEPOSIT: "#3B82F6",
  SAVINGS: "#22C55E",
  INVESTMENT: "#F59E0B",
  CRYPTO: "#8B5CF6",
  PENSION_INSURANCE: "#EC4899",
}

export const NAV_ITEMS = [
  { href: "", label: "대시보드", icon: "LayoutDashboard" },
  { href: "/transactions", label: "거래 관리", icon: "ArrowLeftRight" },
  { href: "/categories", label: "카테고리", icon: "Tag" },
  { href: "/payment-methods", label: "결제수단", icon: "CreditCard" },
  { href: "/budget", label: "예산 관리", icon: "PiggyBank" },
  { href: "/recurring", label: "정기거래 / 수입", icon: "Repeat" },
  { href: "/fixed-costs", label: "고정비용 / 지출", icon: "CalendarCheck" },
  { href: "/assets", label: "자산 관리", icon: "Landmark" },
  { href: "/statistics", label: "통계", icon: "BarChart3" },
  { href: "/settings", label: "설정", icon: "Settings" },
]
