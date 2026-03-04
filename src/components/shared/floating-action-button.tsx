"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  onClick: () => void
  className?: string
}

export function FloatingActionButton({
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
        "bg-primary hover:bg-primary/90",
        "transition-transform hover:scale-105 active:scale-95",
        "md:bottom-8 md:right-8",
        className
      )}
      aria-label="거래 추가"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
