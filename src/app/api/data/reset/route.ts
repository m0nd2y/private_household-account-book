import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    await prisma.fixedCostPayment.deleteMany({})
    await prisma.fixedCost.deleteMany({})
    await prisma.assetSnapshot.deleteMany({})
    await prisma.assetTransaction.deleteMany({})
    await prisma.asset.deleteMany({})
    await prisma.transaction.deleteMany({})
    await prisma.budget.deleteMany({})
    await prisma.recurringTransaction.deleteMany({})
    await prisma.tag.deleteMany({})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reset data:", error)
    return NextResponse.json({ error: "Failed to reset data" }, { status: 500 })
  }
}
