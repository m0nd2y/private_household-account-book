"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  CreditCard,
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
  { href: "/assets", label: "자산 관리", icon: Landmark },
  { href: "/statistics", label: "통계", icon: BarChart3 },
  { href: "/settings", label: "설정", icon: Settings },
]

interface MobileNavProps {
  hash: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNav({ hash, open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname()
  const basePath = `/${hash}`

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <div className="flex h-14 items-center border-b px-6">
          <Link
            href={basePath}
            className="flex items-center gap-2 font-semibold"
            onClick={() => onOpenChange(false)}
          >
            <Wallet className="h-5 w-5 text-primary" />
            <span>가계부</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
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
                onClick={() => onOpenChange(false)}
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
      </SheetContent>
    </Sheet>
  )
}
