"use client"

import { Moon, Sun, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "./theme-provider"
import { useStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const currentUser = useStore((state) => state.currentUser)
  const logout = useStore((state) => state.logout)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Get user initials
  const userInitials = currentUser?.username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-gray-800 dark:to-gray-900 backdrop-blur-lg shadow-xl">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="md:hidden h-9 w-9 text-white hover:bg-white/20"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-white shadow-md"
            >
              <img
                src="/logojb.png"
                alt="Logo da Firma"
                className="h-full w-full object-contain" // Preserva proporção e preenche o container sem distorcer
              />
            </motion.div>
            <h1 className="text-sm sm:text-xl font-bold text-white hidden xs:block">Controle de Ferramentas</h1>
            <h1 className="text-sm font-bold text-white xs:hidden">JBricolage Tools</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex border-2 border-white/30 ring-2 ring-white/20 hover:ring-white/40 transition-all">
              <AvatarFallback className="bg-white/20 text-white text-xs font-semibold">{userInitials}</AvatarFallback>
            </Avatar>
            <span className="text-xs sm:text-sm text-white/90 hidden sm:inline">{currentUser?.username}</span>

            {mounted && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileTap={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleTheme}
                      aria-label="Alternar tema"
                      className="h-9 w-9 sm:h-10 sm:w-10 text-white hover:bg-white/20 rounded-xl"
                    >
                      {theme === "light" ? (
                        <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toque para alternar tema</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Sair"
                  className="h-9 w-9 sm:h-10 sm:w-10 text-white hover:bg-white/20 rounded-xl"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sair do sistema</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}