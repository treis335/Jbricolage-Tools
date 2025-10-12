
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wrench, Users, ClipboardList, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "warehouse-manager"] },
  { name: "Ferramentas", href: "/ferramentas", icon: Wrench, roles: ["admin", "warehouse-manager"] },
  { name: "Usuários", href: "/usuarios", icon: Users, roles: ["admin", "warehouse-manager"] },
  { name: "Atribuições", href: "/atribuicoes", icon: ClipboardList, roles: ["admin", "warehouse-manager"] },
  { name: "Relatórios", href: "/relatorios", icon: FileText, roles: ["admin"] },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  disabled?: boolean
}

export function Sidebar({ isOpen = true, onClose, disabled = false }: SidebarProps) {
  const pathname = usePathname()
  const currentUser = useStore((state) => state.currentUser)
  const isQuickScanMode = useStore((state) => state.isQuickScanMode)

  const filteredNavigation = navigation.filter((item) => item.roles.includes(currentUser?.role || ""))

  const isDisabled = disabled || isQuickScanMode

  return (
    <>
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden"
          onClick={(e) => {
            e.preventDefault()
            onClose()
          }}
        />
      )}

      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 border-r bg-card shadow-lg transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside sidebar from closing it
      >
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 border-b bg-card">
          <span className="font-semibold text-foreground">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault()
                    return
                  }
                  onClose?.()
                }}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 sm:py-2 text-sm font-medium transition-colors touch-manipulation min-h-[44px]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
