import { notFound } from "next/navigation"
import { validateHash } from "@/lib/hash"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { hash: string }
}) {
  if (!validateHash(params.hash)) {
    notFound()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar hash={params.hash} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header hash={params.hash} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
