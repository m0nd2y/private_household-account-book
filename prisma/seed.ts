import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DEFAULT_CATEGORIES = [
  { name: "급여", type: "INCOME", icon: "Banknote", color: "#22C55E" },
  { name: "부수입", type: "INCOME", icon: "TrendingUp", color: "#10B981" },
  { name: "용돈", type: "INCOME", icon: "Gift", color: "#14B8A6" },
  { name: "투자수익", type: "INCOME", icon: "LineChart", color: "#06B6D4" },
  { name: "환급금", type: "INCOME", icon: "RotateCcw", color: "#0EA5E9" },
  { name: "기타 수입", type: "INCOME", icon: "Plus", color: "#6366F1" },
  { name: "식비", type: "EXPENSE", icon: "UtensilsCrossed", color: "#EF4444" },
  { name: "교통비", type: "EXPENSE", icon: "Car", color: "#F97316" },
  { name: "주거비", type: "EXPENSE", icon: "Home", color: "#F59E0B" },
  { name: "통신비", type: "EXPENSE", icon: "Smartphone", color: "#EAB308" },
  { name: "의료/건강", type: "EXPENSE", icon: "Heart", color: "#84CC16" },
  { name: "교육", type: "EXPENSE", icon: "GraduationCap", color: "#22C55E" },
  { name: "문화/여가", type: "EXPENSE", icon: "Film", color: "#14B8A6" },
  { name: "쇼핑", type: "EXPENSE", icon: "ShoppingBag", color: "#06B6D4" },
  { name: "금융", type: "EXPENSE", icon: "Building2", color: "#3B82F6" },
  { name: "술", type: "EXPENSE", icon: "Wine", color: "#A855F7" },
  { name: "경조사", type: "EXPENSE", icon: "Users", color: "#8B5CF6" },
  { name: "기타 지출", type: "EXPENSE", icon: "MoreHorizontal", color: "#6B7280" },
]

const DEFAULT_PAYMENT_METHODS = [
  { name: "현금", type: "CASH", isDefault: true },
  { name: "계좌이체", type: "BANK_TRANSFER", isDefault: false },
]

async function main() {
  console.log("Seeding database...")

  for (const cat of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type },
    })
    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
        },
      })
    }
  }

  for (const pm of DEFAULT_PAYMENT_METHODS) {
    const existing = await prisma.paymentMethod.findFirst({
      where: { name: pm.name, type: pm.type },
    })
    if (!existing) {
      await prisma.paymentMethod.create({
        data: {
          name: pm.name,
          type: pm.type,
          isDefault: pm.isDefault,
        },
      })
    }
  }

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
