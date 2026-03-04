"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { useState } from "react"

export function Header({ hash }: { hash: string }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="flex h-14 items-center border-b bg-card px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <ThemeToggle />
      </header>
      <MobileNav hash={hash} open={mobileOpen} onOpenChange={setMobileOpen} />
    </>
  )
}
