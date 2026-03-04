"use client"

import { cn } from "@/lib/utils"
import {
  Banknote,
  TrendingUp,
  Gift,
  LineChart,
  RotateCcw,
  Plus,
  UtensilsCrossed,
  Car,
  Home,
  Smartphone,
  Heart,
  GraduationCap,
  Film,
  ShoppingBag,
  Building2,
  Users,
  MoreHorizontal,
  Tag,
  Wallet,
  CreditCard,
  Coffee,
  Plane,
  Music,
  Briefcase,
  type LucideIcon,
} from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  Banknote,
  TrendingUp,
  Gift,
  LineChart,
  RotateCcw,
  Plus,
  UtensilsCrossed,
  Car,
  Home,
  Smartphone,
  Heart,
  GraduationCap,
  Film,
  ShoppingBag,
  Building2,
  Users,
  MoreHorizontal,
  Tag,
  Wallet,
  CreditCard,
  Coffee,
  Plane,
  Music,
  Briefcase,
}

export const ICON_NAMES = Object.keys(ICON_MAP)

export function getIconComponent(name: string): LucideIcon {
  return ICON_MAP[name] || Tag
}

interface IconPickerProps {
  value: string
  onChange: (value: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {ICON_NAMES.map((iconName) => {
        const Icon = ICON_MAP[iconName]
        return (
          <button
            key={iconName}
            type="button"
            onClick={() => onChange(iconName)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border transition-colors hover:bg-accent",
              value === iconName
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground"
            )}
            title={iconName}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
