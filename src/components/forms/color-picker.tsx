"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const COLOR_PALETTE = [
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#EAB308", // yellow
  "#84CC16", // lime
  "#22C55E", // green
  "#10B981", // emerald
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#0EA5E9", // sky
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#A855F7", // purple
  "#D946EF", // fuchsia
  "#EC4899", // pink
  "#6B7280", // gray
  "#374151", // dark gray
]

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-9 gap-1.5">
      {COLOR_PALETTE.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110",
            value === color ? "border-foreground" : "border-transparent"
          )}
          style={{ backgroundColor: color }}
          title={color}
        >
          {value === color && <Check className="h-4 w-4 text-white" />}
        </button>
      ))}
    </div>
  )
}
