import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get("assetId")
    const months = parseInt(searchParams.get("months") || "12")

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    startDate.setHours(0, 0, 0, 0)

    const where: Record<string, unknown> = {
      date: { gte: startDate },
    }

    if (assetId) {
      where.assetId = assetId
    }

    const snapshots = await prisma.assetSnapshot.findMany({
      where,
      include: {
        asset: {
          select: {
            name: true,
            type: true,
          },
        },
      },
      orderBy: { date: "asc" },
    })

    const data = snapshots.map((snapshot) => ({
      id: snapshot.id,
      assetId: snapshot.assetId,
      date: snapshot.date,
      value: snapshot.value,
      assetName: snapshot.asset?.name ?? "(삭제된 자산)",
      assetType: snapshot.asset?.type ?? "",
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Failed to fetch asset snapshots:", error)
    return NextResponse.json(
      { error: "자산 스냅샷을 불러오는데 실패했습니다" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId } = body || {}

    // Use start of today as snapshot date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (assetId) {
      // Snapshot a single asset
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
      })

      if (!asset) {
        return NextResponse.json(
          { error: "자산을 찾을 수 없습니다" },
          { status: 404 }
        )
      }

      const snapshot = await prisma.assetSnapshot.upsert({
        where: {
          assetId_date: {
            assetId: asset.id,
            date: today,
          },
        },
        update: {
          value: asset.currentValue,
        },
        create: {
          assetId: asset.id,
          value: asset.currentValue,
          date: today,
        },
      })

      return NextResponse.json(snapshot, { status: 201 })
    }

    // Snapshot all active assets
    const activeAssets = await prisma.asset.findMany({
      where: { isActive: true },
    })

    const snapshots = await prisma.$transaction(
      activeAssets.map((asset) =>
        prisma.assetSnapshot.upsert({
          where: {
            assetId_date: {
              assetId: asset.id,
              date: today,
            },
          },
          update: {
            value: asset.currentValue,
          },
          create: {
            assetId: asset.id,
            value: asset.currentValue,
            date: today,
          },
        })
      )
    )

    return NextResponse.json({ data: snapshots, count: snapshots.length }, { status: 201 })
  } catch (error) {
    console.error("Failed to create asset snapshots:", error)
    return NextResponse.json(
      { error: "자산 스냅샷을 생성하는데 실패했습니다" },
      { status: 500 }
    )
  }
}
