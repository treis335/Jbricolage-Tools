"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useStore } from "./store"

interface AuthContextType {
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({ isAuthenticated: false })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((state) => state.currentUser)
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const authenticated = !!currentUser
    setIsAuthenticated(authenticated)

    if (!authenticated && pathname !== "/login") {
      router.push("/login")
    } else if (authenticated && pathname === "/login") {
      router.push("/dashboard")
    }
  }, [currentUser, pathname, router])

  return <AuthContext.Provider value={{ isAuthenticated }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
