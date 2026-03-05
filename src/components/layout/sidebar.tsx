"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  CreditCard,
  PiggyBank,
  Repeat,
  CalendarCheck,
  BarChart3,
  Settings,
  Wallet,
  Landmark,
} from "lucide-react"

const NAV_ITEMS = [
  { href: "", label: "대시보드", icon: LayoutDashboard },
  { href: "/transactions", label: "거래 관리", icon: ArrowLeftRight },
  { href: "/categories", label: "카테고리", icon: Tag },
  { href: "/payment-methods", label: "결제수단", icon: CreditCard },
  { href: "/budget", label: "예산 관리", icon: PiggyBank },
  { href: "/recurring", label: "정기 거래", icon: Repeat },
  { href: "/fixed-costs", label: "고정비용", icon: CalendarCheck },
  { href: "/assets", label: "자산 관리", icon: Landmark },
  { href: "/statistics", label: "통계", icon: BarChart3 },
  { href: "/settings", label: "설정", icon: Settings },
]

export function Sidebar({ hash }: { hash: string }) {
  const pathname = usePathname()
  const basePath = `/${hash}`

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <Link href={basePath} className="flex items-center gap-2 font-semibold">
          <Wallet className="h-5 w-5 text-primary" />
          <span>가계부</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map((item) => {
          const fullPath = `${basePath}${item.href}`
          const isActive =
            item.href === ""
              ? pathname === basePath
              : pathname.startsWith(fullPath)

          return (
            <Link
              key={item.href}
              href={fullPath}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
