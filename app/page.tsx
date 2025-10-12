"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"

export default function HomePage() {
  const router = useRouter()
  const currentUser = useStore((state) => state.currentUser)

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [currentUser, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <p className="text-lg text-gray-600 dark:text-gray-400">Carregando...</p>
    </div>
  )
}